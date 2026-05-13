import type { Metadata } from "next";
import Link from "next/link";
import { HyreLogo } from "@/components/shared/hyrefy-logo";
import { ArrowLeft, Zap, Globe, Users, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "About Hyrefy",
  description: "We're building the AI platform that helps every job seeker land their dream role — tailored resumes and cover letters in seconds.",
};

const VALUES = [
  {
    icon: Zap,
    title: "Speed without compromise",
    desc: "A perfectly tailored resume in seconds, not hours. We built Hyrefy so you can apply fast without sacrificing quality.",
  },
  {
    icon: Globe,
    title: "Built for every market",
    desc: "From India to Canada, France to Australia — Hyrefy knows every country's resume standards so your application fits perfectly.",
  },
  {
    icon: Users,
    title: "For every job seeker",
    desc: "Whether you're a fresh graduate or a seasoned executive, Hyrefy levels the playing field with AI-powered career tools.",
  },
  {
    icon: ShieldCheck,
    title: "Your data, your control",
    desc: "Your resume data is yours. We process it to serve you, never to sell it. Encrypted, private, deleted on request.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Ambient background */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-[600px] h-[400px] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[300px] bg-blue-600/4 rounded-full blur-[100px]" />
      </div>

      <header className="flex h-16 items-center justify-between px-6 lg:px-12 border-b border-border/20">
        <Link href="/" className="flex items-center gap-2.5">
          <HyreLogo size={32} />
          <span className="text-lg font-bold tracking-tight">Hyrefy</span>
        </Link>
        <Link
          href="/job-seekers"
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-20">
        {/* Hero */}
        <div className="text-center mb-20">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-primary mb-4 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
            Our story
          </span>
          <h1 className="text-5xl font-extrabold tracking-tight mb-6">
            We believe every résumé<br />deserves a fair shot.
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Hyrefy was born from a simple frustration: great candidates were being filtered out by ATS systems before a human ever read their resume. We built the AI fix.
          </p>
        </div>

        {/* Mission */}
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-8 mb-16 text-center">
          <p className="text-2xl font-bold mb-3">Our mission</p>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            To make every job seeker competitive — regardless of where they live, what language they speak, or how long they've been in the workforce.
          </p>
        </div>

        {/* Values */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-8 text-center">What we stand for</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {VALUES.map((v) => (
              <div key={v.title} className="rounded-xl border border-border/30 bg-card/20 p-6">
                <v.icon className="h-6 w-6 text-primary mb-3" />
                <h3 className="font-semibold mb-2">{v.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-16">
          {[
            { value: "10,000+", label: "Job seekers helped" },
            { value: "9",       label: "Countries supported" },
            { value: "2",       label: "Languages: EN & FR" },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-border/30 bg-card/20 p-6 text-center">
              <p className="text-3xl font-black text-primary mb-1">{s.value}</p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-sm
              bg-gradient-to-r from-blue-600 to-blue-800 text-white
              shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50
              hover:scale-105 transition-all duration-200"
          >
            Start for free
          </Link>
          <p className="mt-3 text-sm text-muted-foreground">No credit card required</p>
        </div>
      </main>

      <footer className="py-6 text-center text-xs text-muted-foreground/40 border-t border-border/15">
        © {new Date().getFullYear()} Hyrefy &nbsp;·&nbsp;
        <Link href="/privacy" className="hover:text-muted-foreground transition-colors">Privacy</Link>
        &nbsp;·&nbsp;
        <Link href="/terms" className="hover:text-muted-foreground transition-colors">Terms</Link>
      </footer>
    </div>
  );
}
