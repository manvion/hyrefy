"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/toaster";
import { Wand2, Loader2, Copy, Check, Sparkles, Lock } from "lucide-react";
import type { RewriteMode, RewriteResult } from "@/types";
import { cn } from "@/lib/utils/cn";

const MODES: { id: RewriteMode; label: string; desc: string; premium: boolean }[] = [
  { id: "PROFESSIONAL", label: "Professional", desc: "Formal business language", premium: false },
  { id: "TECHNICAL", label: "Technical", desc: "Engineering precision", premium: true },
  { id: "EXECUTIVE", label: "Executive", desc: "Leadership & strategy", premium: true },
  { id: "STARTUP", label: "Startup", desc: "Dynamic & ownership-driven", premium: true },
];

export function RewriteClient() {
  const [inputText, setInputText] = useState("");
  const [selectedMode, setSelectedMode] = useState<RewriteMode>("PROFESSIONAL");
  const [result, setResult] = useState<RewriteResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [tab, setTab] = useState<"bullet" | "full">("bullet");

  const handleRewrite = async () => {
    if (!inputText.trim()) {
      toast({ title: "No content", description: "Enter resume text to rewrite", variant: "destructive" });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText, mode: selectedMode, type: tab }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setResult(data);
      toast({ title: "Rewrite complete!", variant: "success" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Rewrite failed";
      toast({ title: "Rewrite failed", description: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (result?.rewritten) {
      navigator.clipboard.writeText(result.rewritten);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({ title: "Copied!", variant: "success" });
    }
  };

  return (
    <div className="space-y-6">
      {/* Type selector */}
      <Tabs value={tab} onValueChange={(v) => setTab(v as "bullet" | "full")}>
        <TabsList>
          <TabsTrigger value="bullet">Rewrite Bullets</TabsTrigger>
          <TabsTrigger value="full">Full Resume</TabsTrigger>
        </TabsList>

        <TabsContent value="bullet" className="mt-0" />
        <TabsContent value="full" className="mt-0" />
      </Tabs>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input */}
        <div className="space-y-5">
          {/* Mode selector */}
          <div className="space-y-2">
            <Label>Rewrite Mode</Label>
            <div className="grid grid-cols-2 gap-2">
              {MODES.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setSelectedMode(mode.id)}
                  className={cn(
                    "relative text-left rounded-xl border p-3 transition-all duration-200",
                    selectedMode === mode.id
                      ? "border-primary/50 bg-primary/5"
                      : "border-border hover:border-border/80 hover:bg-accent/30"
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{mode.label}</span>
                    {mode.premium && (
                      <Badge variant="purple" className="text-[10px] px-1.5 py-0">
                        <Lock className="h-2.5 w-2.5 mr-0.5" />Pro
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{mode.desc}</p>
                  {selectedMode === mode.id && (
                    <motion.div
                      layoutId="mode-selected"
                      className="absolute inset-0 rounded-xl border-2 border-primary/50"
                      transition={{ duration: 0.15 }}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Text input */}
          <Card className="border-border/50 bg-card/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">
                {tab === "bullet" ? "Paste your bullet points" : "Paste your full resume"}
              </CardTitle>
              <CardDescription className="text-xs">
                {tab === "bullet"
                  ? "Paste one or more bullet points to rewrite"
                  : "Paste your entire resume text for a complete AI rewrite"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={
                  tab === "bullet"
                    ? "• Worked on backend systems\n• Helped with deployment\n• Participated in code reviews"
                    : "Paste your full resume text here..."
                }
                className={tab === "full" ? "min-h-[350px]" : "min-h-[200px]"}
              />
            </CardContent>
          </Card>

          <Button
            onClick={handleRewrite}
            disabled={loading || !inputText.trim()}
            variant="gradient"
            size="lg"
            className="w-full"
          >
            {loading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Rewriting with AI...</>
            ) : (
              <><Wand2 className="mr-2 h-4 w-4" />Rewrite with AI</>
            )}
          </Button>
        </div>

        {/* Output */}
        <AnimatePresence mode="wait">
          {result ? (
            <motion.div
              key="result"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      Rewritten — {selectedMode.charAt(0) + selectedMode.slice(1).toLowerCase()} Mode
                    </CardTitle>
                  </div>
                  <Button variant="ghost" size="sm" onClick={copyToClipboard}>
                    {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="text-sm whitespace-pre-wrap text-foreground leading-relaxed">
                    {result.rewritten}
                  </div>
                </CardContent>
              </Card>

              {result.improvements.length > 0 && (
                <Card className="border-border/50 bg-card/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs text-muted-foreground">What was improved</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1.5">
                      {result.improvements.map((imp, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                          <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          {imp}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {result.atsImpact && (
                <Card className="border-border/50 bg-card/30">
                  <CardContent className="p-4">
                    <p className="text-xs font-semibold text-primary mb-1">ATS Impact</p>
                    <p className="text-xs text-muted-foreground">{result.atsImpact}</p>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-2xl border border-dashed border-border/50 flex flex-col items-center justify-center min-h-[300px] text-center p-8"
            >
              <Wand2 className="h-10 w-10 text-muted-foreground mb-4" />
              <h3 className="text-base font-semibold mb-1">Rewritten content appears here</h3>
              <p className="text-sm text-muted-foreground">
                Paste your resume text and choose a rewrite mode
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
