"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface ProgressStep {
  label: string;
  duration: number; // ms to spend on this step before moving to next
}

interface GeneratingProgressProps {
  steps: ProgressStep[];
  title: string;
  subtitle?: string;
  accentClass?: string; // e.g. "text-primary" / "text-orange-400" / "text-violet-400"
  className?: string;
}

export function GeneratingProgress({
  steps,
  title,
  subtitle,
  accentClass = "text-primary",
  className,
}: GeneratingProgressProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [barPct, setBarPct] = useState(0);

  useEffect(() => {
    const totalMs = steps.reduce((s, step) => s + step.duration, 0);
    const tick = 80;
    let elapsed = 0;

    const id = setInterval(() => {
      elapsed += tick;

      let cumulative = 0;
      for (let i = 0; i < steps.length; i++) {
        cumulative += steps[i].duration;
        if (elapsed < cumulative) { setCurrentStep(i); break; }
        if (i === steps.length - 1) setCurrentStep(i);
      }

      setBarPct(Math.min(96, (elapsed / totalMs) * 100));
      if (elapsed >= totalMs) clearInterval(id);
    }, tick);

    return () => clearInterval(id);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const borderClass = accentClass.includes("orange") ? "border-orange-500/30" :
    accentClass.includes("violet") ? "border-violet-500/30" :
    accentClass.includes("cyan") ? "border-cyan-500/30" : "border-primary/30";

  const bgClass = accentClass.includes("orange") ? "bg-orange-500/10" :
    accentClass.includes("violet") ? "bg-violet-500/10" :
    accentClass.includes("cyan") ? "bg-cyan-500/10" : "bg-primary/10";

  const gradientFrom = accentClass.includes("orange") ? "from-orange-500" :
    accentClass.includes("violet") ? "from-violet-500" :
    accentClass.includes("cyan") ? "from-cyan-500" : "from-primary";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn("rounded-2xl border border-border/50 bg-card/30 p-6 space-y-5", className)}
    >
      {/* Header with pulsing orb */}
      <div className="flex items-center gap-4">
        <div className="relative h-12 w-12 shrink-0">
          <div className={cn("absolute inset-0 rounded-full animate-ping", bgClass)} style={{ animationDuration: "1.4s" }} />
          <div className={cn("relative h-12 w-12 rounded-full border-2 flex items-center justify-center", bgClass, borderClass)}>
            <div className={cn("h-5 w-5 rounded-full border-2 border-t-transparent animate-spin", accentClass.replace("text-", "border-"))} />
          </div>
        </div>
        <div>
          <p className="font-semibold text-foreground">{title}</p>
          {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-2">
        {steps.map((step, i) => {
          const done = i < currentStep;
          const active = i === currentStep;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 transition-all duration-300",
                active && cn("border", borderClass, bgClass, "bg-opacity-50"),
              )}
            >
              {done ? (
                <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
              ) : active ? (
                <div className={cn("h-4 w-4 shrink-0 rounded-full border-2 border-t-transparent animate-spin", accentClass.replace("text-", "border-"))} />
              ) : (
                <div className="h-4 w-4 shrink-0 rounded-full border-2 border-muted-foreground/20" />
              )}
              <span className={cn(
                "text-sm transition-colors",
                active ? "text-foreground font-medium" :
                done ? "text-muted-foreground/60 line-through" :
                "text-muted-foreground/40",
              )}>
                {step.label}
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div>
        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
          <motion.div
            className={cn("h-full rounded-full bg-gradient-to-r to-blue-400", gradientFrom)}
            animate={{ width: `${barPct}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>
        <p className="text-[11px] text-muted-foreground text-right mt-1">{Math.round(barPct)}%</p>
      </div>
    </motion.div>
  );
}
