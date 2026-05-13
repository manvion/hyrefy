"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Share2, Copy, Check, AlertTriangle, CheckCircle, AlertCircle, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";

interface RoastIssue {
  category: string;
  severity: "critical" | "major" | "minor";
  description: string;
  fix: string;
}

interface RoastResult {
  roastText: string;
  score: number;
  grade: string;
  issues: RoastIssue[];
  buzzwords: string[];
  weakVerbs: string[];
  strengths: string[];
  shareToken?: string;
}

const GRADE_COLORS: Record<string, { text: string; bg: string; ring: string }> = {
  F: { text: "text-red-400",     bg: "bg-red-500/10",     ring: "ring-red-500/30" },
  D: { text: "text-orange-400",  bg: "bg-orange-500/10",  ring: "ring-orange-500/30" },
  C: { text: "text-amber-400",   bg: "bg-amber-500/10",   ring: "ring-amber-500/30" },
  B: { text: "text-yellow-400",  bg: "bg-yellow-500/10",  ring: "ring-yellow-500/30" },
  A: { text: "text-emerald-400", bg: "bg-emerald-500/10", ring: "ring-emerald-500/30" },
  S: { text: "text-primary",     bg: "bg-primary/10",     ring: "ring-primary/30" },
};

const SEVERITY_CONFIG = {
  critical: { icon: AlertTriangle, color: "text-red-400",    bg: "bg-red-500/10",    label: "Critical" },
  major:    { icon: AlertCircle,   color: "text-amber-400",  bg: "bg-amber-500/10",  label: "Major" },
  minor:    { icon: Zap,           color: "text-blue-400",   bg: "bg-blue-500/10",   label: "Minor" },
};

export function RoastClient() {
  const [resumeText, setResumeText] = useState("");
  const [result, setResult] = useState<RoastResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const handleRoast = async () => {
    if (!resumeText.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/roast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Roast failed");
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!result?.shareToken) return;
    const url = `${window.location.origin}/roast/${result.shareToken}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const gradeStyle = result ? (GRADE_COLORS[result.grade] || GRADE_COLORS.C) : GRADE_COLORS.C;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Input */}
      {!result && (
        <div className="rounded-2xl border border-border/50 bg-card/30 p-6">
          <label className="text-sm font-medium mb-2 block">Paste your resume text</label>
          <textarea
            className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none font-mono"
            rows={14}
            value={resumeText}
            onChange={e => setResumeText(e.target.value)}
            placeholder="Paste your full resume text here. The AI will analyze every word..."
          />
          <p className="text-xs text-muted-foreground mt-2">
            {resumeText.length} characters · {resumeText.split(/\s+/).filter(Boolean).length} words
          </p>
          {error && <p className="text-sm text-destructive mt-3">{error}</p>}
          <Button
            onClick={handleRoast}
            disabled={!resumeText.trim() || loading}
            className="mt-4 w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
            size="lg"
          >
            {loading ? (
              <><div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />Roasting your resume...</>
            ) : (
              <><Flame className="h-4 w-4 mr-2" />Roast My Resume</>
            )}
          </Button>
        </div>
      )}

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
            {/* Score card */}
            <div className="rounded-2xl border border-border/50 bg-card/30 p-6">
              <div className="flex items-center gap-6">
                <div className={cn("h-24 w-24 rounded-2xl ring-4 flex flex-col items-center justify-center shrink-0", gradeStyle.bg, gradeStyle.ring)}>
                  <span className={cn("text-4xl font-black", gradeStyle.text)}>{result.grade}</span>
                  <span className="text-xs text-muted-foreground">{result.score}/100</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h2 className="text-lg font-bold">Your Resume Score</h2>
                    <div className="flex gap-2">
                      {result.shareToken && (
                        <Button size="sm" variant="outline" onClick={handleShare}>
                          {copied ? <Check className="h-3.5 w-3.5 mr-1.5 text-emerald-400" /> : <Share2 className="h-3.5 w-3.5 mr-1.5" />}
                          {copied ? "Copied!" : "Share Roast"}
                        </Button>
                      )}
                      <Button size="sm" variant="outline" onClick={() => { setResult(null); setResumeText(""); }}>
                        Roast Again
                      </Button>
                    </div>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${result.score}%` }}
                      transition={{ duration: 1, delay: 0.3 }}
                      className={cn("h-full rounded-full", result.score >= 80 ? "bg-emerald-500" : result.score >= 60 ? "bg-amber-500" : "bg-red-500")}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {result.score >= 80 ? "Strong resume — minor tweaks needed" :
                     result.score >= 60 ? "Average — significant improvements possible" :
                     result.score >= 40 ? "Below average — major overhaul needed" :
                     "Critical issues — start with the fixes below"}
                  </p>
                </div>
              </div>
            </div>

            {/* Roast text */}
            <div className="rounded-2xl border border-orange-500/20 bg-orange-500/5 p-6">
              <div className="flex items-center gap-2 mb-3">
                <Flame className="h-4 w-4 text-orange-400" />
                <h3 className="text-sm font-semibold text-orange-400">The Honest Assessment</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{result.roastText}</p>
            </div>

            {/* Issues */}
            <div className="rounded-2xl border border-border/50 bg-card/30 p-6">
              <h3 className="text-sm font-semibold mb-4">Issues Found ({result.issues?.length || 0})</h3>
              <div className="space-y-3">
                {result.issues?.map((issue, i) => {
                  const cfg = SEVERITY_CONFIG[issue.severity] || SEVERITY_CONFIG.minor;
                  const Icon = cfg.icon;
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={cn("rounded-lg p-4", cfg.bg)}
                    >
                      <div className="flex items-start gap-3">
                        <Icon className={cn("h-4 w-4 mt-0.5 shrink-0", cfg.color)} />
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-semibold">{issue.category}</span>
                            <Badge className={cn("text-[10px]", cfg.color, cfg.bg)}>{cfg.label}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{issue.description}</p>
                          <p className="text-xs text-foreground/80 flex items-start gap-1.5">
                            <span className="text-emerald-400 font-bold shrink-0">Fix:</span>
                            {issue.fix}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Buzzwords & Weak Verbs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.buzzwords?.length > 0 && (
                <div className="rounded-xl border border-border/50 bg-card/30 p-4">
                  <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-3">Buzzwords Detected</h4>
                  <div className="flex flex-wrap gap-2">
                    {result.buzzwords.map(w => (
                      <Badge key={w} variant="secondary" className="text-xs line-through opacity-60">{w}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {result.weakVerbs?.length > 0 && (
                <div className="rounded-xl border border-border/50 bg-card/30 p-4">
                  <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-3">Weak Verbs</h4>
                  <div className="flex flex-wrap gap-2">
                    {result.weakVerbs.map(w => (
                      <Badge key={w} variant="secondary" className="text-xs text-amber-400/70">{w}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Strengths */}
            {result.strengths?.length > 0 && (
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                <h4 className="text-xs font-semibold uppercase text-emerald-400 mb-3">What&apos;s Working</h4>
                <ul className="space-y-1.5">
                  {result.strengths.map((s, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <CheckCircle className="h-3.5 w-3.5 text-emerald-400 mt-0.5 shrink-0" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
