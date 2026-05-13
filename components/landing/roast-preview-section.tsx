"use client";

import { motion } from "framer-motion";
import { Flame, AlertTriangle, CheckCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/components/shared/language-provider";

const SAMPLE_ISSUES = [
  { severity: "critical", text: "Zero metrics — no numbers anywhere. '5 years experience' = irrelevant.", fix: "Add $, %, numbers to every bullet" },
  { severity: "major",   text: "Buzzwords detected: 'results-driven', 'passionate', 'team player'", fix: "Replace with specific achievements" },
  { severity: "major",   text: "Weak verbs: 'helped', 'assisted', 'responsible for'", fix: "Use: Led, Built, Grew, Delivered" },
  { severity: "minor",   text: "Skills section reads like a grocery list", fix: "Group by category, add proficiency levels" },
];

export function RoastPreviewSection() {
  const { language } = useLanguage();

  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/3 right-0 w-[400px] h-[400px] bg-orange-500/5 rounded-full blur-[100px]" />
      </div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: copy */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-orange-400 mb-4 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20">
              <Flame className="h-3 w-3" />
              {language === "fr" ? "Critique Brutale" : "Brutal Honesty"}
            </span>
            <h2 className="text-4xl font-bold tracking-tight mb-4">
              {language === "fr"
                ? "Le rôti de CV qui change tout"
                : "The Resume Roast that changes everything"}
            </h2>
            <p className="text-muted-foreground mb-6">
              {language === "fr"
                ? "Notre IA donne la critique que votre meilleur ami ne vous donnera jamais. Problèmes spécifiques, corrections spécifiques. Pas de fla-fla."
                : "Our AI gives you the feedback your best friend won't. Specific problems, specific fixes. No sugar-coating."}
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
              <CheckCircle className="h-4 w-4 text-emerald-400" />
              {language === "fr" ? "Détection de mots-clés faibles" : "Weak verb detection"}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
              <CheckCircle className="h-4 w-4 text-emerald-400" />
              {language === "fr" ? "Détection de buzzwords" : "Buzzword detection"}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
              <CheckCircle className="h-4 w-4 text-emerald-400" />
              {language === "fr" ? "Carte partageable avec notation A–S" : "Shareable card with A–S grade"}
            </div>
            <Link
              href="/roast"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 px-5 py-2.5 text-sm font-semibold text-white hover:from-orange-600 hover:to-red-600 transition-all shadow-lg shadow-orange-500/25"
            >
              <Flame className="h-4 w-4" />
              {language === "fr" ? "Rôtir mon CV" : "Roast My Resume"}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>

          {/* Right: sample roast card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-3"
          >
            {/* Grade card */}
            <div className="rounded-2xl border border-orange-500/20 bg-card/40 p-4 flex items-center gap-4">
              <div className="h-16 w-16 rounded-xl bg-amber-500/10 ring-4 ring-amber-500/30 flex flex-col items-center justify-center shrink-0">
                <span className="text-2xl font-black text-amber-400">C</span>
                <span className="text-[10px] text-muted-foreground">64/100</span>
              </div>
              <div>
                <p className="text-sm font-semibold">Sample Resume Score</p>
                <p className="text-xs text-muted-foreground mt-0.5">"Your resume isn&apos;t terrible, but it&apos;s not getting you interviews either. You&apos;re invisible to ATS and forgettable to humans."</p>
              </div>
            </div>

            {/* Issues */}
            {SAMPLE_ISSUES.map((issue, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 + i * 0.08 }}
                className={`rounded-xl p-3.5 ${issue.severity === "critical" ? "bg-red-500/10 border border-red-500/20" : issue.severity === "major" ? "bg-amber-500/10 border border-amber-500/20" : "bg-blue-500/10 border border-blue-500/20"}`}
              >
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className={`h-3.5 w-3.5 mt-0.5 shrink-0 ${issue.severity === "critical" ? "text-red-400" : issue.severity === "major" ? "text-amber-400" : "text-blue-400"}`} />
                  <div>
                    <p className="text-xs text-foreground/90">{issue.text}</p>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      <span className="text-emerald-400 font-semibold">Fix: </span>{issue.fix}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
