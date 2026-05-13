"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/components/shared/language-provider";
import { ArrowRight, Sparkles, TrendingUp, Shield, Zap, Star } from "lucide-react";

const COUNTER_TARGETS = [
  { key: "atsRate" as const, icon: Shield, color: "text-emerald-400" },
  { key: "faster" as const, icon: Zap, color: "text-primary" },
  { key: "interviews" as const, icon: TrendingUp, color: "text-amber-400" },
];

export function HeroSection() {
  const { t } = useLanguage();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Premium multi-layer background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[700px] bg-primary/8 rounded-full blur-[140px]" />
        <div className="absolute top-1/4 left-1/6 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/6 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[80px]" />
        <div className="absolute top-3/4 left-1/2 w-[600px] h-[300px] bg-primary/5 rounded-full blur-[80px]" />
        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(to right, hsl(var(--foreground)) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />
        {/* Noise texture */}
        <div className="absolute inset-0 opacity-[0.015] bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZmlsdGVyIGlkPSJub2lzZSI+PGZlVHVyYnVsZW5jZSB0eXBlPSJmcmFjdGFsTm9pc2UiIGJhc2VGcmVxdWVuY3k9IjAuNjUiIG51bU9jdGF2ZXM9IjMiIHN0aXRjaFRpbGVzPSJzdGl0Y2giLz48L2ZpbHRlcj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsdGVyPSJ1cmwoI25vaXNlKSIgb3BhY2l0eT0iMSIvPjwvc3ZnPg==')]" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 text-center">
        {/* Social proof pill */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-3 mb-8"
        >
          <div className="flex items-center gap-1 rounded-full border border-border/60 bg-card/40 backdrop-blur-sm px-4 py-2">
            <div className="flex -space-x-1.5 mr-2">
              {["bg-blue-500", "bg-emerald-500", "bg-purple-500", "bg-amber-500"].map((c, i) => (
                <div key={i} className={`h-5 w-5 rounded-full ${c} border-2 border-background flex items-center justify-center text-[8px] text-white font-bold`}>
                  {["S", "M", "A", "J"][i]}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map(i => <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />)}
            </div>
            <span className="text-xs text-muted-foreground ml-1">1,000+ job seekers</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
        >
          <Badge variant="purple" className="mb-6 px-4 py-1.5 text-xs font-medium cursor-default">
            <Sparkles className="mr-1.5 h-3 w-3" />
            {t.hero.badge}
          </Badge>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mx-auto max-w-4xl text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.08]"
        >
          {t.hero.headline1}{" "}
          <span className="relative">
            <span className="gradient-text">{t.hero.headline2}</span>
          </span>
          <br />
          {t.hero.headline3}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mx-auto mt-6 max-w-2xl text-lg sm:text-xl text-muted-foreground leading-relaxed"
        >
          {t.hero.subheadline}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Button asChild variant="gradient" size="xl" className="shadow-2xl shadow-primary/25 hover:shadow-primary/40">
            <Link href="/sign-up">
              {t.hero.cta}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="xl" className="border-border/60 hover:bg-card/60">
            <Link href="#how-it-works">{t.hero.ctaSecondary}</Link>
          </Button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-4 text-sm text-muted-foreground"
        >
          {t.hero.trust}
        </motion.p>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-16 grid grid-cols-3 gap-6 max-w-xl mx-auto"
        >
          {COUNTER_TARGETS.map(({ key, icon: Icon, color }) => {
            const stat = t.hero.stats[key];
            return (
              <div key={key} className="relative group">
                <div className="absolute inset-0 rounded-2xl bg-primary/5 border border-primary/10 blur-sm group-hover:blur-none transition-all" />
                <div className="relative rounded-2xl border border-border/40 bg-card/30 backdrop-blur-sm p-4 text-center">
                  <Icon className={`h-5 w-5 ${color} mx-auto mb-2`} />
                  <p className="text-2xl sm:text-3xl font-bold gradient-text">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                </div>
              </div>
            );
          })}
        </motion.div>

        {/* App mockup */}
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="mt-20 relative mx-auto max-w-5xl"
        >
          {/* Glow under mockup */}
          <div className="absolute -inset-4 bg-primary/10 rounded-3xl blur-2xl" />

          <div className="relative rounded-2xl border border-border/50 bg-card/60 backdrop-blur-sm shadow-2xl shadow-black/40 overflow-hidden">
            {/* Browser chrome */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border/30 bg-muted/30">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-red-500/70" />
                <div className="h-3 w-3 rounded-full bg-yellow-500/70" />
                <div className="h-3 w-3 rounded-full bg-green-500/70" />
              </div>
              <div className="flex-1 mx-4 h-6 rounded-md bg-muted/60 flex items-center px-3 gap-2">
                <div className="h-3 w-3 rounded-full bg-muted-foreground/30" />
                <span className="text-xs text-muted-foreground">app.hyrefy.com/analyze</span>
              </div>
              <div className="h-6 px-3 rounded-md bg-primary/10 border border-primary/20 flex items-center">
                <span className="text-xs text-primary font-medium">ATS Analysis</span>
              </div>
            </div>

            {/* App preview content */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Score card */}
              <div className="col-span-1 rounded-xl border border-border/50 bg-background/40 p-5 flex flex-col items-center justify-center gap-3">
                <div className="relative h-28 w-28">
                  <svg className="h-28 w-28 -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
                    <circle
                      cx="50" cy="50" r="40" fill="none"
                      stroke="url(#scoreGrad)" strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={`${0.91 * 251.2} ${251.2}`}
                    />
                    <defs>
                      <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="hsl(262.1 83.3% 57.8%)" />
                        <stop offset="100%" stopColor="hsl(220 83% 57%)" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold">91</span>
                    <span className="text-[10px] text-muted-foreground mt-0.5">/ 100</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium text-center">ATS Score</p>
                  <Badge variant="success" className="text-xs mt-1">Excellent ↑ +37</Badge>
                </div>
              </div>

              {/* Breakdown */}
              <div className="col-span-2 space-y-4">
                <div>
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-muted-foreground font-medium">Keyword Match</span>
                    <span className="text-emerald-400 font-bold">94%</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted/60 overflow-hidden">
                    <div className="h-full w-[94%] bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-muted-foreground font-medium">Formatting & Structure</span>
                    <span className="text-blue-400 font-bold">89%</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted/60 overflow-hidden">
                    <div className="h-full w-[89%] bg-gradient-to-r from-blue-500 to-blue-400 rounded-full" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-muted-foreground font-medium">Experience Match</span>
                    <span className="text-purple-400 font-bold">88%</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted/60 overflow-hidden">
                    <div className="h-full w-[88%] bg-gradient-to-r from-purple-500 to-purple-400 rounded-full" />
                  </div>
                </div>
                <div className="pt-1 flex flex-wrap gap-1.5">
                  {["React", "TypeScript", "AWS", "Node.js", "GraphQL"].map((kw) => (
                    <span key={kw} className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20">
                      ✓ {kw}
                    </span>
                  ))}
                  <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-medium border border-amber-500/20">
                    + Cover Letter ↗
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Floating score improvement card */}
          <div className="absolute -left-10 top-12 hidden lg:block">
            <motion.div
              animate={{ y: [-5, 5, -5] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
              className="rounded-2xl border border-border/60 bg-card/90 backdrop-blur-md p-4 shadow-xl w-52"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="h-8 w-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs font-semibold">Score Improved</p>
                  <p className="text-[10px] text-muted-foreground">Just now</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Before</p>
                  <p className="text-xl font-bold text-muted-foreground">54</p>
                </div>
                <div className="flex flex-col items-center">
                  <ArrowRight className="h-4 w-4 text-emerald-400" />
                  <p className="text-[10px] text-emerald-400 font-bold">+37</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">After</p>
                  <p className="text-xl font-bold text-emerald-400">91</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Floating cover letter card */}
          <div className="absolute -right-10 bottom-8 hidden lg:block">
            <motion.div
              animate={{ y: [5, -5, 5] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
              className="rounded-2xl border border-border/60 bg-card/90 backdrop-blur-md p-4 shadow-xl w-48"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="h-8 w-8 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>
                <p className="text-xs font-semibold">Cover Letter</p>
              </div>
              <p className="text-[10px] text-muted-foreground">Generated in French</p>
              <div className="mt-2 flex gap-1">
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">EN</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/15 text-primary border border-primary/30">FR ✓</span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
