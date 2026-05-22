"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ChevronDown, ChevronUp, BookOpen, Lightbulb, Target, Mic, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";
import Link from "next/link";

interface InterviewQuestion {
  question: string;
  type: "behavioral" | "technical" | "situational" | "hr" | "star";
  sampleAnswer: string;
  tips: string[];
}

const TYPE_COLORS: Record<string, string> = {
  behavioral:  "bg-violet-500/10 text-violet-400 border-violet-500/20",
  technical:   "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  situational: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  hr:          "bg-blue-500/10 text-blue-400 border-blue-500/20",
  star:        "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
};

const LEVELS = ["Entry Level", "Mid Level", "Senior", "Lead", "Manager", "Director", "VP", "Executive"];
const INDUSTRIES = ["Technology", "Finance", "Healthcare", "Marketing", "Sales", "Product", "Design", "Data", "Operations", "Legal"];

interface InterviewPrepClientProps {
  isPremium?: boolean;
  prepsUsed?: number;
  prepsLimit?: number;
  masterResumeText?: string;
}

export function InterviewPrepClient({ isPremium = false, prepsUsed = 0, prepsLimit = 1, masterResumeText = "" }: InterviewPrepClientProps) {
  const router = useRouter();
  const [form, setForm] = useState({
    jobTitle: "",
    company: "",
    level: "Mid Level",
    industry: "Technology",
    jobDescription: "",
  });
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [overview, setOverview] = useState("");
  const [keyThemes, setKeyThemes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [error, setError] = useState("");
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const [done, setDone] = useState(false);

  const atLimit = !isPremium && prepsUsed >= prepsLimit;

  const handleGenerate = async () => {
    if (!form.jobTitle) return;
    setLoading(true);
    setError("");
    setQuestions([]);
    setOverview("");
    setKeyThemes([]);
    setDone(false);
    setStatusMsg("Connecting to AI...");
    setExpandedIdx(null);

    try {
      const res = await fetch("/api/interview-prep/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, resumeText: masterResumeText || undefined }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error || "Generation failed");
      }

      const reader = res.body!.getReader();
      const dec = new TextDecoder();
      let buf = "";
      let qCount = 0;

      while (true) {
        const { done: streamDone, value } = await reader.read();
        if (streamDone) break;

        buf += dec.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() ?? "";

        for (const line of lines) {
          const t = line.trim();
          if (!t.startsWith("data:")) continue;
          let event: { type: string; question?: InterviewQuestion; overview?: string; keyThemes?: string[]; message?: string } | null = null;
          try { event = JSON.parse(t.slice(5).trim()); } catch { /* skip malformed JSON */ }
          if (!event) continue;

          if (event.type === "question" && event.question) {
            qCount++;
            setStatusMsg(`Generating question ${qCount} of 20...`);
            setQuestions(prev => [...prev, event!.question!]);
            if (qCount === 1) setExpandedIdx(0);
          } else if (event.type === "meta") {
            setOverview(event.overview ?? "");
            setKeyThemes(event.keyThemes ?? []);
            setStatusMsg("Done!");
          } else if (event.type === "error") {
            throw new Error(event.message ?? "Generation failed");
          }
        }
      }

      setDone(true);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Usage banner */}
      {!isPremium && (
        <div className={cn(
          "flex items-center justify-between gap-3 rounded-xl border px-4 py-3",
          atLimit ? "border-destructive/30 bg-destructive/5" : "border-amber-500/30 bg-amber-500/5"
        )}>
          <div className="flex items-center gap-2.5">
            {atLimit ? <Lock className="h-4 w-4 text-destructive shrink-0" /> : <Mic className="h-4 w-4 text-amber-500 shrink-0" />}
            <div>
              <p className="text-sm font-medium">
                {atLimit ? "Monthly limit reached" : `${prepsUsed}/${prepsLimit} interview prep used this month`}
              </p>
              {atLimit && <p className="text-xs text-muted-foreground mt-0.5">Upgrade to Premium for unlimited access</p>}
            </div>
          </div>
          {atLimit && (
            <Button asChild variant="gradient" size="sm" className="shrink-0 h-8 text-xs">
              <Link href="/billing">Upgrade</Link>
            </Button>
          )}
        </div>
      )}

      {/* Input form */}
      <div className="rounded-2xl border border-border/50 bg-card/30 p-6">
        <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
          <Target className="h-4 w-4 text-primary" />
          Job Details
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Job Title *</label>
            <input
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              value={form.jobTitle}
              onChange={e => setForm(p => ({ ...p, jobTitle: e.target.value }))}
              placeholder="Senior Software Engineer"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Company</label>
            <input
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              value={form.company}
              onChange={e => setForm(p => ({ ...p, company: e.target.value }))}
              placeholder="Google, Meta, Stripe..."
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Level</label>
            <select
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              value={form.level}
              onChange={e => setForm(p => ({ ...p, level: e.target.value }))}
            >
              {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Industry</label>
            <select
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              value={form.industry}
              onChange={e => setForm(p => ({ ...p, industry: e.target.value }))}
            >
              {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>
          <div className="col-span-1 md:col-span-2">
            <label className="text-xs text-muted-foreground mb-1 block">Job Description (optional, improves accuracy)</label>
            <textarea
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              rows={4}
              value={form.jobDescription}
              onChange={e => setForm(p => ({ ...p, jobDescription: e.target.value }))}
              placeholder="Paste the job description here..."
            />
          </div>
        </div>
        {error && <p className="text-sm text-destructive mt-3">{error}</p>}
        <Button
          onClick={handleGenerate}
          disabled={!form.jobTitle || loading || atLimit}
          className="mt-4 w-full"
          size="lg"
        >
          {atLimit ? (
            <><Lock className="h-4 w-4 mr-2" />Monthly Limit Reached</>
          ) : (
            <><Sparkles className="h-4 w-4 mr-2" />{loading ? statusMsg : "Generate Interview Questions"}</>
          )}
        </Button>
      </div>

      {/* Streaming questions appear here as they generate */}
      {(questions.length > 0 || loading) && (
        <div className="space-y-4">
          {/* Overview — shows after all questions stream in */}
          {(overview || keyThemes.length > 0) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-primary/20 bg-primary/5 p-5"
            >
              <div className="flex items-start gap-3">
                <Mic className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold mb-1">Interview Overview</p>
                  {overview && <p className="text-sm text-muted-foreground">{overview}</p>}
                  {keyThemes.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {keyThemes.map(theme => (
                        <Badge key={theme} variant="secondary" className="text-xs">{theme}</Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Questions — appear one by one as they stream */}
          <div className="space-y-3">
            {questions.map((q, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="rounded-xl border border-border/50 bg-card/30 overflow-hidden"
              >
                <button
                  onClick={() => setExpandedIdx(expandedIdx === i ? null : i)}
                  className="w-full flex items-start gap-4 p-4 text-left hover:bg-accent/30 transition-colors"
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary mt-0.5">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={cn("text-[10px] border", TYPE_COLORS[q.type] || TYPE_COLORS.hr)}>
                        {q.type.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm font-medium">{q.question}</p>
                  </div>
                  {expandedIdx === i
                    ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                    : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />}
                </button>

                <AnimatePresence>
                  {expandedIdx === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 pt-0 border-t border-border/30 space-y-4">
                        <div>
                          <div className="flex items-center gap-1.5 mb-2 text-xs font-semibold text-emerald-400">
                            <BookOpen className="h-3.5 w-3.5" />
                            Sample Answer
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                            {q.sampleAnswer}
                          </p>
                        </div>
                        {q.tips?.length > 0 && (
                          <div>
                            <div className="flex items-center gap-1.5 mb-2 text-xs font-semibold text-amber-400">
                              <Lightbulb className="h-3.5 w-3.5" />
                              Pro Tips
                            </div>
                            <ul className="space-y-1">
                              {q.tips.map((tip, ti) => (
                                <li key={ti} className="text-xs text-muted-foreground flex items-start gap-2">
                                  <span className="text-primary mt-0.5">•</span>
                                  {tip}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}

            {/* Loading indicator for remaining questions */}
            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-xl border border-border/30 bg-card/20 p-4 flex items-center gap-3"
              >
                <div className="flex gap-1">
                  {[0, 1, 2].map(i => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 rounded-full bg-primary"
                      animate={{ scale: [1, 1.4, 1] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">{statusMsg}</span>
              </motion.div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
