"use client";

import { motion } from "framer-motion";
import { useLanguage } from "@/components/shared/language-provider";

const COUNTRIES = [
  { flag: "🇺🇸", name: "United States",  standard: "ATS-optimized" },
  { flag: "🇨🇦", name: "Canada",          standard: "Bilingual-ready" },
  { flag: "🇬🇧", name: "United Kingdom",  standard: "CV format" },
  { flag: "🇦🇺", name: "Australia",       standard: "Key achievements" },
  { flag: "🇳🇿", name: "New Zealand",     standard: "Community focus" },
  { flag: "🇫🇷", name: "France",          standard: "Format européen" },
  { flag: "🇧🇪", name: "Belgium",         standard: "Multilingue FR/NL" },
  { flag: "🇨🇭", name: "Switzerland",     standard: "Précis & structuré" },
  { flag: "🇮🇳", name: "India",           standard: "Skills-first format" },
];

const STATS = [
  { value: "9", label: "Countries Supported" },
  { value: "2", label: "Languages (EN / FR)" },
  { value: "9", label: "Resume Standards" },
  { value: "AI", label: "Tailored Every Time" },
];

export function GlobalSection() {
  const { language } = useLanguage();

  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[300px] bg-primary/4 rounded-full blur-[80px]" />
      </div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-primary mb-4 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
            {language === "fr" ? "Marchés Supportés" : "Supported Markets"}
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
            {language === "fr"
              ? "Optimisé pour chaque marché de l'emploi"
              : "Tailored to your target country"}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {language === "fr"
              ? "Notre IA connaît les formats CV, les normes et les attentes des recruteurs pour chaque marché."
              : "Our AI applies the exact resume format, tone, and recruiter expectations for each market."}
          </p>
        </motion.div>

        {/* Country cards grid — full name + flag + standard */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-12">
          {COUNTRIES.map((c, i) => (
            <motion.div
              key={c.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="flex items-center gap-3 p-4 rounded-xl border border-border/30 bg-card/20 hover:bg-card/50 hover:border-primary/30 transition-all cursor-default group"
            >
              <span className="text-3xl shrink-0 group-hover:scale-110 transition-transform">{c.flag}</span>
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">{c.name}</p>
                <p className="text-[10px] text-muted-foreground truncate">{c.standard}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center p-5 rounded-2xl border border-border/30 bg-card/20"
            >
              <p className="text-3xl font-black text-primary mb-1">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
