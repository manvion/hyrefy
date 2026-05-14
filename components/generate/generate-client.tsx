"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Download, Copy, Check, ChevronRight, Globe,
  Briefcase, FileText, Mail, ArrowLeft, TrendingUp, Zap,
  Edit3, Languages, Loader2, Wifi, Lock, Crown,
  Plus, Minus, BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";
import { SUPPORTED_COUNTRIES, type CountryCode } from "@/lib/ai/countries";
import Link from "next/link";

type Language = "en" | "fr";
type Step = "form" | "generating" | "result";

interface GenerateResult {
  tailoredResume: string;
  coverLetter: string;
  atsScoreBefore: number;
  atsScoreAfter: number;
  keyChanges: string[];
  matchedKeywords: string[];
}

interface StreamEvent {
  type: "ats_local" | "token" | "complete" | "error";
  content?: string;
  score?: number;
  matchedKeywords?: string[];
  missingKeywords?: string[];
  tailoredResume?: string;
  coverLetter?: string;
  atsScoreBefore?: number;
  atsScoreAfter?: number;
  keyChanges?: string[];
  message?: string;
}

interface Props {
  masterResumeText: string;
  masterResumeId?: string;
  defaultCountry?: string;
  scansUsed?: number;
  scansLimit?: number;
  isPremium?: boolean;
}

// ─── Usage banner ─────────────────────────────────────────────────────────────

function UsageBanner({ used, limit, isPremium }: { used: number; limit: number; isPremium: boolean }) {
  if (isPremium) return null;
  const remaining = Math.max(0, limit - used);
  const pct = Math.min(100, (used / limit) * 100);
  const atLimit = remaining === 0;

  return (
    <div className={cn(
      "rounded-xl border px-4 py-3 flex items-center gap-3",
      atLimit
        ? "border-destructive/30 bg-destructive/5"
        : remaining === 1
        ? "border-amber-500/30 bg-amber-500/5"
        : "border-border/50 bg-card/30"
    )}>
      <BarChart3 className={cn("h-4 w-4 shrink-0", atLimit ? "text-destructive" : remaining === 1 ? "text-amber-400" : "text-muted-foreground")} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium">
            {atLimit ? "Monthly limit reached" : `${remaining} improvement${remaining !== 1 ? "s" : ""} remaining this month`}
          </span>
          <span className="text-xs text-muted-foreground">{used}/{limit}</span>
        </div>
        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className={cn("h-full rounded-full transition-all", atLimit ? "bg-destructive" : remaining === 1 ? "bg-amber-400" : "bg-primary")}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
      {atLimit && (
        <Button asChild size="sm" variant="gradient" className="shrink-0 h-7 text-xs">
          <Link href="/billing"><Crown className="h-3 w-3 mr-1" />Upgrade</Link>
        </Button>
      )}
    </div>
  );
}

// ─── Download helper ──────────────────────────────────────────────────────────

function DownloadSection({
  label, icon: Icon, content, fileName, generatedLang,
}: {
  label: string; icon: React.ElementType;
  content: string; fileName: string; generatedLang: Language;
}) {
  const [translating, setTranslating] = useState<Language | null>(null);
  const [translated, setTranslated] = useState<Partial<Record<Language, string>>>({ [generatedLang]: content });
  const [copied, setCopied] = useState(false);

  useEffect(() => { setTranslated({ [generatedLang]: content }); }, [content, generatedLang]);

  const ensureLang = useCallback(async (lang: Language): Promise<string> => {
    if (translated[lang]) return translated[lang]!;
    setTranslating(lang);
    try {
      const res = await fetch("/api/generate/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: content, targetLanguage: lang, docType: label === "Cover Letter" ? "cover" : "resume" }),
      });
      const d = await res.json();
      const t = d.translated as string;
      setTranslated((p) => ({ ...p, [lang]: t }));
      return t;
    } catch { return content; } finally { setTranslating(null); }
  }, [content, generatedLang, label, translated]);

  const downloadPDF = async (lang: Language) => {
    const text = await ensureLang(lang);
    // Clean professional PDF — no watermarks, timestamps, or branding
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${fileName}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:Georgia,'Times New Roman',serif;font-size:11pt;line-height:1.55;color:#111;padding:40px 48px;max-width:820px;margin:0 auto}
pre{white-space:pre-wrap;font-family:inherit;font-size:11pt}
@media print{body{padding:20px}@page{margin:1.8cm;size:letter}}
</style></head><body><pre>${text.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</pre>
<script>window.onload=()=>{window.print()}<\/script></body></html>`;
    const url = URL.createObjectURL(new Blob([html], { type: "text/html" }));
    Object.assign(document.createElement("a"), { href: url, target: "_blank" }).click();
    URL.revokeObjectURL(url);
  };

  const downloadTxt = async (lang: Language) => {
    const text = await ensureLang(lang);
    const url = URL.createObjectURL(new Blob([text], { type: "text/plain" }));
    Object.assign(document.createElement("a"), {
      href: url,
      download: `${fileName.replace(/[^a-z0-9]/gi, "-").toLowerCase()}-${lang}.txt`,
    }).click();
    URL.revokeObjectURL(url);
  };

  const copyContent = async () => {
    const text = translated[generatedLang] ?? content;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl border border-border/50 bg-card/20 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border/30 bg-card/40">
        <Icon className="h-4 w-4 text-primary shrink-0" />
        <span className="text-sm font-semibold">{label}</span>
        <button className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors" onClick={copyContent}>
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <div className="p-4 space-y-3">
        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
          <Languages className="h-3.5 w-3.5" />
          Download as PDF or .txt · choose language:
        </p>
        <div className="grid grid-cols-2 gap-2">
          {(["en", "fr"] as Language[]).map((lang) => {
            const isGen = lang === generatedLang;
            const isLoading = translating === lang;
            return (
              <div key={lang} className={cn("rounded-lg border p-3 space-y-2", isGen ? "border-primary/30 bg-primary/5" : "border-border/40 bg-muted/10")}>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold">{lang === "en" ? "EN · English" : "FR · Français"}</span>
                  {isGen && <Badge variant="secondary" className="text-[10px] h-4 px-1">Generated</Badge>}
                  {!isGen && translated[lang] && <Badge variant="outline" className="text-[10px] h-4 px-1 text-emerald-400 border-emerald-500/30">Translated</Badge>}
                </div>
                <div className="flex gap-1.5">
                  <Button size="sm" variant={isGen ? "gradient" : "outline"} className="flex-1 h-7 text-xs" disabled={isLoading} onClick={() => downloadPDF(lang)}>
                    {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Download className="h-3 w-3 mr-1" />}PDF
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1 h-7 text-xs" disabled={isLoading} onClick={() => downloadTxt(lang)}>
                    {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <FileText className="h-3 w-3 mr-1" />}.txt
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Diff view — highlights additions/removals between two texts ──────────────

function ResumeDiffView({ original, improved }: { original: string; improved: string }) {
  const [viewMode, setViewMode] = useState<"split" | "improved">("improved");

  const origLines = original.split("\n");
  const impLines = improved.split("\n");
  const origSet = new Set(origLines.map(l => l.trim()));
  const impSet = new Set(impLines.map(l => l.trim()));

  return (
    <div className="rounded-2xl border border-border/50 bg-background overflow-hidden">
      <div className="bg-card/30 border-b border-border/30 px-4 py-2.5 flex items-center gap-2 flex-wrap">
        <div className="flex gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-red-500/50" />
          <div className="h-2.5 w-2.5 rounded-full bg-amber-500/50" />
          <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/50" />
        </div>
        <span className="text-xs text-muted-foreground ml-1">Resume Comparison</span>
        <div className="ml-auto flex bg-muted/30 rounded-lg p-0.5 border border-border/30">
          <button
            onClick={() => setViewMode("improved")}
            className={cn("px-3 py-1 rounded-md text-xs font-medium transition-all", viewMode === "improved" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}
          >
            Improved
          </button>
          <button
            onClick={() => setViewMode("split")}
            className={cn("px-3 py-1 rounded-md text-xs font-medium transition-all", viewMode === "split" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}
          >
            Compare
          </button>
        </div>
      </div>

      {viewMode === "improved" ? (
        <div className="p-5 h-[420px] overflow-y-auto">
          {impLines.map((line, i) => {
            const t = line.trim();
            const isNew = t && !origSet.has(t);
            return (
              <div key={i} className={cn("flex gap-2 text-sm leading-relaxed font-sans group", isNew && "bg-emerald-500/8 rounded-sm -mx-1 px-1")}>
                {isNew && <Plus className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5 opacity-60" />}
                {!isNew && <span className="w-3.5 shrink-0" />}
                <span className={cn(isNew ? "text-emerald-700 dark:text-emerald-300" : "text-foreground/85")}>
                  {line || " "}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-2 divide-x divide-border/30 h-[420px]">
          {/* Original */}
          <div className="overflow-y-auto p-4">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold mb-3">Original</p>
            {origLines.map((line, i) => {
              const t = line.trim();
              const removed = t && !impSet.has(t);
              return (
                <div key={i} className={cn("flex gap-1.5 text-xs leading-relaxed font-sans", removed && "bg-red-500/8 rounded-sm -mx-1 px-1")}>
                  {removed && <Minus className="h-3 w-3 text-red-500 shrink-0 mt-0.5 opacity-60" />}
                  {!removed && <span className="w-3 shrink-0" />}
                  <span className={cn(removed ? "text-red-700 dark:text-red-300" : "text-foreground/70")}>
                    {line || " "}
                  </span>
                </div>
              );
            })}
          </div>
          {/* Improved */}
          <div className="overflow-y-auto p-4">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold mb-3">Improved</p>
            {impLines.map((line, i) => {
              const t = line.trim();
              const added = t && !origSet.has(t);
              return (
                <div key={i} className={cn("flex gap-1.5 text-xs leading-relaxed font-sans", added && "bg-emerald-500/8 rounded-sm -mx-1 px-1")}>
                  {added && <Plus className="h-3 w-3 text-emerald-500 shrink-0 mt-0.5 opacity-60" />}
                  {!added && <span className="w-3 shrink-0" />}
                  <span className={cn(added ? "text-emerald-700 dark:text-emerald-300" : "text-foreground/85")}>
                    {line || " "}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="border-t border-border/30 px-4 py-2 bg-card/20 flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500/25 border border-emerald-500/40 inline-block" />
          Added / improved lines
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-red-500/25 border border-red-500/40 inline-block" />
          Replaced / removed lines
        </span>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function GenerateClient({
  masterResumeText,
  masterResumeId,
  defaultCountry = "CA",
  scansUsed = 0,
  scansLimit = 2,
  isPremium = false,
}: Props) {
  const [step, setStep] = useState<Step>("form");
  const [form, setForm] = useState({
    jobTitle: "",
    company: "",
    targetCountry: (SUPPORTED_COUNTRIES[defaultCountry as CountryCode] ? defaultCountry : "CA") as CountryCode,
    jobDescription: "",
    outputLanguage: "en" as Language,
  });
  const [result, setResult] = useState<GenerateResult | null>(null);
  const [editedResume, setEditedResume] = useState("");
  const [editedCover, setEditedCover] = useState("");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"diff" | "resume" | "cover">("diff");
  const [isEditing, setIsEditing] = useState<"resume" | "cover" | null>(null);

  const [streamBuffer, setStreamBuffer] = useState("");
  const [localAtsScore, setLocalAtsScore] = useState<number | null>(null);
  const [streamPhase, setStreamPhase] = useState<"connecting" | "streaming" | "cover" | "done">("connecting");
  const streamRef = useRef<HTMLPreElement>(null);

  const atLimit = !isPremium && scansUsed >= scansLimit;

  useEffect(() => {
    fetch("/api/geo").then(r => r.json()).then(d => {
      const code = d.country as string;
      if (SUPPORTED_COUNTRIES[code as CountryCode]) {
        setForm(p => ({ ...p, targetCountry: code as CountryCode }));
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (streamRef.current) streamRef.current.scrollTop = streamRef.current.scrollHeight;
  }, [streamBuffer]);

  const handleGenerate = async () => {
    if (!form.jobTitle || !form.jobDescription) return;
    setStep("generating");
    setError("");
    setStreamBuffer("");
    setLocalAtsScore(null);
    setStreamPhase("connecting");

    try {
      const res = await fetch("/api/generate/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, masterResumeText, resumeId: masterResumeId }),
      });
      if (!res.ok || !res.body) throw new Error("Stream unavailable");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let sseBuffer = "";
      setStreamPhase("streaming");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        sseBuffer += decoder.decode(value, { stream: true });
        const lines = sseBuffer.split("\n");
        sseBuffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.startsWith("data:")) continue;
          try { handleEvent(JSON.parse(line.slice(5).trim()) as StreamEvent); } catch { /* skip */ }
        }
      }
      return;
    } catch {
      setStreamPhase("connecting");
      await handleFallback();
    }
  };

  const handleEvent = (event: StreamEvent) => {
    switch (event.type) {
      case "ats_local":
        setLocalAtsScore(event.score ?? null);
        break;
      case "token":
        if (event.content) {
          setStreamBuffer(prev => {
            const combined = prev + event.content;
            const metaIdx = combined.indexOf("---META---");
            return metaIdx !== -1 ? combined.slice(0, metaIdx) : combined;
          });
        }
        break;
      case "complete":
        setEditedResume(event.tailoredResume ?? "");
        setEditedCover(event.coverLetter ?? "");
        setResult({
          tailoredResume: event.tailoredResume ?? "",
          coverLetter: event.coverLetter ?? "",
          atsScoreBefore: event.atsScoreBefore ?? 55,
          atsScoreAfter: event.atsScoreAfter ?? 80,
          keyChanges: event.keyChanges ?? [],
          matchedKeywords: event.matchedKeywords ?? [],
        });
        setStreamPhase("done");
        setStep("result");
        setActiveTab("diff");
        break;
      case "error":
        setError(event.message ?? "Generation failed");
        setStep("form");
        break;
    }
  };

  const handleFallback = async () => {
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, masterResumeText, resumeId: masterResumeId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");
      setResult(data);
      setEditedResume(data.tailoredResume);
      setEditedCover(data.coverLetter);
      setStep("result");
      setActiveTab("diff");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setStep("form");
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold">Improve My Resume</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Paste a job description — get a tailored resume + cover letter in ~20 seconds
        </p>
      </div>

      <AnimatePresence mode="wait">

        {/* ── STEP 1: FORM ──────────────────────────────────────────────────── */}
        {step === "form" && (
          <motion.div key="form" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="space-y-4">

            <UsageBanner used={scansUsed} limit={scansLimit} isPremium={isPremium} />

            {atLimit && (
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 flex items-start gap-3">
                <Lock className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold">Monthly limit reached</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    You&apos;ve used all {scansLimit} free improvements this month.{" "}
                    <Link href="/billing" className="text-primary underline">Upgrade to Premium</Link> for unlimited access.
                  </p>
                </div>
              </div>
            )}

            <div className="rounded-2xl border border-border/50 bg-card/30 p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">
                    Job Title <span className="text-primary">*</span>
                  </label>
                  <input
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
                    value={form.jobTitle}
                    onChange={e => setForm(p => ({ ...p, jobTitle: e.target.value }))}
                    placeholder="Senior Software Engineer"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Company</label>
                  <input
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
                    value={form.company}
                    onChange={e => setForm(p => ({ ...p, company: e.target.value }))}
                    placeholder="Shopify, Deloitte, BNP..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">
                    <Globe className="inline h-3 w-3 mr-1" />Country <span className="text-primary">*</span>
                  </label>
                  <select
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
                    value={form.targetCountry}
                    onChange={e => setForm(p => ({ ...p, targetCountry: e.target.value as CountryCode }))}
                  >
                    {(Object.entries(SUPPORTED_COUNTRIES) as [CountryCode, { name: string; flag: string }][]).map(([code, info]) => (
                      <option key={code} value={code}>{info.flag} {info.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Output Language <span className="text-primary">*</span></label>
                  <div className="flex gap-2 p-1 rounded-xl border border-border bg-muted/20">
                    {(["en", "fr"] as Language[]).map(lang => (
                      <button key={lang} type="button"
                        onClick={() => setForm(p => ({ ...p, outputLanguage: lang }))}
                        className={cn("flex-1 rounded-lg py-2 text-sm font-semibold transition-all duration-150",
                          form.outputLanguage === lang ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                        )}
                      >{lang === "en" ? "EN · English" : "FR · Français"}</button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">
                  Job Description <span className="text-primary">*</span>
                </label>
                <textarea
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition resize-none"
                  rows={8}
                  value={form.jobDescription}
                  onChange={e => setForm(p => ({ ...p, jobDescription: e.target.value }))}
                  placeholder="Paste the full job description here..."
                />
                <div className="flex items-center justify-between mt-1">
                  <p className="text-[11px] text-muted-foreground">{form.jobDescription.split(/\s+/).filter(Boolean).length} words</p>
                  <p className="text-[11px] text-muted-foreground">Recommended: 200–800 words</p>
                </div>
              </div>

              {error && (
                <div className="rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              <Button
                onClick={handleGenerate}
                disabled={!form.jobTitle || !form.jobDescription || atLimit}
                size="lg"
                className="w-full text-base h-12 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 shadow-lg shadow-primary/25"
              >
                {atLimit
                  ? <><Lock className="h-4 w-4 mr-2" />Limit Reached — Upgrade to Continue</>
                  : <><Sparkles className="h-5 w-5 mr-2" />Improve Resume + Generate Cover Letter<ChevronRight className="h-4 w-4 ml-2" /></>
                }
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: FileText,   label: "Tailored Resume",  desc: "Adapted to role and country" },
                { icon: Mail,       label: "Cover Letter",     desc: "Personalized, professional" },
                { icon: TrendingUp, label: "ATS Score",        desc: "Before & after comparison" },
              ].map(item => (
                <div key={item.label} className="rounded-xl border border-border/40 bg-card/20 p-3.5 text-center">
                  <item.icon className="h-5 w-5 text-primary mx-auto mb-2" />
                  <p className="text-xs font-semibold">{item.label}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{item.desc}</p>
                </div>
              ))}
            </div>

            {/* Premium upsell for free users */}
            {!isPremium && (
              <div className="rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 to-blue-500/5 p-4 flex items-center gap-4">
                <Crown className="h-8 w-8 text-primary shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-semibold">Unlock unlimited improvements</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Premium gives you unlimited resume improvements, ATS analyses, and more.</p>
                </div>
                <Button asChild size="sm" variant="gradient" className="shrink-0">
                  <Link href="/billing">Upgrade</Link>
                </Button>
              </div>
            )}
          </motion.div>
        )}

        {/* ── STEP 2: GENERATING ────────────────────────────────────────────── */}
        {step === "generating" && (
          <motion.div key="generating" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            <div className="rounded-2xl border border-border/50 bg-card/30 p-6">
              <div className="flex items-center gap-4">
                <div className="relative h-14 w-14 shrink-0">
                  <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping" />
                  <div className="relative h-14 w-14 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center">
                    <Sparkles className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-base font-bold">
                    {streamPhase === "connecting" ? "Connecting to AI..." : "Improving your resume"}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {form.jobTitle}{form.company ? ` at ${form.company}` : ""}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Wifi className={cn("h-3.5 w-3.5 transition-colors", streamPhase === "streaming" ? "text-emerald-400" : "text-muted-foreground")} />
                    <span className="text-xs text-muted-foreground">
                      {streamPhase === "connecting" && "Establishing connection..."}
                      {streamPhase === "streaming" && "Writing your tailored resume..."}
                      {streamPhase === "cover" && "Finalizing cover letter..."}
                      {streamPhase === "done" && "Done!"}
                    </span>
                    {localAtsScore !== null && (
                      <Badge variant="secondary" className="text-xs ml-auto">
                        Current ATS: {localAtsScore}%
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {streamBuffer && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-primary/20 bg-card/30 overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border/30 bg-card/50">
                  <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs text-muted-foreground">Live preview</span>
                  <span className="ml-auto text-xs text-muted-foreground">{streamBuffer.split(/\s+/).filter(Boolean).length} words</span>
                </div>
                <pre ref={streamRef} className="p-4 text-xs leading-relaxed whitespace-pre-wrap font-sans text-foreground/85 max-h-[320px] overflow-y-auto">
                  {streamBuffer}
                  <span className="inline-block w-0.5 h-3.5 bg-primary animate-pulse ml-0.5 align-text-bottom" />
                </pre>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* ── STEP 3: RESULTS ───────────────────────────────────────────────── */}
        {step === "result" && result && (
          <motion.div key="result" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">

            {/* ATS score improvement */}
            <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-r from-emerald-500/5 to-blue-500/5 p-5 flex items-center gap-5 flex-wrap">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-0.5">Before</p>
                  <div className="h-14 w-14 rounded-xl bg-muted/50 border border-border/50 flex flex-col items-center justify-center">
                    <span className="text-xl font-black text-muted-foreground">{result.atsScoreBefore}</span>
                    <span className="text-[9px] text-muted-foreground">ATS</span>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <TrendingUp className="h-5 w-5 text-emerald-400" />
                  <span className="text-xs font-bold text-emerald-400">+{result.atsScoreAfter - result.atsScoreBefore}</span>
                </div>
                <div className="text-center">
                  <p className="text-xs text-emerald-400 mb-0.5">After</p>
                  <div className="h-14 w-14 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col items-center justify-center">
                    <span className="text-xl font-black text-emerald-400">{result.atsScoreAfter}</span>
                    <span className="text-[9px] text-emerald-400">ATS</span>
                  </div>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold">Resume optimized for {form.jobTitle}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {SUPPORTED_COUNTRIES[form.targetCountry].flag} {SUPPORTED_COUNTRIES[form.targetCountry].name} · {form.outputLanguage === "fr" ? "Français" : "English"}
                </p>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {form.company && <Badge variant="secondary" className="text-xs">{form.company}</Badge>}
                  <Badge variant="outline" className="text-xs text-emerald-400 border-emerald-500/30">
                    {result.matchedKeywords.length} keywords matched
                  </Badge>
                </div>
              </div>
            </div>

            {/* What was improved */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl border border-border/40 bg-card/20 p-4">
                <p className="text-xs font-semibold uppercase text-muted-foreground tracking-wide mb-3 flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5 text-primary" /> What Was Improved
                </p>
                <ul className="space-y-1.5">
                  {result.keyChanges.map((change, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                      <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />{change}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl border border-border/40 bg-card/20 p-4">
                <p className="text-xs font-semibold uppercase text-muted-foreground tracking-wide mb-3 flex items-center gap-1.5">
                  <Briefcase className="h-3.5 w-3.5 text-primary" /> Keywords Matched
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {result.matchedKeywords.map(kw => (
                    <Badge key={kw} variant="secondary" className="text-[11px]">{kw}</Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Tabs: Compare / Resume / Cover Letter */}
            <div className="flex gap-2 border-b border-border/40 pb-2">
              {([
                { key: "diff",   label: "Changes",       icon: TrendingUp },
                { key: "resume", label: "Resume",         icon: FileText   },
                { key: "cover",  label: "Cover Letter",   icon: Mail       },
              ] as const).map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={cn("px-4 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5",
                    activeTab === key ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </button>
              ))}
            </div>

            {/* Diff / Document panels */}
            {activeTab === "diff" && (
              <ResumeDiffView original={masterResumeText} improved={editedResume} />
            )}

            {(activeTab === "resume" || activeTab === "cover") && (
              <div className="rounded-2xl border border-border/50 bg-background overflow-hidden">
                <div className="bg-card/30 border-b border-border/30 px-4 py-2.5 flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="h-2.5 w-2.5 rounded-full bg-red-500/50" />
                    <div className="h-2.5 w-2.5 rounded-full bg-amber-500/50" />
                    <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/50" />
                  </div>
                  <span className="text-xs text-muted-foreground ml-2">
                    {activeTab === "resume" ? `${form.jobTitle} — Improved Resume` : `Cover Letter — ${form.jobTitle}`}
                  </span>
                  <button
                    onClick={() => setIsEditing(isEditing === activeTab ? null : activeTab as "resume" | "cover")}
                    className={cn("ml-auto flex items-center gap-1.5 text-xs rounded-lg px-2.5 py-1 transition-colors",
                      isEditing === activeTab ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    )}
                  >
                    <Edit3 className="h-3 w-3" />
                    {isEditing === activeTab ? "Done" : "Edit"}
                  </button>
                </div>
                <div className="p-6 h-[460px] overflow-y-auto">
                  {isEditing === activeTab ? (
                    <textarea
                      className="w-full h-full text-sm leading-relaxed font-sans bg-transparent border-none outline-none resize-none text-foreground/90"
                      value={activeTab === "resume" ? editedResume : editedCover}
                      onChange={(e) => activeTab === "resume" ? setEditedResume(e.target.value) : setEditedCover(e.target.value)}
                    />
                  ) : (
                    <pre className="text-sm leading-relaxed whitespace-pre-wrap font-sans text-foreground/90">
                      {activeTab === "resume" ? editedResume : editedCover}
                    </pre>
                  )}
                </div>
              </div>
            )}

            {/* Download sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DownloadSection
                label="Improved Resume" icon={FileText}
                content={editedResume}
                fileName={`Resume-${form.jobTitle}${form.company ? `-${form.company}` : ""}`}
                generatedLang={form.outputLanguage}
              />
              <DownloadSection
                label="Cover Letter" icon={Mail}
                content={editedCover}
                fileName={`CoverLetter-${form.jobTitle}${form.company ? `-${form.company}` : ""}`}
                generatedLang={form.outputLanguage}
              />
            </div>

            <Button variant="outline" onClick={() => setStep("form")} className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" /> Improve for Another Job
            </Button>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
