"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FileText, Building2, ArrowRight, CheckCircle, Clock } from "lucide-react";
import { LanguageToggle } from "@/components/shared/language-toggle";
import { HyreLogo } from "@/components/shared/hyrefy-logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const RECRUITER_URL = process.env.NEXT_PUBLIC_RECRUITER_URL || "/recruiter";

export default function SelectorPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col overflow-hidden">

      {/* ── Ambient background ───────────────────────────────────── */}
      <div className="fixed inset-0 -z-10">
        {/* Primary glow — left */}
        <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/8 rounded-full blur-[140px]" />
        {/* Violet glow — right */}
        <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[120px]" />
        {/* Subtle top streak */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
                              linear-gradient(to right, hsl(var(--foreground)) 1px, transparent 1px)`,
            backgroundSize: "56px 56px",
          }}
        />
      </div>

      {/* ── Header ───────────────────────────────────────────────── */}
      <header className="flex h-16 items-center justify-between px-6 lg:px-14 shrink-0">
        <div className="flex items-center gap-2.5">
          <HyreLogo size={36} />
          <span className="text-xl font-bold tracking-tight">Hyrefy</span>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <LanguageToggle />
          <Link
            href="/sign-in"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-accent"
          >
            Sign in
          </Link>
        </div>
      </header>

      {/* ── Hero copy ─────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="text-center mb-10"
        >
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-primary px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/25 mb-5">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            AI-Powered Career Platform
          </span>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-4 leading-[1.05]">
            Who are you?
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-lg mx-auto leading-relaxed">
            Two platforms, one mission — helping the right people find each other.
          </p>
        </motion.div>

        {/* ── Choice cards ─────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full max-w-4xl">

          {/* ── Job Seeker ─────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.12 }}
          >
            <Link href={`${APP_URL}/job-seekers`} className="block h-full">
              <div className="
                group relative h-full rounded-2xl overflow-hidden cursor-pointer
                border border-primary/25
                bg-gradient-to-br from-primary/12 via-primary/6 to-blue-600/5
                hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/20
                transition-all duration-300
              ">
                {/* Glow sweep on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-primary/10 via-transparent to-transparent" />

                <div className="relative p-8 flex flex-col h-full">
                  {/* Icon + badge row */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="h-14 w-14 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center group-hover:scale-110 group-hover:bg-primary/30 transition-all duration-300">
                      <FileText className="h-7 w-7 text-primary" />
                    </div>
                    <span className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Live Now
                    </span>
                  </div>

                  <h2 className="text-2xl font-bold mb-2">Job Seeker</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                    Upload your master resume once. Paste any job posting — get a perfectly tailored resume <strong className="text-foreground/80">and</strong> cover letter in English or French within seconds.
                  </p>

                  <ul className="space-y-2 mb-7 flex-1">
                    {[
                      "AI resume tailored to every job",
                      "Cover letter in English or French",
                      "9 countries, country-specific standards",
                      "ATS optimized · 6-month history",
                    ].map((f) => (
                      <li key={f} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                        <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  {/* CTA button — prominent gradient */}
                  <div className="relative">
                    {/* Glow behind button */}
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-600 to-blue-800 blur-md opacity-60 group-hover:opacity-80 transition-opacity" />
                    <div className="
                      relative flex items-center justify-center gap-2 w-full py-4 rounded-xl font-bold text-sm
                      bg-gradient-to-r from-blue-600 to-blue-800
                      text-white shadow-lg shadow-blue-600/40
                      group-hover:shadow-blue-600/60 group-hover:scale-[1.02]
                      transition-all duration-200 overflow-hidden
                    ">
                      {/* Shine sweep */}
                      <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-700 bg-gradient-to-r from-transparent via-white/15 to-transparent skew-x-12" />
                      <span>Get Started Free</span>
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>

          {/* ── Recruiter ──────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.22 }}
          >
            <Link href={RECRUITER_URL} className="block h-full">
              <div className="
                group relative h-full rounded-2xl overflow-hidden cursor-pointer
                border border-border/40 bg-card/15
                hover:border-border/70 hover:bg-card/30
                transition-all duration-300
              ">
                <div className="relative p-8 flex flex-col h-full">
                  {/* Icon + badge row */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="h-14 w-14 rounded-2xl bg-muted/40 border border-border/50 flex items-center justify-center group-hover:scale-110 group-hover:bg-muted/60 transition-all duration-300">
                      <Building2 className="h-7 w-7 text-muted-foreground/70" />
                    </div>
                    <span className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-500/12 text-amber-400 border border-amber-500/25">
                      <Clock className="h-3 w-3" />
                      Coming Soon
                    </span>
                  </div>

                  <h2 className="text-2xl font-bold mb-2 text-foreground/70">Recruiter</h2>
                  <p className="text-sm text-muted-foreground/80 leading-relaxed mb-5">
                    A dedicated hiring platform — post jobs, screen candidates with AI, and find the best-fit talent faster than ever. Launching soon.
                  </p>

                  <ul className="space-y-2 mb-7 flex-1">
                    {[
                      "AI-powered candidate screening",
                      "Smart resume–job matching",
                      "Visual hiring pipeline",
                      "Team collaboration tools",
                    ].map((f) => (
                      <li key={f} className="flex items-center gap-2.5 text-sm text-muted-foreground/60">
                        <CheckCircle className="h-4 w-4 text-muted-foreground/30 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  {/* CTA button — muted with hover glow */}
                  <div className="
                    flex items-center justify-center gap-2 w-full py-4 rounded-xl font-semibold text-sm
                    border border-border/50 bg-muted/20 text-muted-foreground/70
                    group-hover:border-amber-500/40 group-hover:bg-amber-500/5 group-hover:text-amber-400
                    group-hover:shadow-lg group-hover:shadow-amber-500/10
                    transition-all duration-200
                  ">
                    Learn More
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        </div>

        {/* Domain hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
          className="mt-7 flex items-center gap-3 text-xs text-muted-foreground/40"
        >
          <a href={`${APP_URL}/job-seekers`} className="flex items-center gap-1 hover:text-muted-foreground/70 hover:underline transition-colors">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            app.hyrefy.com
          </a>
          <span>·</span>
          <a href={RECRUITER_URL} className="flex items-center gap-1 hover:text-muted-foreground/70 hover:underline transition-colors">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            recruiter.hyrefy.com
          </a>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="py-5 text-center text-xs text-muted-foreground/35 border-t border-border/15 shrink-0">
        © {new Date().getFullYear()} Hyrefy &nbsp;·&nbsp;
        <Link href="/privacy" className="hover:text-muted-foreground transition-colors">Privacy</Link>
        &nbsp;·&nbsp;
        <Link href="/terms" className="hover:text-muted-foreground transition-colors">Terms</Link>
      </footer>
    </div>
  );
}
