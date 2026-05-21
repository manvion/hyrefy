"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/components/shared/language-provider";
import { toast } from "@/components/ui/toaster";
import {
  Loader2, Mail, Download, Copy, Check, Globe, Sparkles,
  FileText, ChevronDown,
} from "lucide-react";
import { openPrintCoverLetter, downloadDocxCoverLetter } from "@/components/resume/resume-templates";

type Language = "en" | "fr";
type Tone = "professional" | "enthusiastic" | "concise";

const TONE_LABELS = {
  professional: { en: "Professional", fr: "Professionnel" },
  enthusiastic: { en: "Enthusiastic", fr: "Enthousiaste" },
  concise: { en: "Concise", fr: "Concis" },
};

export function CoverLetterClient({ resumeText, resumeId }: { resumeText?: string; resumeId?: string }) {
  const router = useRouter();
  const { language: uiLang } = useLanguage();
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [outputLanguage, setOutputLanguage] = useState<Language>(uiLang as Language);
  const [tone, setTone] = useState<Tone>("professional");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ coverLetter: string; wordCount: number; highlights: string[] } | null>(null);
  const [copied, setCopied] = useState(false);

  const generate = async () => {
    if (!jobTitle || !jobDescription) {
      toast({ title: "Missing info", description: "Please fill in job title and description.", variant: "destructive" });
      return;
    }
    if (!resumeText && !resumeId) {
      toast({ title: "No resume", description: "Please upload a resume first.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText, resumeId, jobTitle, jobDescription, companyName, language: outputLanguage, tone }),
      });
      if (!response.ok) throw new Error("Generation failed");
      const data = await response.json();
      setResult(data);
      router.refresh();
    } catch {
      toast({ title: "Error", description: "Failed to generate cover letter. Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result.coverLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Copied!", description: "Cover letter copied to clipboard." });
  };

  const downloadDocx = async () => {
    if (!result) return;
    await downloadDocxCoverLetter(result.coverLetter, `cover-letter-${outputLanguage}.docx`);
  };

  const downloadPDF = () => {
    if (!result) return;
    openPrintCoverLetter(result.coverLetter, `Cover Letter`);
  };

  return (
    <div className="space-y-6">
      <Card className="border-border/50 bg-card/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Mail className="h-4 w-4 text-primary" />
            {uiLang === "fr" ? "Détails du poste" : "Job Details"}
          </CardTitle>
          <CardDescription>
            {uiLang === "fr" ? "Complétez les informations pour personnaliser votre lettre" : "Fill in the details to personalize your cover letter"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">
                {uiLang === "fr" ? "Titre du poste" : "Job Title"} *
              </label>
              <input
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder={uiLang === "fr" ? "ex. Développeur Senior" : "e.g. Senior Software Engineer"}
                className="w-full rounded-lg border border-border/50 bg-background/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">
                {uiLang === "fr" ? "Entreprise (optionnel)" : "Company (optional)"}
              </label>
              <input
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder={uiLang === "fr" ? "ex. Google, Ubisoft..." : "e.g. Google, Airbnb..."}
                className="w-full rounded-lg border border-border/50 bg-background/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">
              {uiLang === "fr" ? "Description du poste" : "Job Description"} *
            </label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder={uiLang === "fr" ? "Collez l'offre d'emploi complète ici..." : "Paste the full job posting here..."}
              rows={6}
              className="w-full rounded-lg border border-border/50 bg-background/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all resize-none"
            />
          </div>

          {/* Language & Tone selectors */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5" />
                {uiLang === "fr" ? "Langue de sortie" : "Output Language"}
              </label>
              <div className="flex gap-2">
                {(["en", "fr"] as Language[]).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setOutputLanguage(lang)}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium border transition-all ${
                      outputLanguage === lang
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border/50 bg-background/30 text-muted-foreground hover:border-border"
                    }`}
                  >
                    {lang === "en" ? "🇬🇧 English" : "🇫🇷 Français"}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                {uiLang === "fr" ? "Ton" : "Tone"}
              </label>
              <div className="relative">
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value as Tone)}
                  className="w-full appearance-none rounded-lg border border-border/50 bg-background/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all pr-8"
                >
                  {(Object.keys(TONE_LABELS) as Tone[]).map((t) => (
                    <option key={t} value={t}>{TONE_LABELS[t][uiLang as "en" | "fr"]}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          </div>

          <Button
            onClick={generate}
            disabled={loading || !jobTitle || !jobDescription}
            variant="gradient"
            className="w-full"
          >
            {loading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{uiLang === "fr" ? "Génération en cours..." : "Generating..."}</>
            ) : (
              <><Sparkles className="mr-2 h-4 w-4" />{uiLang === "fr" ? "Générer la lettre de motivation" : "Generate Cover Letter"}</>
            )}
          </Button>
        </CardContent>
      </Card>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
          >
            <Card className="border-border/50 bg-card/30">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <FileText className="h-4 w-4 text-emerald-400" />
                    {uiLang === "fr" ? "Votre lettre de motivation" : "Your Cover Letter"}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {result.wordCount} {uiLang === "fr" ? "mots" : "words"}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {outputLanguage === "en" ? "🇬🇧 EN" : "🇫🇷 FR"}
                    </Badge>
                  </div>
                </div>
                {result.highlights.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {result.highlights.map((h, i) => (
                      <Badge key={i} variant="outline" className="text-xs text-emerald-400 border-emerald-500/20">
                        ✓ {h}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-xl border border-border/40 bg-background/40 p-5">
                  <pre className="whitespace-pre-wrap text-sm leading-relaxed font-sans text-foreground">
                    {result.coverLetter}
                  </pre>
                </div>
                <div className="flex gap-3">
                  <Button onClick={copyToClipboard} variant="outline" className="flex-1">
                    {copied ? <Check className="mr-2 h-4 w-4 text-emerald-400" /> : <Copy className="mr-2 h-4 w-4" />}
                    {copied ? (uiLang === "fr" ? "Copié!" : "Copied!") : (uiLang === "fr" ? "Copier" : "Copy")}
                  </Button>
                  <Button onClick={downloadDocx} variant="gradient" className="flex-1">
                    <Download className="mr-2 h-4 w-4" />
                    {uiLang === "fr" ? "Télécharger (.docx)" : "Download (.docx)"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
