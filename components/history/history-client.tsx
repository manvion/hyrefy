"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Download, FileText, Mail, Globe, TrendingUp,
  Calendar, ChevronDown, ChevronUp, X, Sparkles, Clock,
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

function atsColor(score: number) {
  if (score >= 80) return "text-emerald-400 border-emerald-500/30 bg-emerald-500/10";
  if (score >= 65) return "text-blue-400 border-blue-500/30 bg-blue-500/10";
  if (score >= 50) return "text-amber-400 border-amber-500/30 bg-amber-500/10";
  return "text-red-400 border-red-500/30 bg-red-500/10";
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

function downloadTxt(content: string, filename: string) {
  const url = URL.createObjectURL(new Blob([content], { type: "text/plain" }));
  Object.assign(document.createElement("a"), { href: url, download: filename }).click();
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

function ScanCard({ scan }: { scan: ScanItem }) {
  const [expanded, setExpanded] = useState(false);
  const country = scan.jobCountry ? SUPPORTED_COUNTRIES[scan.jobCountry as keyof typeof SUPPORTED_COUNTRIES] : null;
  const ai = scan.aiResults;
  const lang = ai?.outputLanguage === "fr" ? "FR" : "EN";
  const scoreBefore = ai?.atsScoreBefore ?? null;
  const scoreAfter = scan.atsScore || ai?.atsScoreAfter;
  const hasCover = !!(ai?.coverLetter);
  const hasResume = !!(ai?.tailoredResume);
  const slug = `${scan.jobTitle}${scan.company ? `-${scan.company}` : ""}`.replace(/[^a-z0-9]/gi, "-").toLowerCase();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border/50 bg-card/30 hover:bg-card/50 transition-all overflow-hidden"
    >
      <div className="p-4 flex items-start gap-4 flex-wrap">
        {/* Country flag / icon */}
        <div className="h-10 w-10 rounded-xl bg-primary/8 border border-primary/15 flex items-center justify-center shrink-0 text-lg mt-0.5">
          {country?.flag ?? <Globe className="h-4 w-4 text-muted-foreground" />}
        </div>

        {/* Main info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 flex-wrap">
            <p className="font-semibold text-sm">{scan.jobTitle}</p>
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
          </div>
        </div>

        {/* ATS scores */}
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
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-lg hover:bg-accent"
          >
            {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            {expanded ? "Less" : "Downloads"}
          </button>
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
            <div className="border-t border-border/30 p-4 space-y-3 bg-card/20">

              {/* Downloads */}
              <div className="flex items-center gap-2 flex-wrap">
                {hasResume && (
                  <>
                    <Button size="sm" variant="gradient" className="h-7 text-xs gap-1.5"
                      onClick={() => openPDF(ai!.tailoredResume!, `Resume-${slug}`)}>
                      <FileText className="h-3 w-3" />Resume PDF
                    </Button>
                    <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5"
                      onClick={() => downloadTxt(ai!.tailoredResume!, `resume-${slug}.txt`)}>
                      <Download className="h-3 w-3" />.txt
                    </Button>
                  </>
                )}
                {hasCover && (
                  <>
                    <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5"
                      onClick={() => openPDF(ai!.coverLetter!, `Cover-${slug}`)}>
                      <Mail className="h-3 w-3" />Cover Letter PDF
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 text-xs gap-1.5 text-muted-foreground"
                      onClick={() => downloadTxt(ai!.coverLetter!, `cover-${slug}.txt`)}>
                      <Download className="h-3 w-3" />.txt
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
          <h2 className="text-lg font-semibold mb-1">No generations yet</h2>
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

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search by job title, company, or country..."
          className="w-full rounded-xl border border-border bg-background pl-10 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
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
          {/* Group label */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold uppercase tracking-wide">
              <Calendar className="h-3.5 w-3.5" />
              {label}
            </div>
            <div className="flex-1 h-px bg-border/40" />
            <span className="text-xs text-muted-foreground">{groupScans.length}</span>
          </div>

          {/* Cards */}
          <div className="space-y-2">
            {groupScans.map(scan => (
              <ScanCard key={scan.id} scan={scan} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
