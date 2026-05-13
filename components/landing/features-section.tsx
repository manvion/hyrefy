"use client";

import { motion } from "framer-motion";
import { useLanguage } from "@/components/shared/language-provider";
import { BarChart3, FileText, Mail, Globe, Wand2, Clock } from "lucide-react";

const FEATURE_ICONS = [BarChart3, FileText, Mail, Globe, Wand2, Clock];
const FEATURE_COLORS = [
  { bg: "bg-emerald-500/10", border: "border-emerald-500/20", icon: "text-emerald-400" },
  { bg: "bg-blue-500/10", border: "border-blue-500/20", icon: "text-blue-400" },
  { bg: "bg-purple-500/10", border: "border-purple-500/20", icon: "text-purple-400" },
  { bg: "bg-amber-500/10", border: "border-amber-500/20", icon: "text-amber-400" },
  { bg: "bg-pink-500/10", border: "border-pink-500/20", icon: "text-pink-400" },
  { bg: "bg-cyan-500/10", border: "border-cyan-500/20", icon: "text-cyan-500" },
];

export function FeaturesSection() {
  const { t } = useLanguage();
  const featureKeys = Object.keys(t.features.items) as Array<keyof typeof t.features.items>;

  return (
    <section id="features" className="py-24 relative">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-32 bg-gradient-to-b from-transparent to-primary/20" />
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
            {t.features.title}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t.features.subtitle}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {featureKeys.map((key, i) => {
            const feature = t.features.items[key];
            const Icon = FEATURE_ICONS[i];
            const color = FEATURE_COLORS[i];
            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="group relative"
              >
                <div className={`relative h-full rounded-2xl border border-border/40 bg-card/30 hover:bg-card/60 hover:border-border/70 p-6 transition-all duration-300`}>
                  <div className={`h-11 w-11 rounded-xl ${color.bg} border ${color.border} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`h-5 w-5 ${color.icon}`} />
                  </div>
                  <h3 className="text-base font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
