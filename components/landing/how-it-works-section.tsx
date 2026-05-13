"use client";

import { motion } from "framer-motion";
import { useLanguage } from "@/components/shared/language-provider";
import { Upload, Search, Download } from "lucide-react";

const STEP_ICONS = [Upload, Search, Download];
const STEP_COLORS = ["bg-primary/10 border-primary/20 text-primary", "bg-blue-500/10 border-blue-500/20 text-blue-400", "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"];

export function HowItWorksSection() {
  const { t } = useLanguage();

  return (
    <section id="how-it-works" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-0 right-0 h-px top-0 bg-gradient-to-r from-transparent via-border/50 to-transparent" />
        <div className="absolute left-0 right-0 h-px bottom-0 bg-gradient-to-r from-transparent via-border/50 to-transparent" />
        <div className="absolute inset-0 bg-muted/5" />
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
            {t.howItWorks.title}
          </h2>
          <p className="text-lg text-muted-foreground">{t.howItWorks.subtitle}</p>
        </motion.div>

        <div className="relative">
          {/* Connector line */}
          <div className="absolute top-16 left-1/2 -translate-x-1/2 w-[60%] h-px bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20 hidden lg:block" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {t.howItWorks.steps.map((step, i) => {
              const Icon = STEP_ICONS[i];
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.15 }}
                  className="text-center group"
                >
                  <div className="relative inline-flex mb-6">
                    <div className={`h-16 w-16 rounded-2xl border ${STEP_COLORS[i]} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="h-7 w-7" />
                    </div>
                    <div className="absolute -top-3 -right-3 h-7 w-7 rounded-full bg-primary border-2 border-background flex items-center justify-center">
                      <span className="text-[10px] font-bold text-primary-foreground">{step.step}</span>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed text-sm">{step.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
