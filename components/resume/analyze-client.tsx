"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/components/ui/toaster";
import {
  Loader2, Search, Target, AlertTriangle, CheckCircle,
  FileText, ClipboardPaste, Zap, Crown, ChevronRight, TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import type { ATSScore, JobAnalysis } from "@/types";
import { GeneratingProgress } from "@/components/ui/generating-progress";

const ANALYZE_STEPS = [
  { label: "Parsing your resume content", duration: 3000 },
  { label: "Matching keywords from job description", duration: 5000 },
  { label: "Scoring ATS compatibility", duration: 4000 },
  { label: "Generating improvement recommendations", duration: 5000 },
];

interface ScanResult {
  scanId: string;
  atsScore: ATSScore;
  jobAnalysis: JobAnalysis;
}

interface MasterResume {
  id: string;
  fileName: string;
  isMaster?: boolean;
  rawText?: string;
}

function ScoreRing({ score }: { score: number }) {
  const size = 120;
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const dash = (score / 100) * circumference;
  const color = score >= 80 ? "#10b981" : score >= 60 ? "#f59e0b" : "#ef4444";

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={60} cy={60} r={radius} fill="none" stroke="hsl(var(--muted))" strokeWidth="10" />
        <motion.circle
          cx={60} cy={60} r={radius}
          fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
          initial={{ strokeDasharray: `0 ${circumference}` }}
          animate={{ strokeDasharray: `${dash} ${circumference}` }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="text-3xl font-bold text-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {score}
        </motion.span>
        <span className="text-xs text-muted-foreground">/ 100</span>
      </div>
    </div>
  );
}

const inputCls = "w-full rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition";

export function AnalyzeClient() {
  const [inputMode, setInputMode] = useState<"master" | "paste">("master");
  const [masterResume, setMasterResume] = useState<MasterResume | null>(null);
  const [pastedText, setPastedText] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [scanLimit, setScanLimit] = useState<{ used: number; limit: number; isPremium: boolean } | null>(null);
  const [loadingResume, setLoadingResume] = useState(true);

  useEffect(() => {
    setLoadingResume(true);
    fetch("/api/resume/list")
      .then((r) => r.json())
      .then((data: MasterResume[]) => {
        const master = Array.isArray(data)
          ? (data.find((r) => r.isMaster) ?? data[0] ?? null)
          : null;
        setMasterResume(master);
        if (!master) setInputMode("paste");
      })
      .catch(() => setInputMode("paste"))
      .finally(() => setLoadingResume(false));

    fetch("/api/user/subscription")
      .then((r) => r.json())
      .then((data) => {
        if (data && typeof data.scansUsed === "number") {
          setScanLimit({ used: data.scansUsed, limit: data.scansLimit, isPremium: data.status === "PREMIUM" });
        }
      })
      .catch(() => {});
  }, []);

  const atLimit = !!scanLimit && !scanLimit.isPremium && scanLimit.used >= scanLimit.limit;

  const handleAnalyze = async () => {
    if (!jobDescription.trim()) {
      toast({ title: "Missing job description", description: "Paste the job description to analyze", variant: "destructive" });
      return;
    }
    if (inputMode === "paste" && pastedText.trim().length < 50) {
      toast({ title: "Resume text too short", description: "Paste your full resume text for accurate results", variant: "destructive" });
      return;
    }
    if (inputMode === "master" && !masterResume) {
      toast({ title: "No master resume", description: "Upload your master resume first or switch to paste mode", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const body: Record<string, string> = { jobDescription };
      if (jobTitle.trim()) body.jobTitle = jobTitle.trim();
      if (inputMode === "master" && masterResume) body.resumeId = masterResume.id;
      else body.resumeText = pastedText.trim();

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Analysis failed");

      setResult(data);
      toast({ title: "Analysis complete!", description: `ATS score: ${data.atsScore.overall}/100`, variant: "success" });
    } catch (err) {
      toast({ title: "Analysis failed", description: err instanceof Error ? err.message : "Try again", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 w-full">

      {/* ── Input panel — 2 cols ── */}
      <div className="lg:col-span-2 space-y-4">

        {/* Mode toggle */}
        <div className="flex gap-1 p-1 rounded-xl border border-border/50 bg-muted/30">
          {([
            { mode: "master" as const, icon: FileText, label: "Use My Resume" },
            { mode: "paste"  as const, icon: ClipboardPaste, label: "Paste Text" },
          ] as const).map(({ mode, icon: Icon, label }) => (
            <button
              key={mode}
              onClick={() => setInputMode(mode)}
              disabled={mode === "master" && !masterResume && !loadingResume}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all duration-150 active:scale-[0.97]",
                inputMode === mode
                  ? "bg-primary/15 text-primary border border-primary/30 font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50 disabled:opacity-40 disabled:cursor-not-allowed"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>

        {/* Resume source */}
        <div className="rounded-xl border border-border/50 bg-card p-4">
          {inputMode === "master" ? (
            loadingResume ? (
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-muted animate-pulse" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 w-32 bg-muted animate-pulse rounded" />
                  <div className="h-2.5 w-20 bg-muted animate-pulse rounded" />
                </div>
              </div>
            ) : masterResume ? (
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                  <FileText className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate text-foreground">{masterResume.fileName}</p>
                  <p className="text-xs text-muted-foreground">Master Resume · ready</p>
                </div>
                <Button asChild variant="ghost" size="sm" className="h-7 text-xs shrink-0">
                  <Link href="/resume/upload">Change</Link>
                </Button>
              </div>
            ) : (
              <div className="text-center py-3 space-y-3">
                <p className="text-sm text-muted-foreground">No master resume uploaded yet</p>
                <Button asChild variant="outline" size="sm">
                  <Link href="/resume/upload"><FileText className="mr-1.5 h-3.5 w-3.5" />Upload Resume</Link>
                </Button>
              </div>
            )
          ) : (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Paste your resume text</p>
              <textarea
                placeholder="Paste your complete resume text here..."
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                className={cn(inputCls, "min-h-[140px] resize-none")}
              />
              <p className="text-xs text-muted-foreground">{pastedText.length} characters</p>
            </div>
          )}
        </div>

        {/* Job description */}
        <div className="rounded-xl border border-border/50 bg-card p-4 space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Job Details</p>
          <input
            type="text"
            placeholder="Job title (optional)"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            className={inputCls}
          />
          <textarea
            placeholder="Paste the full job description here..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            className={cn(inputCls, "min-h-[180px] resize-none")}
          />
          <p className="text-xs text-muted-foreground">{jobDescription.split(/\s+/).filter(Boolean).length} words · Full JD gives best results</p>
        </div>

        {/* Usage indicator */}
        {scanLimit && !scanLimit.isPremium && (
          <div className={cn(
            "rounded-xl border px-4 py-3 flex items-center gap-3",
            atLimit ? "border-destructive/30 bg-destructive/5" : "border-border/40 bg-card/50"
          )}>
            <Zap className={cn("h-4 w-4 shrink-0", atLimit ? "text-destructive" : "text-amber-500")} />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-foreground">
                {atLimit ? "Monthly scan limit reached" : `${scanLimit.limit - scanLimit.used} scan${scanLimit.limit - scanLimit.used !== 1 ? "s" : ""} remaining`}
              </p>
              <p className="text-xs text-muted-foreground">{scanLimit.used} / {scanLimit.limit} used this month</p>
            </div>
            {atLimit && (
              <Button asChild size="sm" variant="gradient" className="h-7 text-xs gap-1 shrink-0">
                <Link href="/billing"><Crown className="h-3 w-3" />Upgrade</Link>
              </Button>
            )}
          </div>
        )}

        <Button
          onClick={handleAnalyze}
          disabled={
            loading || atLimit ||
            (!masterResume && inputMode === "master") ||
            (inputMode === "paste" && pastedText.trim().length < 50) ||
            !jobDescription.trim()
          }
          variant="gradient"
          size="lg"
          className="w-full"
        >
          <Search className="mr-2 h-4 w-4" />Check ATS Score
        </Button>
      </div>

      {/* ── Results panel — 3 cols ── */}
      <div className="lg:col-span-3">
        <AnimatePresence mode="wait">
          {loading ? (
            <GeneratingProgress
              key="loading"
              steps={ANALYZE_STEPS}
              title="Analyzing your resume"
              subtitle={jobTitle ? `For: ${jobTitle}` : "Checking ATS compatibility"}
              accentClass="text-cyan-400"
            />
          ) : result ? (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Score header */}
              <div className="rounded-xl border border-border/50 bg-card p-5">
                <div className="flex items-center gap-6 flex-wrap">
                  <ScoreRing score={result.atsScore.overall} />
                  <div className="flex-1 min-w-0 space-y-3">
                    <div>
                      <p className="text-lg font-bold text-foreground">
                        {result.atsScore.overall >= 80 ? "Strong Match" : result.atsScore.overall >= 60 ? "Good Match" : "Needs Work"}
                      </p>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {result.jobAnalysis.title || "Position"} compatibility
                      </p>
                    </div>
                    <div className="space-y-2">
                      {[
                        { label: "Keywords",    value: result.atsScore.keyword },
                        { label: "Formatting",  value: result.atsScore.formatting },
                        { label: "Experience",  value: result.atsScore.experience },
                      ].map(({ label, value }) => (
                        <div key={label} className="flex items-center gap-3">
                          <span className="text-xs text-muted-foreground w-20 shrink-0">{label}</span>
                          <Progress value={value} className="flex-1 h-2" />
                          <span className="text-xs font-semibold text-foreground w-8 text-right">{value}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Matched keywords */}
              {result.atsScore.matchedKeywords.length > 0 && (
                <div className="rounded-xl border border-border/50 bg-card p-4 space-y-3">
                  <p className="text-xs font-semibold flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">
                    <CheckCircle className="h-3.5 w-3.5" />
                    Matched Keywords ({result.atsScore.matchedKeywords.length})
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {result.atsScore.matchedKeywords.map((kw) => (
                      <span key={kw} className="text-[11px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25 rounded-full px-2.5 py-0.5 font-medium">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Missing keywords */}
              {result.atsScore.missingKeywords.length > 0 && (
                <div className="rounded-xl border border-border/50 bg-card p-4 space-y-3">
                  <p className="text-xs font-semibold flex items-center gap-1.5 text-amber-600 dark:text-amber-400 uppercase tracking-wide">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Missing Keywords ({result.atsScore.missingKeywords.length})
                  </p>
                  <p className="text-xs text-muted-foreground">Add these to your resume to improve your ATS score</p>
                  <div className="flex flex-wrap gap-1.5">
                    {result.atsScore.missingKeywords.map((kw) => (
                      <span key={kw} className="text-[11px] bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/25 rounded-full px-2.5 py-0.5 font-medium">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggestions */}
              {result.atsScore.suggestions.length > 0 && (
                <div className="rounded-xl border border-border/50 bg-card p-4 space-y-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Improvement Suggestions
                  </p>
                  <ul className="space-y-2">
                    {result.atsScore.suggestions.slice(0, 5).map((s, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm">
                        <ChevronRight className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                        <span className="text-foreground/80">{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* CTA */}
              <Button asChild variant="gradient" className="w-full" size="lg">
                <Link href="/generate">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Improve Resume with AI
                </Link>
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-full min-h-[480px] rounded-xl border border-dashed border-border/50 bg-card/20 flex flex-col items-center justify-center p-12 text-center"
            >
              <div className="h-16 w-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-5">
                <Target className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <h3 className="text-base font-semibold text-foreground mb-2">ATS score appears here</h3>
              <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
                Select your resume, paste a job description, and click <strong className="text-foreground">Check ATS Score</strong> to see your compatibility
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
