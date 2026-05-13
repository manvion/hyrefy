"use client";

import { motion } from "framer-motion";
import { useLanguage } from "@/components/shared/language-provider";
import { TrendingUp, X, Check, ArrowRight } from "lucide-react";

const EXAMPLES = [
  {
    before: { score: 31, label: "Marketing Manager", issues: ["Missing keywords: ROI, KPI, conversion", "No quantified achievements", "Generic bullet points", "Poor formatting score"] },
    after: { score: 89, label: "Marketing Manager", wins: ["All key terms matched", "7 quantified achievements added", "Action-verb bullets optimized", "ATS-friendly structure"] },
  },
  {
    before: { score: 44, label: "Software Engineer", issues: ["Technologies not mentioned", "Weak action verbs", "No impact metrics", "Missing required skills"] },
    after: { score: 93, label: "Software Engineer", wins: ["React, AWS, TypeScript matched", "Led → Architected, Built → Engineered", "3x performance improvements cited", "All required skills matched"] },
  },
];

export function BeforeAfterSection() {
  const { t } = useLanguage();
  const ex = EXAMPLES[0];

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-primary/5 rounded-full blur-[100px]" />
      </div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
            {t.beforeAfter.title}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t.beforeAfter.subtitle}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {/* Before */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="absolute -top-3 left-6 z-10">
              <span className="bg-destructive/90 text-destructive-foreground text-xs font-bold px-3 py-1 rounded-full">
                {t.beforeAfter.before}
              </span>
            </div>
            <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6 h-full">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-sm text-muted-foreground">{ex.before.label}</p>
                  <p className="text-xs text-muted-foreground/60 mt-0.5">ATS Score</p>
                </div>
                <div className="text-right">
                  <div className="relative h-16 w-16">
                    <svg className="h-16 w-16 -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="40" fill="none" stroke="hsl(var(--muted))" strokeWidth="10" />
                      <circle cx="50" cy="50" r="40" fill="none" stroke="hsl(var(--destructive))" strokeWidth="10" strokeLinecap="round"
                        strokeDasharray={`${(ex.before.score / 100) * 251.2} 251.2`} opacity="0.6" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-lg font-bold text-destructive">{ex.before.score}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-2.5">
                {ex.before.issues.map((issue, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <div className="h-4 w-4 rounded-full bg-destructive/20 border border-destructive/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <X className="h-2.5 w-2.5 text-destructive" />
                    </div>
                    <p className="text-sm text-muted-foreground">{issue}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-destructive/10">
                <p className="text-xs text-muted-foreground/60">Most applications rejected by ATS before a human sees them.</p>
              </div>
            </div>
          </motion.div>

          {/* Arrow */}
          <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="h-12 w-12 rounded-full bg-primary border-2 border-primary/30 flex items-center justify-center shadow-lg shadow-primary/25"
            >
              <ArrowRight className="h-5 w-5 text-primary-foreground" />
            </motion.div>
          </div>

          {/* After */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="relative"
          >
            <div className="absolute -top-3 left-6 z-10">
              <span className="bg-emerald-500/90 text-white text-xs font-bold px-3 py-1 rounded-full">
                {t.beforeAfter.after}
              </span>
            </div>
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6 h-full">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-sm text-muted-foreground">{ex.after.label}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <TrendingUp className="h-3 w-3 text-emerald-400" />
                    <p className="text-xs text-emerald-400 font-medium">
                      +{ex.after.score - ex.before.score} {t.beforeAfter.improvement}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="relative h-16 w-16">
                    <svg className="h-16 w-16 -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="40" fill="none" stroke="hsl(var(--muted))" strokeWidth="10" />
                      <circle cx="50" cy="50" r="40" fill="none" stroke="hsl(142.1 76.2% 36.3%)" strokeWidth="10" strokeLinecap="round"
                        strokeDasharray={`${(ex.after.score / 100) * 251.2} 251.2`} />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-lg font-bold text-emerald-400">{ex.after.score}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-2.5">
                {ex.after.wins.map((win, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <div className="h-4 w-4 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="h-2.5 w-2.5 text-emerald-400" />
                    </div>
                    <p className="text-sm text-muted-foreground">{win}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-emerald-500/10">
                <p className="text-xs text-emerald-400/70 font-medium">Top 5% of applicants. Recruiter callback within 48h.</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Mini examples row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-12 flex flex-wrap justify-center gap-4"
        >
          {[
            { role: "Product Manager", from: 28, to: 85 },
            { role: "Data Scientist", from: 41, to: 92 },
            { role: "UX Designer", from: 35, to: 88 },
            { role: "Sales Executive", from: 22, to: 79 },
          ].map((item) => (
            <div key={item.role} className="rounded-xl border border-border/40 bg-card/30 px-5 py-3 flex items-center gap-3">
              <span className="text-sm font-medium text-muted-foreground">{item.role}</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-destructive/70">{item.from}</span>
                <ArrowRight className="h-3 w-3 text-primary" />
                <span className="text-sm font-bold text-emerald-400">{item.to}</span>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
