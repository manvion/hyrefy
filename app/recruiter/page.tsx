"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";
import { Building2, ArrowLeft, Bell, CheckCircle2, Users, BarChart3, Briefcase, Layers } from "lucide-react";
import { HyreLogo } from "@/components/shared/hyrefy-logo";
import { Button } from "@/components/ui/button";

const FEATURES = [
  { icon: Users, title: "AI Candidate Screening", desc: "Automatically screen hundreds of applicants and rank them by fit." },
  { icon: BarChart3, title: "Smart Job Matching", desc: "AI matches resumes to job descriptions with detailed scoring." },
  { icon: Briefcase, title: "Pipeline Management", desc: "Visual hiring pipeline from application to offer in one place." },
  { icon: Layers, title: "Collaborative Hiring", desc: "Invite your team to evaluate candidates and leave feedback." },
];

export default function RecruiterPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleNotify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    try {
      await fetch("/api/recruiter/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
    } catch {
      // Save failed silently — still show confirmation
    }
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Ambient background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-amber-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px]" />
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(to right, hsl(var(--foreground)) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* Top bar */}
      <header className="flex h-16 items-center justify-between px-6 lg:px-12 border-b border-border/20">
        <div className="flex items-center gap-2.5">
          <HyreLogo size={32} />
          <span className="text-lg font-bold tracking-tight">Hyrefy</span>
          <span className="text-xs text-muted-foreground/50 font-medium ml-1">for Recruiters</span>
        </div>
        <Link
          href="/"
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto"
        >
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="h-20 w-20 rounded-3xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
              <Building2 className="h-10 w-10 text-amber-400" />
            </div>
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-xs font-semibold text-amber-400 uppercase tracking-widest">Under Development</span>
          </div>

          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight mb-4">
            Recruiter Platform
          </h1>
          <h2 className="text-xl sm:text-2xl font-semibold text-primary mb-4">
            Coming Soon
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-12 leading-relaxed">
            We&apos;re building a powerful AI-driven platform for recruiters — smarter screening, better matches, faster hiring. Be the first to know when we launch.
          </p>

          {/* Email notify form */}
          {!submitted ? (
            <form onSubmit={handleNotify} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto mb-12">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@company.com"
                className="flex-1 rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
              />
              <Button type="submit" variant="gradient" size="default">
                <Bell className="mr-2 h-4 w-4" />
                Notify Me
              </Button>
            </form>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center justify-center gap-2 text-emerald-400 font-medium mb-12"
            >
              <CheckCircle2 className="h-5 w-5" />
              You&apos;re on the list — we&apos;ll notify you at launch!
            </motion.div>
          )}

          {/* Upcoming features */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.08 }}
                className="rounded-xl border border-border/40 bg-card/20 p-5"
              >
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                    <f.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold mb-0.5">{f.title}</p>
                    <p className="text-xs text-muted-foreground">{f.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-muted-foreground/40 border-t border-border/20 space-x-4">
        <span>© {new Date().getFullYear()} Hyrefy</span>
        <span>·</span>
        <Link href="/" className="hover:text-muted-foreground transition-colors">Home</Link>
        <span>·</span>
        <Link href="/job-seekers" className="hover:text-muted-foreground transition-colors">For Job Seekers</Link>
      </footer>
    </div>
  );
}
