"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Download, FileText, Mail, Globe, TrendingUp,
  Calendar, ChevronDown, ChevronUp, X, Sparkles, Clock,
  CheckCircle2, AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";
import { SUPPORTED_COUNTRIES } from "@/lib/ai/countries";
import Link from "next/link";

interface ScanItem {
  id: string;
  jobTitle: string;
  company: string | null;
  atsScore: number;
  jobCountry: string | null;
  createdAt: string;
  aiResults: {
    tailoredResume?: string;
    coverLetter?: string;
    outputLanguage?: string;
    atsScoreBefore?: number;
    atsScoreAfter?: number;
    keyChanges?: string[];
    matchedKeywords?: string[];
  } | null;
  status: string;
}

interface Props {
  scans: ScanItem[];
}

const STORAGE_KEY = "hyrefy:downloaded-scans";

function useDownloadedScans() {
  const [downloaded, setDownloaded] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setDownloaded(new Set(JSON.parse(raw) as string[]));
    } catch { /* ignore */ }
  }, []);

  const markDownloaded = useCallback((scanId: string) => {
    setDownloaded(prev => {
      const next = new Set(prev);
      next.add(scanId);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify([...next])); } catch { /* ignore */ }
      return next;
    });
  }, []);

  return { downloaded, markDownloaded };
}

function atsColor(score: number) {
  if (score >= 80) return "text-emerald-500 border-emerald-500/30 bg-emerald-500/10";
  if (score >= 65) return "text-blue-500 border-blue-500/30 bg-blue-500/10";
  if (score >= 50) return "text-amber-500 border-amber-500/30 bg-amber-500/10";
  return "text-red-500 border-red-500/30 bg-red-500/10";
}

function openPDF(content: string, title: string) {
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:Georgia,serif;font-size:11pt;line-height:1.55;color:#111;padding:40px 48px;max-width:820px;margin:0 auto}pre{white-space:pre-wrap;font-family:inherit}@media print{body{padding:20px}@page{margin:1.8cm;size:letter}}</style>
</head><body><pre>${content.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</pre>
<script>window.onload=()=>{window.print()}<\/script></body></html>`;
  const url = URL.createObjectURL(new Blob([html], { type: "text/html" }));
  Object.assign(document.createElement("a"), { href: url, target: "_blank" }).click();
  URL.revokeObjectURL(url);
}

async function downloadDocx(content: string, filename: string) {
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
  Object.assign(document.createElement("a"), { href: url, download: filename.replace(/\.txt$/, ".docx") }).click();
  URL.revokeObjectURL(url);
}

function groupByDate(scans: ScanItem[]) {
  const now = new Date();
  const groups: Record<string, ScanItem[]> = {};
  for (const scan of scans) {
    const d = new Date(scan.createdAt);
    const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
    let label: string;
    if (diffDays === 0) label = "Today";
    else if (diffDays === 1) label = "Yesterday";
    else if (diffDays < 7) label = "This week";
    else if (diffDays < 14) label = "Last week";
    else if (diffDays < 31) label = "This month";
    else {
      label = d.toLocaleDateString("en-CA", { year: "numeric", month: "long" });
    }
    if (!groups[label]) groups[label] = [];
    groups[label].push(scan);
  }
  return groups;
}

function ScanCard({
  scan,
  isDownloaded,
  onDownload,
}: {
  scan: ScanItem;
  isDownloaded: boolean;
  onDownload: (scanId: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const country = scan.jobCountry ? SUPPORTED_COUNTRIES[scan.jobCountry as keyof typeof SUPPORTED_COUNTRIES] : null;
  const ai = scan.aiResults;
  const lang = ai?.outputLanguage === "fr" ? "FR" : "EN";
  const scoreBefore = ai?.atsScoreBefore ?? null;
  const scoreAfter = scan.atsScore || ai?.atsScoreAfter;
  const hasCover = !!(ai?.coverLetter);
  const hasResume = !!(ai?.tailoredResume);
  const hasContent = hasResume || hasCover;
  const slug = `${scan.jobTitle}${scan.company ? `-${scan.company}` : ""}`.replace(/[^a-z0-9]/gi, "-").toLowerCase();

  const handleDownload = (fn: () => void) => {
    fn();
    onDownload(scan.id);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border/50 bg-card hover:bg-card/80 transition-all overflow-hidden"
    >
      <div className="p-4 flex items-start gap-4 flex-wrap">
        {/* Country flag / icon */}
        <div className="h-10 w-10 rounded-xl bg-primary/8 border border-primary/15 flex items-center justify-center shrink-0 text-lg mt-0.5">
          {country?.flag ?? <Globe className="h-4 w-4 text-muted-foreground" />}
        </div>

        {/* Main info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 flex-wrap">
            <p className="font-semibold text-sm text-foreground">{scan.jobTitle}</p>
            {scan.company && <span className="text-sm text-muted-foreground">@ {scan.company}</span>}
          </div>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {new Date(scan.createdAt).toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" })}
            </span>
            {country && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Globe className="h-3 w-3" />
                {country.name}
              </span>
            )}
            <Badge variant="secondary" className="text-[10px] px-2 h-4">{lang}</Badge>
            {hasCover && <Badge variant="outline" className="text-[10px] px-2 h-4 text-primary border-primary/30">+ Cover Letter</Badge>}

            {/* Download status badge */}
            {hasContent && (
              isDownloaded ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 rounded-full px-2 py-0.5">
                  <CheckCircle2 className="h-2.5 w-2.5" />Downloaded
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/25 rounded-full px-2 py-0.5">
                  <AlertCircle className="h-2.5 w-2.5" />Not downloaded
                </span>
              )
            )}
          </div>
        </div>

        {/* ATS scores + expand */}
        <div className="flex items-center gap-3 shrink-0">
          {scoreBefore !== null && scoreAfter && (
            <div className="hidden sm:flex items-center gap-2 text-xs">
              <span className="text-muted-foreground">{scoreBefore}%</span>
              <TrendingUp className="h-3.5 w-3.5 text-primary" />
              <span className={cn("font-bold px-2 py-0.5 rounded-md border text-xs", atsColor(scoreAfter))}>
                {scoreAfter}%
              </span>
            </div>
          )}
          {hasContent && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-lg hover:bg-accent active:bg-accent active:scale-[0.97]"
            >
              {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              {expanded ? "Close" : "Download"}
            </button>
          )}
        </div>
      </div>

      {/* Expanded: download actions + key changes */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="border-t border-border/30 p-4 space-y-3 bg-muted/20">

              {/* Downloads */}
              <div className="flex items-center gap-2 flex-wrap">
                {hasResume && (
                  <>
                    <Button size="sm" variant="gradient" className="h-7 text-xs gap-1.5"
                      onClick={() => handleDownload(() => openPDF(ai!.tailoredResume!, `Resume-${slug}`))}>
                      <FileText className="h-3 w-3" />Resume PDF
                    </Button>
                    <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5"
                      onClick={() => handleDownload(() => downloadDocx(ai!.tailoredResume!, `resume-${slug}.docx`))}>
                      <Download className="h-3 w-3" />.docx
                    </Button>
                  </>
                )}
                {hasCover && (
                  <>
                    <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5"
                      onClick={() => handleDownload(() => openPDF(ai!.coverLetter!, `Cover-${slug}`))}>
                      <Mail className="h-3 w-3" />Cover Letter PDF
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 text-xs gap-1.5 text-muted-foreground hover:text-foreground"
                      onClick={() => handleDownload(() => downloadDocx(ai!.coverLetter!, `cover-${slug}.docx`))}>
                      <Download className="h-3 w-3" />.docx
                    </Button>
                  </>
                )}
              </div>

              {/* Key changes summary */}
              {ai?.keyChanges && ai.keyChanges.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1.5">What was improved:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {ai.keyChanges.slice(0, 4).map((c, i) => (
                      <span key={i} className="text-[11px] bg-primary/8 text-primary border border-primary/20 rounded-md px-2 py-0.5">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Matched keywords */}
              {ai?.matchedKeywords && ai.matchedKeywords.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1.5">Matched keywords:</p>
                  <div className="flex flex-wrap gap-1">
                    {ai.matchedKeywords.slice(0, 10).map((kw) => (
                      <Badge key={kw} variant="secondary" className="text-[10px] h-5">{kw}</Badge>
                    ))}
                    {ai.matchedKeywords.length > 10 && (
                      <span className="text-[10px] text-muted-foreground self-center">+{ai.matchedKeywords.length - 10} more</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function HistoryClient({ scans }: Props) {
  const [query, setQuery] = useState("");
  const { downloaded, markDownloaded } = useDownloadedScans();

  const filtered = useMemo(() => {
    if (!query.trim()) return scans;
    const q = query.toLowerCase();
    return scans.filter(s =>
      s.jobTitle.toLowerCase().includes(q) ||
      (s.company ?? "").toLowerCase().includes(q) ||
      (s.jobCountry ?? "").toLowerCase().includes(q)
    );
  }, [scans, query]);

  const groups = useMemo(() => groupByDate(filtered), [filtered]);

  if (scans.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-5">
        <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center">
          <FileText className="h-8 w-8 text-muted-foreground" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-1">No generations yet</h2>
          <p className="text-muted-foreground text-sm max-w-sm">
            Generate your first tailored resume and cover letter to get started.
          </p>
        </div>
        <Button asChild variant="gradient">
          <Link href="/generate">
            <Sparkles className="mr-2 h-4 w-4" />
            Generate Now
          </Link>
        </Button>
      </div>
    );
  }

  const notDownloadedCount = scans.filter(s => (s.aiResults?.tailoredResume || s.aiResults?.coverLetter) && !downloaded.has(s.id)).length;

  return (
    <div className="space-y-6">
      {/* Summary bar */}
      {notDownloadedCount > 0 && (
        <div className="rounded-xl border border-amber-500/25 bg-amber-500/5 px-4 py-3 flex items-center gap-3">
          <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
          <p className="text-sm text-foreground">
            <span className="font-semibold">{notDownloadedCount}</span>{" "}
            {notDownloadedCount === 1 ? "resume has" : "resumes have"} not been downloaded yet.
          </p>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search by job title, company, or country..."
          className="w-full rounded-xl border border-border bg-background text-foreground pl-10 pr-10 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
        />
        {query && (
          <button onClick={() => setQuery("")} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {filtered.length === 0 && query && (
        <div className="text-center py-12 text-muted-foreground">
          <Search className="h-8 w-8 mx-auto mb-3 opacity-40" />
          <p className="text-sm">No results for &quot;{query}&quot;</p>
        </div>
      )}

      {/* Timeline groups */}
      {Object.entries(groups).map(([label, groupScans]) => (
        <div key={label} className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold uppercase tracking-wide">
              <Calendar className="h-3.5 w-3.5" />
              {label}
            </div>
            <div className="flex-1 h-px bg-border/40" />
            <span className="text-xs text-muted-foreground">{groupScans.length}</span>
          </div>

          <div className="space-y-2">
            {groupScans.map(scan => (
              <ScanCard
                key={scan.id}
                scan={scan}
                isDownloaded={downloaded.has(scan.id)}
                onDownload={markDownloaded}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
