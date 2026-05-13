import type { Metadata } from "next";
import Link from "next/link";
import { HyreLogo } from "@/components/shared/hyrefy-logo";
import { ArrowLeft, MapPin, Clock, Briefcase } from "lucide-react";

export const metadata: Metadata = {
  title: "Careers | Hyrefy",
  description: "Join the team building the future of AI-powered job applications. Remote-first, mission-driven.",
};

const OPENINGS = [
  {
    title: "Senior Full-Stack Engineer",
    team: "Engineering",
    location: "Remote (Canada / EU)",
    type: "Full-time",
    desc: "Build the core AI resume generation pipeline, real-time document editing, and scalable API infrastructure. TypeScript, Next.js, PostgreSQL.",
  },
  {
    title: "AI / ML Engineer",
    team: "AI",
    location: "Remote (Anywhere)",
    type: "Full-time",
    desc: "Fine-tune and prompt-engineer our resume generation models. Own the quality of AI outputs across 9 countries and 2 languages.",
  },
  {
    title: "Product Designer",
    team: "Design",
    location: "Remote (Anywhere)",
    type: "Full-time",
    desc: "Design the end-to-end experience for job seekers — from upload to download. Own the design system and ship pixel-perfect UI.",
  },
  {
    title: "Growth Marketer",
    team: "Marketing",
    location: "Remote (North America)",
    type: "Full-time",
    desc: "Drive user acquisition through SEO, content, and paid channels. Own the funnel from first click to paying subscriber.",
  },
];

const PERKS = [
  "100% remote-first",
  "Competitive salary + equity",
  "Unlimited PTO",
  "Health & dental coverage",
  "Home office stipend",
  "Annual team retreat",
  "Learning & development budget",
  "Latest MacBook Pro",
];

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/3 w-[600px] h-[400px] bg-blue-600/4 rounded-full blur-[120px]" />
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

      <main className="mx-auto max-w-4xl px-4 py-16">
        {/* Hero */}
        <div className="text-center mb-16">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-primary mb-4 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
            We&apos;re hiring
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
            Build the future of<br />AI-powered careers
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            We&apos;re a small, fast team on a big mission. If you want to help millions of people land their dream jobs, you belong here.
          </p>
        </div>

        {/* Perks */}
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-8 mb-12">
          <h2 className="text-lg font-bold mb-5">Why Hyrefy</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {PERKS.map((perk) => (
              <div key={perk} className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                {perk}
              </div>
            ))}
          </div>
        </div>

        {/* Open roles */}
        <h2 className="text-2xl font-bold mb-6">Open roles</h2>
        <div className="space-y-4 mb-16">
          {OPENINGS.map((job) => (
            <div
              key={job.title}
              className="rounded-xl border border-border/30 bg-card/20 p-6 hover:border-primary/30 hover:bg-card/40 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                <div>
                  <h3 className="font-semibold text-base">{job.title}</h3>
                  <span className="text-xs text-primary font-medium">{job.team}</span>
                </div>
                <div className="flex flex-wrap gap-2 shrink-0">
                  <span className="flex items-center gap-1 text-[11px] text-muted-foreground border border-border/40 rounded-full px-2.5 py-1">
                    <MapPin className="h-3 w-3" /> {job.location}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-muted-foreground border border-border/40 rounded-full px-2.5 py-1">
                    <Clock className="h-3 w-3" /> {job.type}
                  </span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">{job.desc}</p>
              <a
                href="mailto:careers@hyrefy.com"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
              >
                <Briefcase className="h-3.5 w-3.5" />
                Apply — careers@hyrefy.com
              </a>
            </div>
          ))}
        </div>

        {/* Spontaneous */}
        <div className="rounded-xl border border-border/30 bg-card/20 p-6 text-center">
          <p className="font-semibold mb-2">Don&apos;t see the right role?</p>
          <p className="text-sm text-muted-foreground mb-4">We&apos;re always looking for exceptional people. Send us your resume and a note about what you&apos;d build.</p>
          <a
            href="mailto:careers@hyrefy.com"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold border border-primary/30 text-primary hover:bg-primary/10 transition-colors"
          >
            Send a spontaneous application
          </a>
        </div>
      </main>

      <footer className="py-6 text-center text-xs text-muted-foreground/40 border-t border-border/15 mt-8">
        © {new Date().getFullYear()} Hyrefy &nbsp;·&nbsp;
        <Link href="/privacy" className="hover:text-muted-foreground transition-colors">Privacy</Link>
        &nbsp;·&nbsp;
        <Link href="/terms" className="hover:text-muted-foreground transition-colors">Terms</Link>
      </footer>
    </div>
  );
}
