"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RichTextEditor, plainTextToHtml, htmlToPlainText } from "@/components/ui/rich-text-editor";
import {
  Sparkles, Download, Copy, Check, ChevronRight, Globe,
  Briefcase, FileText, Mail, ArrowLeft, TrendingUp, Zap,
  Edit3, Wifi, Lock, Crown,
  Plus, Minus, BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";
import { SUPPORTED_COUNTRIES, type CountryCode } from "@/lib/ai/countries";
import Link from "next/link";
import { ResumePreview, CoverLetterPreview, COUNTRY_STYLES } from "@/components/resume/resume-preview";

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
          <span className="text-xs font-medium text-foreground">
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

// ─── Document panel — large preview + inline edit + download ──────────────────

function DocumentPanel({
  title, icon: Icon, content, onContentChange, fileName, generatedLang,
  accentColor = "#0A66C2", fontFamily = "'Arial', sans-serif", isCoverLetter = false,
  nameAlign = "center", sectionStyle = "underline",
}: {
  title: string;
  icon: React.ElementType;
  content: string;
  onContentChange: (v: string) => void;
  fileName: string;
  generatedLang: Language;
  accentColor?: string;
  fontFamily?: string;
  isCoverLetter?: boolean;
  nameAlign?: "center" | "left";
  sectionStyle?: "underline" | "left-border" | "minimal" | "filled";
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editHtml, setEditHtml] = useState("");
  const [copied, setCopied] = useState(false);

  const downloadPDF = () => {
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${fileName}</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:${fontFamily};font-size:11pt;line-height:1.55;color:#111;padding:40px 48px;max-width:820px;margin:0 auto}pre{white-space:pre-wrap;font-family:inherit;font-size:11pt}@media print{body{padding:20px}@page{margin:1.8cm;size:letter}}</style>
</head><body><pre>${content.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</pre>
<script>window.onload=()=>{window.print()}<\/script></body></html>`;
    const url = URL.createObjectURL(new Blob([html], { type: "text/html" }));
    Object.assign(document.createElement("a"), { href: url, target: "_blank" }).click();
    URL.revokeObjectURL(url);
  };

  const downloadDocx = async () => {
    const { Document, Paragraph, TextRun, AlignmentType, Packer, BorderStyle } = await import("docx");
    const lines = content.split("\n");
    const firstContent = lines.find(l => l.trim()) ?? "";
    const children: InstanceType<typeof Paragraph>[] = [];
    let passedName = false;
    for (const line of lines) {
      const t = line.trim();
      if (line === firstContent && !passedName) {
        passedName = true;
        children.push(new Paragraph({ children: [new TextRun({ text: t, bold: true, size: 48, color: "0A66C2" })], alignment: AlignmentType.CENTER, spacing: { after: 120 } }));
        continue;
      }
      if (!passedName) continue;
      if (!t) { children.push(new Paragraph({ text: "" })); continue; }
      if (t === t.toUpperCase() && t.length > 2 && t.length < 60 && !t.match(/^[•\-–—*]/)) {
        children.push(new Paragraph({ children: [new TextRun({ text: t, bold: true, size: 22, color: "0A66C2" })], spacing: { before: 240, after: 80 }, border: { bottom: { color: "0A66C2", size: 6, style: BorderStyle.SINGLE, space: 4 } } }));
        continue;
      }
      if (t.match(/^[•\-–—*]\s/)) {
        children.push(new Paragraph({ children: [new TextRun({ text: t.replace(/^[•\-–—*]\s/, ""), size: 20 })], bullet: { level: 0 } }));
        continue;
      }
      children.push(new Paragraph({ children: [new TextRun({ text: t, size: 20 })], spacing: { after: 40 } }));
    }
    const doc = new Document({ sections: [{ properties: {}, children }] });
    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    Object.assign(document.createElement("a"), { href: url, download: `${fileName.replace(/[^a-z0-9]/gi, "-").toLowerCase()}-${generatedLang}.docx` }).click();
    URL.revokeObjectURL(url);
  };

  const copyContent = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col rounded-2xl border border-border/50 bg-card overflow-hidden shadow-sm">
      {/* Panel header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border/40 bg-card shrink-0">
        <Icon className="h-4 w-4 text-primary shrink-0" />
        <span className="text-sm font-semibold truncate flex-1 text-foreground">{title}</span>
        <button
          onClick={copyContent}
          className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent active:bg-accent/80 active:scale-[0.97] transition-all"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
          <span className="hidden sm:inline">{copied ? "Copied!" : "Copy"}</span>
        </button>
        <button
          onClick={() => {
            const next = !isEditing;
            setIsEditing(next);
            if (next) setEditHtml(plainTextToHtml(content));
            else onContentChange(htmlToPlainText(editHtml));
          }}
          className={cn(
            "flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg transition-all active:scale-[0.97]",
            isEditing
              ? "bg-primary/15 text-primary ring-1 ring-primary/30 hover:bg-primary/20"
              : "text-muted-foreground hover:text-foreground hover:bg-accent active:bg-accent/80"
          )}
        >
          <Edit3 className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">{isEditing ? "Done" : "Edit"}</span>
        </button>
      </div>

      {/* Document body */}
      <div className="flex-1 overflow-y-auto">
        {isEditing ? (
          <RichTextEditor
            content={editHtml}
            onChange={setEditHtml}
            minHeight={540}
            className="rounded-none border-0 border-none"
          />
        ) : isCoverLetter ? (
          <div className="bg-white min-h-[540px]">
            <CoverLetterPreview text={content} accentColor={accentColor} fontFamily={fontFamily} />
          </div>
        ) : (
          <div className="bg-gray-100/80 dark:bg-gray-200/10 py-4 px-3 min-h-[540px]">
            <ResumePreview text={content} accentColor={accentColor} fontFamily={fontFamily} nameAlign={nameAlign} sectionStyle={sectionStyle} />
          </div>
        )}
      </div>

      {/* Download footer */}
      <div className="border-t border-border/40 px-4 py-3 bg-card shrink-0">
        <div className="flex gap-2">
          <Button size="sm" variant="gradient" className="h-8 text-xs gap-1.5" onClick={downloadPDF}>
            <Download className="h-3 w-3" />PDF
          </Button>
          <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5" onClick={downloadDocx}>
            <FileText className="h-3 w-3" />.docx
          </Button>
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
      <div className="bg-card border-b border-border/30 px-4 py-2.5 flex items-center gap-2 flex-wrap">
        <div className="flex gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-red-500/50" />
          <div className="h-2.5 w-2.5 rounded-full bg-amber-500/50" />
          <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/50" />
        </div>
        <span className="text-xs text-muted-foreground ml-1">Resume Comparison</span>
        <div className="ml-auto flex bg-muted/30 rounded-lg p-0.5 border border-border/30">
          <button
            onClick={() => setViewMode("improved")}
            className={cn("px-3 py-1 rounded-md text-xs font-medium transition-all active:scale-[0.97]", viewMode === "improved" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}
          >
            Improved
          </button>
          <button
            onClick={() => setViewMode("split")}
            className={cn("px-3 py-1 rounded-md text-xs font-medium transition-all active:scale-[0.97]", viewMode === "split" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}
          >
            Compare
          </button>
        </div>
      </div>

      {viewMode === "improved" ? (
        <div className="p-5 h-[380px] overflow-y-auto">
          {impLines.map((line, i) => {
            const t = line.trim();
            const isNew = t && !origSet.has(t);
            return (
              <div key={i} className={cn("flex gap-2 text-sm leading-relaxed font-sans group", isNew && "bg-emerald-500/8 rounded-sm -mx-1 px-1")}>
                {isNew && <Plus className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5 opacity-60" />}
                {!isNew && <span className="w-3.5 shrink-0" />}
                <span className={cn(isNew ? "text-emerald-700 dark:text-emerald-300" : "text-foreground/85")}>
                  {line || " "}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-2 divide-x divide-border/30 h-[380px]">
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
                    {line || " "}
                  </span>
                </div>
              );
            })}
          </div>
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
                    {line || " "}
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
  const [showDiff, setShowDiff] = useState(false);

  const [streamBuffer, setStreamBuffer] = useState("");
  const [localAtsScore, setLocalAtsScore] = useState<number | null>(null);
  const [streamPhase, setStreamPhase] = useState<"connecting" | "streaming" | "cover" | "done">("connecting");
  const streamRef = useRef<HTMLPreElement>(null);

  const atLimit = !isPremium && scansUsed >= scansLimit;
  const countryStyle = COUNTRY_STYLES[form.targetCountry] ?? { accentColor: "#0A66C2", fontFamily: "'Arial', sans-serif" };

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
    setShowDiff(false);

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
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setStep("form");
    }
  };

  // Shared input class for consistent dark/light mode appearance
  const inputCls = "w-full rounded-xl border border-border bg-background text-foreground px-3.5 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition";

  return (
    <div className={cn("mx-auto space-y-5", step === "result" ? "max-w-full" : "max-w-3xl")}>
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Improve My Resume</h1>
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
                  <p className="text-sm font-semibold text-foreground">Monthly limit reached</p>
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
                    className={inputCls}
                    value={form.jobTitle}
                    onChange={e => setForm(p => ({ ...p, jobTitle: e.target.value }))}
                    placeholder="Senior Software Engineer"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Company</label>
                  <input
                    className={inputCls}
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
                    className={inputCls}
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
                        className={cn("flex-1 rounded-lg py-2 text-sm font-semibold transition-all duration-150 active:scale-[0.97]",
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
                  className={cn(inputCls, "resize-none")}
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
                className="w-full text-base h-12 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 active:from-blue-800 active:to-blue-900 active:scale-[0.99] shadow-lg shadow-primary/25"
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
                  <p className="text-xs font-semibold text-foreground">{item.label}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{item.desc}</p>
                </div>
              ))}
            </div>

            {!isPremium && (
              <div className="rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 to-blue-500/5 p-4 flex items-center gap-4">
                <Crown className="h-8 w-8 text-primary shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">Unlock unlimited improvements</p>
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
                  <h2 className="text-base font-bold text-foreground">
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

            {/* ATS score improvement banner */}
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
                <p className="text-sm font-bold text-foreground">Resume optimized for {form.jobTitle}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {SUPPORTED_COUNTRIES[form.targetCountry].flag} {SUPPORTED_COUNTRIES[form.targetCountry].name} · {form.outputLanguage === "fr" ? "Français" : "English"}
                </p>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {form.company && <Badge variant="secondary" className="text-xs">{form.company}</Badge>}
                  <Badge variant="outline" className="text-xs text-emerald-500 border-emerald-500/30">
                    {result.matchedKeywords.length} keywords matched
                  </Badge>
                </div>
              </div>
            </div>

            {/* Key improvements + matched keywords */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl border border-border/40 bg-card/20 p-4">
                <p className="text-xs font-semibold uppercase text-muted-foreground tracking-wide mb-3 flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5 text-primary" /> What Was Improved
                </p>
                <ul className="space-y-1.5">
                  {result.keyChanges.map((change, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                      <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />{change}
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

            {/* ── Big side-by-side document previews ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <DocumentPanel
                title={`Tailored Resume — ${form.jobTitle}`}
                icon={FileText}
                content={editedResume}
                onContentChange={setEditedResume}
                fileName={`Resume-${form.jobTitle}${form.company ? `-${form.company}` : ""}`}
                generatedLang={form.outputLanguage}
                accentColor={countryStyle.accentColor}
                fontFamily={countryStyle.fontFamily}
                nameAlign={countryStyle.nameAlign}
                sectionStyle={countryStyle.sectionStyle}
                isCoverLetter={false}
              />
              <DocumentPanel
                title={`Cover Letter — ${form.jobTitle}`}
                icon={Mail}
                content={editedCover}
                onContentChange={setEditedCover}
                fileName={`CoverLetter-${form.jobTitle}${form.company ? `-${form.company}` : ""}`}
                generatedLang={form.outputLanguage}
                accentColor={countryStyle.accentColor}
                fontFamily={countryStyle.fontFamily}
                nameAlign={countryStyle.nameAlign}
                sectionStyle={countryStyle.sectionStyle}
                isCoverLetter={true}
              />
            </div>

            {/* Collapsible before/after diff */}
            <div className="rounded-xl border border-border/40 overflow-hidden">
              <button
                onClick={() => setShowDiff(p => !p)}
                className="w-full flex items-center gap-2 px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 active:bg-accent active:scale-[0.99] transition-all text-left"
              >
                <TrendingUp className="h-4 w-4 text-primary shrink-0" />
                View Before / After Comparison
                <ChevronRight className={cn("h-4 w-4 ml-auto transition-transform", showDiff && "rotate-90")} />
              </button>
              {showDiff && (
                <div className="border-t border-border/40">
                  <ResumeDiffView original={masterResumeText} improved={editedResume} />
                </div>
              )}
            </div>

            <Button variant="outline" onClick={() => setStep("form")} className="w-full active:scale-[0.98]">
              <ArrowLeft className="h-4 w-4 mr-2" /> Improve for Another Job
            </Button>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
