"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  Sparkles, Download, Plus, Trash2, Loader2, FileText, ChevronDown, ChevronUp, Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { SUPPORTED_COUNTRIES, type CountryCode } from "@/lib/ai/countries";
import { ResumePreview, COUNTRY_STYLES } from "@/components/resume/resume-preview";
import { openPrintWithTemplate, downloadDocxWithTemplate, countryToTemplateId } from "@/components/resume/resume-templates";

type Language = "en" | "fr";

interface ExperienceEntry {
  id: string;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  bullets: string;
}

interface EducationEntry {
  id: string;
  degree: string;
  institution: string;
  location: string;
  year: string;
  notes: string;
}

interface ResumeData {
  contact: string;
  summary: string;
  experience: ExperienceEntry[];
  education: EducationEntry[];
  skills: string;
  projects: string;
  certifications: string;
  languages: string;
}

const EMPTY_EXPERIENCE = (): ExperienceEntry => ({
  id: crypto.randomUUID(),
  title: "", company: "", location: "", startDate: "", endDate: "", current: false, bullets: "",
});

const EMPTY_EDUCATION = (): EducationEntry => ({
  id: crypto.randomUUID(),
  degree: "", institution: "", location: "", year: "", notes: "",
});

const DEFAULT_RESUME: ResumeData = {
  contact: "",
  summary: "",
  experience: [EMPTY_EXPERIENCE()],
  education: [EMPTY_EDUCATION()],
  skills: "",
  projects: "",
  certifications: "",
  languages: "",
};

function AIFixButton({ onClick, loading }: { onClick: () => void; loading: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      title="Improve with AI"
      className={cn(
        "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all border",
        loading
          ? "border-primary/30 bg-primary/5 text-primary cursor-not-allowed"
          : "border-border/50 bg-muted/20 text-muted-foreground hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
      )}
    >
      {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
      {loading ? "Improving..." : "AI Fix"}
    </button>
  );
}

function SectionHeader({
  title,
  expanded,
  onToggle,
}: { title: string; expanded: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-left hover:bg-accent/30 transition-colors"
    >
      {title}
      {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
    </button>
  );
}

// Countries where Education section comes before Work Experience
const EDU_FIRST_COUNTRIES = new Set(["IN", "FR", "BE", "CH", "DE", "AE", "SA", "PK", "BD", "LK", "NP"]);

function buildResumeText(data: ResumeData, lang: Language, country = "CA"): string {
  const lines: string[] = [];
  const t = (en: string, fr: string) => lang === "fr" ? fr : en;
  const eduFirst = EDU_FIRST_COUNTRIES.has(country);

  if (data.contact.trim()) {
    lines.push(data.contact.trim(), "");
  }

  if (data.summary.trim()) {
    lines.push(t("PROFESSIONAL SUMMARY", "SOMMAIRE PROFESSIONNEL"), "─".repeat(40), data.summary.trim(), "");
  }

  function pushExperience() {
    if (data.experience.some(e => e.title || e.company || e.bullets)) {
      lines.push(t("WORK EXPERIENCE", "EXPÉRIENCE PROFESSIONNELLE"), "─".repeat(40));
      for (const exp of data.experience) {
        if (!exp.title && !exp.company) continue;
        const dateRange = exp.current
          ? `${exp.startDate} – ${t("Present", "Présent")}`
          : `${exp.startDate}${exp.endDate ? ` – ${exp.endDate}` : ""}`;
        lines.push(`${exp.title}${exp.company ? ` — ${exp.company}` : ""}${exp.location ? `, ${exp.location}` : ""}${dateRange ? `  (${dateRange})` : ""}`);
        if (exp.bullets.trim()) {
          for (const bullet of exp.bullets.split("\n").filter(Boolean)) {
            lines.push(`• ${bullet.replace(/^[•\-*]\s*/, "")}`);
          }
        }
        lines.push("");
      }
    }
  }

  function pushEducation() {
    if (data.education.some(e => e.degree || e.institution)) {
      lines.push(t("EDUCATION", "FORMATION"), "─".repeat(40));
      for (const edu of data.education) {
        if (!edu.degree && !edu.institution) continue;
        lines.push(`${edu.degree}${edu.institution ? ` — ${edu.institution}` : ""}${edu.location ? `, ${edu.location}` : ""}${edu.year ? `  (${edu.year})` : ""}`);
        if (edu.notes.trim()) lines.push(edu.notes.trim());
        lines.push("");
      }
    }
  }

  if (eduFirst) {
    pushEducation();
    pushExperience();
  } else {
    pushExperience();
    pushEducation();
  }

  if (data.skills.trim()) {
    lines.push(t("SKILLS", "COMPÉTENCES"), "─".repeat(40), data.skills.trim(), "");
  }

  if (data.projects.trim()) {
    lines.push(t("PROJECTS", "PROJETS"), "─".repeat(40), data.projects.trim(), "");
  }

  if (data.certifications.trim()) {
    lines.push(t("CERTIFICATIONS", "CERTIFICATIONS"), "─".repeat(40), data.certifications.trim(), "");
  }

  if (data.languages.trim()) {
    lines.push(t("LANGUAGES", "LANGUES"), "─".repeat(40), data.languages.trim(), "");
  }

  return lines.join("\n").trim();
}

interface BuildProps {
  buildsUsed?: number;
  buildsLimit?: number;
  isPremium?: boolean;
}

export function BuildClient({ buildsUsed = 0, buildsLimit = 1, isPremium = false }: BuildProps) {
  const [data, setData] = useState<ResumeData>(DEFAULT_RESUME);
  const [previewLang, setPreviewLang] = useState<Language>("en");
  const [targetCountry, setTargetCountry] = useState<CountryCode>("CA");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    contact: true, summary: true, experience: true, education: true,
    skills: true, projects: false, certifications: false, languages: false,
  });
  const [aiLoading, setAiLoading] = useState<Record<string, boolean>>({});
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedFr, setTranslatedFr] = useState<string>("");
  const translateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const translateAbortRef = useRef<AbortController | null>(null);
  const translateSourceRef = useRef<string>("");

  const enText = buildResumeText(data, "en", targetCountry);

  useEffect(() => {
    if (previewLang !== "fr" || !enText.trim()) return;
    if (translateSourceRef.current === enText) return;

    if (translateTimerRef.current) clearTimeout(translateTimerRef.current);
    if (translateAbortRef.current) translateAbortRef.current.abort();

    translateTimerRef.current = setTimeout(() => {
      const controller = new AbortController();
      translateAbortRef.current = controller;
      setIsTranslating(true);
      fetch("/api/generate/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: enText, targetLanguage: "fr", docType: "resume" }),
        signal: controller.signal,
      })
        .then(r => r.json())
        .then(d => {
          if (d.translated) {
            translateSourceRef.current = enText;
            setTranslatedFr(d.translated);
          }
        })
        .catch(() => {})
        .finally(() => setIsTranslating(false));
    }, 1500);

    return () => {
      if (translateTimerRef.current) clearTimeout(translateTimerRef.current);
    };
  }, [previewLang, enText]);

  const toggle = (section: string) => setExpanded(p => ({ ...p, [section]: !p[section] }));

  const setAiLoad = (key: string, val: boolean) => setAiLoading(p => ({ ...p, [key]: val }));

  const fixWithAI = useCallback(async (section: string, content: string, onDone: (improved: string) => void) => {
    if (!content.trim()) return;
    setAiLoad(section, true);
    try {
      const res = await fetch("/api/ai/fix-section", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section, content, language: previewLang }),
      });
      const d = await res.json();
      if (res.ok && d.improved) onDone(d.improved);
    } catch { /* ignore */ }
    finally { setAiLoad(section, false); }
  }, [previewLang]);

  const downloadPDF = (lang: Language) => {
    const text = lang === "fr" && translatedFr ? translatedFr : buildResumeText(data, lang, targetCountry);
    openPrintWithTemplate(text, countryToTemplateId(targetCountry), `Resume-${lang}`);
  };

  const downloadDocx = async (lang: Language) => {
    const text = lang === "fr" && translatedFr ? translatedFr : buildResumeText(data, lang, targetCountry);
    await downloadDocxWithTemplate(text, countryToTemplateId(targetCountry), `resume-${lang}.docx`);
  };

  const previewText = previewLang === "fr"
    ? (translatedFr || buildResumeText(data, "fr", targetCountry))
    : enText;
  const countryStyle = COUNTRY_STYLES[targetCountry] ?? COUNTRY_STYLES.CA;

  return (
    <div className="h-full grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-0">

      {/* LEFT: Editor */}
      <div className="overflow-y-auto space-y-3 pr-1">

        {/* Country + Language row */}
        <div className="rounded-xl border border-border/50 bg-card/30 px-4 py-3 flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2 flex-1 min-w-[180px]">
            <Globe className="h-4 w-4 text-muted-foreground shrink-0" />
            <select
              className="flex-1 text-sm rounded-lg border border-border bg-background px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/40"
              value={targetCountry}
              onChange={e => setTargetCountry(e.target.value as CountryCode)}
            >
              {(Object.entries(SUPPORTED_COUNTRIES) as [CountryCode, { name: string; flag: string }][]).map(([code, info]) => (
                <option key={code} value={code}>{info.flag} {info.name}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-1 p-0.5 rounded-lg border border-border bg-muted/20">
            {(["en", "fr"] as Language[]).map(lang => (
              <button
                key={lang}
                onClick={() => setPreviewLang(lang)}
                className={cn(
                  "rounded-md px-3 py-1 text-xs font-semibold transition-all",
                  previewLang === lang ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {lang === "en" ? "EN" : "FR"}
              </button>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div className="rounded-xl border border-border/50 bg-card/30 overflow-hidden">
          <SectionHeader title="Contact Information" expanded={expanded.contact} onToggle={() => toggle("contact")} />
          {expanded.contact && (
            <div className="px-4 pb-4 space-y-2">
              <div className="flex items-start gap-2">
                <textarea
                  className="flex-1 text-sm rounded-lg border border-border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
                  rows={4}
                  placeholder={"Jane Smith\njane@email.com | +1 (416) 555-0123\nLinkedIn: linkedin.com/in/janesmith | Toronto, ON"}
                  value={data.contact}
                  onChange={e => setData(p => ({ ...p, contact: e.target.value }))}
                />
                <AIFixButton loading={!!aiLoading.contact} onClick={() => fixWithAI("contact", data.contact, (v) => setData(p => ({ ...p, contact: v })))} />
              </div>
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="rounded-xl border border-border/50 bg-card/30 overflow-hidden">
          <SectionHeader title="Professional Summary" expanded={expanded.summary} onToggle={() => toggle("summary")} />
          {expanded.summary && (
            <div className="px-4 pb-4 space-y-2">
              <div className="flex items-start gap-2">
                <textarea
                  className="flex-1 text-sm rounded-lg border border-border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
                  rows={4}
                  placeholder="3–4 sentences about your professional background, key skills, and career goals..."
                  value={data.summary}
                  onChange={e => setData(p => ({ ...p, summary: e.target.value }))}
                />
                <AIFixButton loading={!!aiLoading.summary} onClick={() => fixWithAI("summary", data.summary, (v) => setData(p => ({ ...p, summary: v })))} />
              </div>
            </div>
          )}
        </div>

        {/* Experience */}
        <div className="rounded-xl border border-border/50 bg-card/30 overflow-hidden">
          <SectionHeader title="Work Experience" expanded={expanded.experience} onToggle={() => toggle("experience")} />
          {expanded.experience && (
            <div className="px-4 pb-4 space-y-4">
              {data.experience.map((exp, idx) => (
                <motion.div key={exp.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-lg border border-border/40 bg-background/50 p-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted-foreground">Position {idx + 1}</span>
                    {data.experience.length > 1 && (
                      <button onClick={() => setData(p => ({ ...p, experience: p.experience.filter(e => e.id !== exp.id) }))}
                        className="text-muted-foreground hover:text-destructive transition-colors p-1">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input className="text-sm rounded-lg border border-border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40"
                      placeholder="Job Title" value={exp.title}
                      onChange={e => setData(p => ({ ...p, experience: p.experience.map(x => x.id === exp.id ? { ...x, title: e.target.value } : x) }))} />
                    <input className="text-sm rounded-lg border border-border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40"
                      placeholder="Company" value={exp.company}
                      onChange={e => setData(p => ({ ...p, experience: p.experience.map(x => x.id === exp.id ? { ...x, company: e.target.value } : x) }))} />
                    <input className="text-sm rounded-lg border border-border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40"
                      placeholder="Location" value={exp.location}
                      onChange={e => setData(p => ({ ...p, experience: p.experience.map(x => x.id === exp.id ? { ...x, location: e.target.value } : x) }))} />
                    <div className="flex items-center gap-2">
                      <input className="text-sm rounded-lg border border-border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40 flex-1"
                        placeholder="2022 – 2024" value={exp.startDate}
                        onChange={e => setData(p => ({ ...p, experience: p.experience.map(x => x.id === exp.id ? { ...x, startDate: e.target.value } : x) }))} />
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <textarea
                      className="flex-1 text-sm rounded-lg border border-border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
                      rows={4}
                      placeholder={"• Led development of X, resulting in Y improvement\n• Managed team of N engineers\n• Built Z using React, TypeScript, PostgreSQL"}
                      value={exp.bullets}
                      onChange={e => setData(p => ({ ...p, experience: p.experience.map(x => x.id === exp.id ? { ...x, bullets: e.target.value } : x) }))}
                    />
                    <AIFixButton
                      loading={!!aiLoading[`exp-${exp.id}`]}
                      onClick={() => fixWithAI("experience", exp.bullets, (v) =>
                        setData(p => ({ ...p, experience: p.experience.map(x => x.id === exp.id ? { ...x, bullets: v } : x) }))
                      )}
                    />
                  </div>
                </motion.div>
              ))}
              <button
                onClick={() => setData(p => ({ ...p, experience: [...p.experience, EMPTY_EXPERIENCE()] }))}
                className="flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <Plus className="h-3.5 w-3.5" /> Add position
              </button>
            </div>
          )}
        </div>

        {/* Education */}
        <div className="rounded-xl border border-border/50 bg-card/30 overflow-hidden">
          <SectionHeader title="Education" expanded={expanded.education} onToggle={() => toggle("education")} />
          {expanded.education && (
            <div className="px-4 pb-4 space-y-4">
              {data.education.map((edu, idx) => (
                <motion.div key={edu.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-lg border border-border/40 bg-background/50 p-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted-foreground">Entry {idx + 1}</span>
                    {data.education.length > 1 && (
                      <button onClick={() => setData(p => ({ ...p, education: p.education.filter(e => e.id !== edu.id) }))}
                        className="text-muted-foreground hover:text-destructive transition-colors p-1">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input className="text-sm rounded-lg border border-border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40"
                      placeholder="Degree / Program" value={edu.degree}
                      onChange={e => setData(p => ({ ...p, education: p.education.map(x => x.id === edu.id ? { ...x, degree: e.target.value } : x) }))} />
                    <input className="text-sm rounded-lg border border-border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40"
                      placeholder="Institution" value={edu.institution}
                      onChange={e => setData(p => ({ ...p, education: p.education.map(x => x.id === edu.id ? { ...x, institution: e.target.value } : x) }))} />
                    <input className="text-sm rounded-lg border border-border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40"
                      placeholder="City, Country" value={edu.location}
                      onChange={e => setData(p => ({ ...p, education: p.education.map(x => x.id === edu.id ? { ...x, location: e.target.value } : x) }))} />
                    <input className="text-sm rounded-lg border border-border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40"
                      placeholder="Graduation Year" value={edu.year}
                      onChange={e => setData(p => ({ ...p, education: p.education.map(x => x.id === edu.id ? { ...x, year: e.target.value } : x) }))} />
                  </div>
                  <input className="w-full text-sm rounded-lg border border-border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40"
                    placeholder="GPA, honors, relevant coursework (optional)" value={edu.notes}
                    onChange={e => setData(p => ({ ...p, education: p.education.map(x => x.id === edu.id ? { ...x, notes: e.target.value } : x) }))} />
                </motion.div>
              ))}
              <button
                onClick={() => setData(p => ({ ...p, education: [...p.education, EMPTY_EDUCATION()] }))}
                className="flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <Plus className="h-3.5 w-3.5" /> Add education
              </button>
            </div>
          )}
        </div>

        {/* Skills */}
        <div className="rounded-xl border border-border/50 bg-card/30 overflow-hidden">
          <SectionHeader title="Skills" expanded={expanded.skills} onToggle={() => toggle("skills")} />
          {expanded.skills && (
            <div className="px-4 pb-4">
              <div className="flex items-start gap-2">
                <textarea
                  className="flex-1 text-sm rounded-lg border border-border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
                  rows={3}
                  placeholder={"Languages: TypeScript, Python, SQL\nFrameworks: React, Next.js, Node.js\nTools: Docker, AWS, Git"}
                  value={data.skills}
                  onChange={e => setData(p => ({ ...p, skills: e.target.value }))}
                />
                <AIFixButton loading={!!aiLoading.skills} onClick={() => fixWithAI("skills", data.skills, (v) => setData(p => ({ ...p, skills: v })))} />
              </div>
            </div>
          )}
        </div>

        {/* Projects */}
        <div className="rounded-xl border border-border/50 bg-card/30 overflow-hidden">
          <SectionHeader title="Projects (optional)" expanded={expanded.projects} onToggle={() => toggle("projects")} />
          {expanded.projects && (
            <div className="px-4 pb-4">
              <div className="flex items-start gap-2">
                <textarea
                  className="flex-1 text-sm rounded-lg border border-border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
                  rows={4}
                  placeholder={"Project Name — description, technologies used, outcome\nProject Name — ..."}
                  value={data.projects}
                  onChange={e => setData(p => ({ ...p, projects: e.target.value }))}
                />
                <AIFixButton loading={!!aiLoading.projects} onClick={() => fixWithAI("projects", data.projects, (v) => setData(p => ({ ...p, projects: v })))} />
              </div>
            </div>
          )}
        </div>

        {/* Certifications */}
        <div className="rounded-xl border border-border/50 bg-card/30 overflow-hidden">
          <SectionHeader title="Certifications (optional)" expanded={expanded.certifications} onToggle={() => toggle("certifications")} />
          {expanded.certifications && (
            <div className="px-4 pb-4">
              <div className="flex items-start gap-2">
                <textarea
                  className="flex-1 text-sm rounded-lg border border-border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
                  rows={3}
                  placeholder={"AWS Solutions Architect — Amazon, 2023\nGoogle Cloud Professional — Google, 2022"}
                  value={data.certifications}
                  onChange={e => setData(p => ({ ...p, certifications: e.target.value }))}
                />
                <AIFixButton loading={!!aiLoading.certifications} onClick={() => fixWithAI("certifications", data.certifications, (v) => setData(p => ({ ...p, certifications: v })))} />
              </div>
            </div>
          )}
        </div>

        {/* Languages */}
        <div className="rounded-xl border border-border/50 bg-card/30 overflow-hidden">
          <SectionHeader title="Languages (optional)" expanded={expanded.languages} onToggle={() => toggle("languages")} />
          {expanded.languages && (
            <div className="px-4 pb-4">
              <div className="flex items-start gap-2">
                <textarea
                  className="flex-1 text-sm rounded-lg border border-border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
                  rows={2}
                  placeholder={"English — Native\nFrench — Fluent\nSpanish — Conversational"}
                  value={data.languages}
                  onChange={e => setData(p => ({ ...p, languages: e.target.value }))}
                />
                <AIFixButton loading={!!aiLoading.languages} onClick={() => fixWithAI("languages", data.languages, (v) => setData(p => ({ ...p, languages: v })))} />
              </div>
            </div>
          )}
        </div>

      </div>

      {/* RIGHT: Live preview + Download */}
      <div className="hidden lg:flex flex-col gap-4 min-h-0">

        {/* Live Preview */}
        <div className="rounded-2xl border border-border/50 bg-card/30 overflow-hidden flex flex-col flex-1 min-h-0">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border/30 bg-card/50 shrink-0">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Live Preview</span>
            {isTranslating && (
              <span className="flex items-center gap-1 text-xs text-primary animate-pulse">
                <Loader2 className="h-3 w-3 animate-spin" />Translating...
              </span>
            )}
            <span className="ml-auto text-xs text-muted-foreground">
              {SUPPORTED_COUNTRIES[targetCountry].flag} {SUPPORTED_COUNTRIES[targetCountry].name} format
            </span>
          </div>
          <div className="flex-1 overflow-y-auto bg-gray-100/80 dark:bg-gray-200/10">
            {previewText ? (
              <div className="py-6 px-4">
                <ResumePreview
                  text={previewText}
                  accentColor={countryStyle.accentColor}
                  fontFamily={countryStyle.fontFamily}
                  nameAlign={countryStyle.nameAlign}
                  sectionStyle={countryStyle.sectionStyle}
                />
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground gap-3 py-20">
                <FileText className="h-10 w-10 opacity-20" />
                <p className="text-sm">Fill in sections to see your formatted resume</p>
              </div>
            )}
          </div>
        </div>

        {/* Download buttons */}
        <div className="rounded-xl border border-border/50 bg-card/30 p-4 shrink-0">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Download Resume</p>
          <div className="grid grid-cols-2 gap-2">
            {(["en", "fr"] as Language[]).map(lang => (
              <div key={lang} className="rounded-lg border border-border/40 p-3 space-y-2">
                <p className="text-xs font-medium">{lang === "en" ? "English" : "Français"}</p>
                <div className="flex gap-1.5">
                  <Button size="sm" variant="gradient" className="flex-1 h-7 text-xs" onClick={() => downloadPDF(lang)}>
                    <Download className="h-3 w-3 mr-1" />PDF
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1 h-7 text-xs" onClick={() => downloadDocx(lang)}>
                    <FileText className="h-3 w-3 mr-1" />.docx
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Mobile download (shown only on small screens) */}
      <div className="lg:hidden rounded-xl border border-border/50 bg-card/30 p-4">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Download Resume</p>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="gradient" onClick={() => downloadPDF("en")} className="h-9 text-xs">
            <Download className="h-3.5 w-3.5 mr-1" />PDF (EN)
          </Button>
          <Button variant="gradient" onClick={() => downloadPDF("fr")} className="h-9 text-xs">
            <Download className="h-3.5 w-3.5 mr-1" />PDF (FR)
          </Button>
        </div>
      </div>

    </div>
  );
}
