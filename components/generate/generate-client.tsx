"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Download, Copy, Check, ChevronRight, Globe,
  Briefcase, FileText, Mail, ArrowLeft, TrendingUp, Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";
import { SUPPORTED_COUNTRIES, type CountryCode } from "@/lib/ai/countries";

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

interface Props {
  masterResumeText: string;
  masterResumeId?: string;
  defaultCountry?: string;
}

const GENERATING_STEPS = [
  { label: "Reading your master resume...", duration: 800 },
  { label: "Analyzing the job requirements...", duration: 1200 },
  { label: "Tailoring your resume to the role...", duration: 2000 },
  { label: "Applying country standards...", duration: 1000 },
  { label: "Writing your cover letter...", duration: 1500 },
  { label: "Final polish and review...", duration: 800 },
];

export function GenerateClient({ masterResumeText, masterResumeId, defaultCountry = "CA" }: Props) {
  const [step, setStep] = useState<Step>("form");
  const [form, setForm] = useState({
    jobTitle: "",
    company: "",
    targetCountry: (SUPPORTED_COUNTRIES[defaultCountry as CountryCode] ? defaultCountry : "CA") as CountryCode,
    jobDescription: "",
    outputLanguage: "en" as Language,
  });
  const [result, setResult] = useState<GenerateResult | null>(null);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"resume" | "cover">("resume");
  const [copied, setCopied] = useState<"resume" | "cover" | null>(null);
  const [generatingStep, setGeneratingStep] = useState(0);
  const resumeRef = useRef<HTMLDivElement>(null);
  const coverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/geo")
      .then((r) => r.json())
      .then((d) => {
        const code = d.country as string;
        if (SUPPORTED_COUNTRIES[code as CountryCode]) {
          setForm((p) => ({ ...p, targetCountry: code as CountryCode }));
        }
      })
      .catch(() => {});
  }, []);

  const handleGenerate = async () => {
    if (!form.jobTitle || !form.jobDescription) return;
    setStep("generating");
    setError("");
    setGeneratingStep(0);

    // Animate through steps while waiting for API
    let stepIdx = 0;
    const interval = setInterval(() => {
      stepIdx++;
      if (stepIdx < GENERATING_STEPS.length) setGeneratingStep(stepIdx);
      else clearInterval(interval);
    }, 1100);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, masterResumeText, resumeId: masterResumeId }),
      });
      clearInterval(interval);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");
      setResult(data);
      setStep("result");
    } catch (e) {
      clearInterval(interval);
      setError(e instanceof Error ? e.message : "Something went wrong");
      setStep("form");
    }
  };

  const handleCopy = async (type: "resume" | "cover") => {
    const text = type === "resume" ? result?.tailoredResume : result?.coverLetter;
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleDownloadPDF = (type: "resume" | "cover") => {
    const text = type === "resume" ? result?.tailoredResume : result?.coverLetter;
    const title = type === "resume"
      ? `Resume — ${form.jobTitle}${form.company ? ` at ${form.company}` : ""}`
      : `Cover Letter — ${form.jobTitle}${form.company ? ` at ${form.company}` : ""}`;

    const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>${title}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Georgia', serif; font-size: 11pt; line-height: 1.5; color: #111; padding: 40px; max-width: 800px; margin: 0 auto; }
  pre { white-space: pre-wrap; font-family: inherit; font-size: 11pt; }
  @media print {
    body { padding: 0; }
    @page { margin: 2cm; }
  }
</style>
</head>
<body>
<pre>${text?.replace(/</g, "&lt;").replace(/>/g, "&gt;") || ""}</pre>
<script>window.onload = () => { window.print(); }<\/script>
</body>
</html>`;

    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.target = "_blank";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <AnimatePresence mode="wait">

        {/* STEP 1: FORM */}
        {step === "form" && (
          <motion.div key="form" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="space-y-5">
            <div className="rounded-2xl border border-border/50 bg-card/30 p-6 space-y-5">

              {/* Job title + company */}
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

              {/* Country + Language */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">
                    <Globe className="inline h-3 w-3 mr-1" />Application Country <span className="text-primary">*</span>
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
                  <p className="text-[11px] text-muted-foreground mt-1">Resume format adapts to this country&apos;s standards</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">
                    Output Language <span className="text-primary">*</span>
                  </label>
                  <div className="flex gap-2 p-1 rounded-xl border border-border bg-muted/20">
                    {(["en", "fr"] as Language[]).map(lang => (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => setForm(p => ({ ...p, outputLanguage: lang }))}
                        className={cn(
                          "flex-1 rounded-lg py-2 text-sm font-semibold transition-all duration-150",
                          form.outputLanguage === lang
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {lang === "en" ? "EN · English" : "FR · Français"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Job description */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">
                  Job Description <span className="text-primary">*</span>
                </label>
                <textarea
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition resize-none"
                  rows={8}
                  value={form.jobDescription}
                  onChange={e => setForm(p => ({ ...p, jobDescription: e.target.value }))}
                  placeholder="Paste the full job description here. The more detail you provide, the better the tailoring will be..."
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
                disabled={!form.jobTitle || !form.jobDescription}
                size="lg"
                className="w-full text-base h-12 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 shadow-lg shadow-primary/25"
              >
                <Sparkles className="h-5 w-5 mr-2" />
                Generate Resume + Cover Letter
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>

            {/* What you'll get */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: FileText, label: "Tailored Resume", desc: "Adapted to the role and country standard" },
                { icon: Mail,     label: "Cover Letter",   desc: "Personalized, professional, ready to send" },
                { icon: TrendingUp, label: "ATS Score",    desc: "Before & after comparison" },
              ].map(item => (
                <div key={item.label} className="rounded-xl border border-border/40 bg-card/20 p-3.5 text-center">
                  <item.icon className="h-5 w-5 text-primary mx-auto mb-2" />
                  <p className="text-xs font-semibold">{item.label}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{item.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* STEP 2: GENERATING */}
        {step === "generating" && (
          <motion.div key="generating" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            className="rounded-2xl border border-border/50 bg-card/30 p-10 text-center"
          >
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping" />
              <div className="relative h-20 w-20 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h2 className="text-xl font-bold mb-2">Generating your documents</h2>
            <p className="text-sm text-muted-foreground mb-8">
              AI is tailoring your resume and writing your cover letter for <strong>{form.jobTitle}</strong>
              {form.company && <> at <strong>{form.company}</strong></>}
            </p>
            <div className="space-y-2 max-w-xs mx-auto text-left">
              {GENERATING_STEPS.map((s, i) => (
                <div key={i} className={cn("flex items-center gap-2.5 text-sm transition-all duration-300", i <= generatingStep ? "opacity-100" : "opacity-30")}>
                  <div className={cn("h-4 w-4 rounded-full flex items-center justify-center shrink-0 transition-all",
                    i < generatingStep ? "bg-primary" : i === generatingStep ? "bg-primary/60 animate-pulse" : "bg-muted"
                  )}>
                    {i < generatingStep && <Check className="h-2.5 w-2.5 text-primary-foreground" />}
                  </div>
                  <span className={i === generatingStep ? "text-foreground font-medium" : "text-muted-foreground"}>{s.label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* STEP 3: RESULTS */}
        {step === "result" && result && (
          <motion.div key="result" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
            {/* Score + info bar */}
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-muted flex flex-col items-center justify-center shrink-0">
                  <span className="text-xs text-muted-foreground leading-none">was</span>
                  <span className="text-lg font-black text-muted-foreground">{result.atsScoreBefore}</span>
                </div>
                <TrendingUp className="h-4 w-4 text-emerald-400" />
                <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col items-center justify-center shrink-0">
                  <span className="text-xs text-emerald-400 leading-none">now</span>
                  <span className="text-lg font-black text-emerald-400">{result.atsScoreAfter}</span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold">+{result.atsScoreAfter - result.atsScoreBefore} point ATS improvement</p>
                <p className="text-xs text-muted-foreground">{SUPPORTED_COUNTRIES[form.targetCountry].flag} {SUPPORTED_COUNTRIES[form.targetCountry].name} · {form.outputLanguage === "fr" ? "Français" : "English"}</p>
              </div>
              <div className="flex gap-2">
                <Badge variant="secondary" className="text-xs">{form.jobTitle}</Badge>
                {form.company && <Badge variant="secondary" className="text-xs">{form.company}</Badge>}
              </div>
            </div>

            {/* Language toggle */}
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab("resume")}
                  className={cn("px-4 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5",
                    activeTab === "resume" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <FileText className="h-3.5 w-3.5" /> Resume
                </button>
                <button
                  onClick={() => setActiveTab("cover")}
                  className={cn("px-4 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5",
                    activeTab === "cover" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Mail className="h-3.5 w-3.5" /> Cover Letter
                </button>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => handleCopy(activeTab)}>
                  {copied === activeTab ? <Check className="h-3.5 w-3.5 mr-1.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5 mr-1.5" />}
                  {copied === activeTab ? "Copied!" : "Copy"}
                </Button>
                <Button size="sm" variant="gradient" onClick={() => handleDownloadPDF(activeTab)}>
                  <Download className="h-3.5 w-3.5 mr-1.5" />
                  Save as PDF
                </Button>
              </div>
            </div>

            {/* Document preview */}
            <div className="rounded-2xl border border-border/50 bg-background overflow-hidden">
              <div className="bg-card/30 border-b border-border/30 px-4 py-2.5 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-red-500/50" />
                  <div className="h-2.5 w-2.5 rounded-full bg-amber-500/50" />
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/50" />
                </div>
                <span className="text-xs text-muted-foreground ml-2">
                  {activeTab === "resume" ? `${form.jobTitle} — Resume (${form.outputLanguage === "fr" ? "Français" : "English"})` : `Cover Letter — ${form.jobTitle}`}
                </span>
              </div>
              <div
                ref={activeTab === "resume" ? resumeRef : coverRef}
                className="p-6 h-[500px] overflow-y-auto"
              >
                <pre className="text-sm leading-relaxed whitespace-pre-wrap font-sans text-foreground/90">
                  {activeTab === "resume" ? result.tailoredResume : result.coverLetter}
                </pre>
              </div>
            </div>

            {/* Key changes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl border border-border/40 bg-card/20 p-4">
                <p className="text-xs font-semibold uppercase text-muted-foreground tracking-wide mb-3 flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5 text-primary" /> Key Improvements
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

            {/* Actions */}
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep("form")} className="flex-1">
                <ArrowLeft className="h-4 w-4 mr-2" /> New Generation
              </Button>
              <Button
                variant="gradient"
                onClick={() => {
                  // Download both
                  handleDownloadPDF("resume");
                  setTimeout(() => handleDownloadPDF("cover"), 600);
                }}
                className="flex-1"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Both Documents
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
