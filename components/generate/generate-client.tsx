"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Download, Copy, Check, ChevronRight, Globe,
  Briefcase, FileText, Mail, ArrowLeft, TrendingUp, Zap,
  Edit3, Languages, Loader2
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
  { label: "Reading your master resume..." },
  { label: "Analyzing the job requirements..." },
  { label: "Tailoring your resume to the role..." },
  { label: "Applying country standards..." },
  { label: "Writing your cover letter..." },
  { label: "Final polish and review..." },
];

function DownloadSection({
  label,
  icon: Icon,
  content,
  fileName,
  generatedLang,
}: {
  label: string;
  icon: React.ElementType;
  content: string;
  fileName: string;
  generatedLang: Language;
}) {
  const [translating, setTranslating] = useState<Language | null>(null);
  const [translatedContent, setTranslatedContent] = useState<Record<Language, string>>({
    en: generatedLang === "en" ? content : "",
    fr: generatedLang === "fr" ? content : "",
  });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setTranslatedContent({ en: generatedLang === "en" ? content : "", fr: generatedLang === "fr" ? content : "" });
  }, [content, generatedLang]);

  const getContent = (lang: Language) => translatedContent[lang] || "";

  const ensureTranslation = async (lang: Language) => {
    if (translatedContent[lang]) return translatedContent[lang];
    setTranslating(lang);
    try {
      const res = await fetch("/api/generate/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: content, targetLanguage: lang, docType: label === "Cover Letter" ? "cover" : "resume" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setTranslatedContent((p) => ({ ...p, [lang]: data.translated }));
      return data.translated as string;
    } catch {
      return content;
    } finally {
      setTranslating(null);
    }
  };

  const downloadPDF = async (lang: Language) => {
    const text = await ensureTranslation(lang);
    const langLabel = lang === "fr" ? "FR" : "EN";
    const title = `${fileName} (${langLabel})`;
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:Georgia,serif;font-size:11pt;line-height:1.6;color:#111;padding:40px;max-width:800px;margin:0 auto}pre{white-space:pre-wrap;font-family:inherit;font-size:11pt}@media print{body{padding:0}@page{margin:2cm}}</style>
</head><body><pre>${text.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</pre>
<script>window.onload=()=>{window.print()}<\/script></body></html>`;
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.target = "_blank"; a.click();
    URL.revokeObjectURL(url);
  };

  const downloadTxt = async (lang: Language) => {
    const text = await ensureTranslation(lang);
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${fileName.replace(/[^a-z0-9]/gi, "-").toLowerCase()}-${lang}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyText = async () => {
    const text = getContent(generatedLang) || content;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl border border-border/50 bg-card/20 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border/30 bg-card/40">
        <Icon className="h-4 w-4 text-primary shrink-0" />
        <span className="text-sm font-semibold">{label}</span>
        <div className="ml-auto flex items-center gap-1.5">
          <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={copyText}>
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>
      </div>
      <div className="p-4 space-y-3">
        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
          <Languages className="h-3.5 w-3.5" />
          Download as PDF or .txt · Choose language:
        </p>
        <div className="grid grid-cols-2 gap-2">
          {(["en", "fr"] as Language[]).map((lang) => {
            const isGenerated = lang === generatedLang;
            const isLoading = translating === lang;
            const langLabel = lang === "en" ? "EN · English" : "FR · Français";
            return (
              <div key={lang} className={cn("rounded-lg border p-3 space-y-2", isGenerated ? "border-primary/30 bg-primary/5" : "border-border/40 bg-muted/10")}>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold">{langLabel}</span>
                  {isGenerated && <Badge variant="secondary" className="text-[10px] h-4 px-1">Generated</Badge>}
                  {!isGenerated && !translatedContent[lang] && (
                    <span className="text-[10px] text-muted-foreground">· will translate</span>
                  )}
                  {!isGenerated && translatedContent[lang] && (
                    <Badge variant="outline" className="text-[10px] h-4 px-1 text-emerald-400 border-emerald-500/30">Translated</Badge>
                  )}
                </div>
                <div className="flex gap-1.5">
                  <Button
                    size="sm"
                    variant={isGenerated ? "gradient" : "outline"}
                    className="flex-1 h-7 text-xs"
                    disabled={isLoading}
                    onClick={() => downloadPDF(lang)}
                  >
                    {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Download className="h-3 w-3 mr-1" />}
                    PDF
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 h-7 text-xs"
                    disabled={isLoading}
                    onClick={() => downloadTxt(lang)}
                  >
                    {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <FileText className="h-3 w-3 mr-1" />}
                    .txt
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
  const [editedResume, setEditedResume] = useState("");
  const [editedCover, setEditedCover] = useState("");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"resume" | "cover">("resume");
  const [generatingStep, setGeneratingStep] = useState(0);
  const [isEditing, setIsEditing] = useState<"resume" | "cover" | null>(null);

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
      setEditedResume(data.tailoredResume);
      setEditedCover(data.coverLetter);
      setStep("result");
    } catch (e) {
      clearInterval(interval);
      setError(e instanceof Error ? e.message : "Something went wrong");
      setStep("form");
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <AnimatePresence mode="wait">

        {/* STEP 1: FORM */}
        {step === "form" && (
          <motion.div key="form" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="space-y-5">
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
                Improve Resume + Generate Cover Letter
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: FileText,    label: "Tailored Resume",  desc: "Adapted to the role and country standard" },
                { icon: Mail,        label: "Cover Letter",     desc: "Personalized, professional, ready to send" },
                { icon: TrendingUp,  label: "ATS Score",        desc: "Before & after comparison" },
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
            <h2 className="text-xl font-bold mb-2">Improving your resume</h2>
            <p className="text-sm text-muted-foreground mb-8">
              AI is tailoring your resume for <strong>{form.jobTitle}</strong>
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

            {/* ATS score bar */}
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

            {/* Improvements + Keywords */}
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
                  <Briefcase className="h-3.5 w-3.5 text-primary" /> Keywords Added
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {result.matchedKeywords.map(kw => (
                    <Badge key={kw} variant="secondary" className="text-[11px]">{kw}</Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Document tabs */}
            <div className="flex gap-2 border-b border-border/40 pb-2">
              <button
                onClick={() => setActiveTab("resume")}
                className={cn("px-4 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5",
                  activeTab === "resume" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <FileText className="h-3.5 w-3.5" /> Improved Resume
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

            {/* Editable document area */}
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
                  onClick={() => setIsEditing(isEditing === activeTab ? null : activeTab)}
                  className={cn(
                    "ml-auto flex items-center gap-1.5 text-xs rounded-lg px-2.5 py-1 transition-colors",
                    isEditing === activeTab ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                >
                  <Edit3 className="h-3 w-3" />
                  {isEditing === activeTab ? "Done Editing" : "Edit"}
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

            {/* Download sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DownloadSection
                label="Improved Resume"
                icon={FileText}
                content={editedResume}
                fileName={`Resume-${form.jobTitle}${form.company ? `-${form.company}` : ""}`}
                generatedLang={form.outputLanguage}
              />
              <DownloadSection
                label="Cover Letter"
                icon={Mail}
                content={editedCover}
                fileName={`CoverLetter-${form.jobTitle}${form.company ? `-${form.company}` : ""}`}
                generatedLang={form.outputLanguage}
              />
            </div>

            {/* Back button */}
            <Button variant="outline" onClick={() => setStep("form")} className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" /> Generate for Another Job
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
