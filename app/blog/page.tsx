import type { Metadata } from "next";
import Link from "next/link";
import { HyreLogo } from "@/components/shared/hyrefy-logo";
import { ArrowLeft, BookOpen, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Blog | Hyrefy",
  description: "Career advice, resume tips, and job search strategies from the Hyrefy team.",
};

const POSTS = [
  {
    slug: "#",
    category: "Resume Tips",
    title: "How ATS Systems Score Your Resume (and How to Beat Them)",
    excerpt: "Most resumes are rejected before a human ever reads them. Here's exactly how applicant tracking systems work — and the keyword strategy that gets you through.",
    readTime: "6 min read",
    date: "May 8, 2026",
  },
  {
    slug: "#",
    category: "Career Advice",
    title: "The One-Page vs. Two-Page Resume Debate: What Recruiters Actually Prefer",
    excerpt: "It depends on your market. US recruiters want one page; Australian hiring managers expect two. Here's a country-by-country breakdown.",
    readTime: "4 min read",
    date: "May 2, 2026",
  },
  {
    slug: "#",
    category: "Cover Letters",
    title: "5 Cover Letter Openers That Make Recruiters Keep Reading",
    excerpt: "Most cover letters open with 'I am writing to apply for…'. Here are five alternatives that actually work — with real examples.",
    readTime: "5 min read",
    date: "Apr 25, 2026",
  },
  {
    slug: "#",
    category: "Job Search",
    title: "How to Tailor Your Resume for Every Job Without Starting From Scratch",
    excerpt: "The master resume strategy: build one comprehensive document, then let AI tailor it to each application in seconds.",
    readTime: "7 min read",
    date: "Apr 18, 2026",
  },
  {
    slug: "#",
    category: "Global Markets",
    title: "Canadian vs. US Resume: The Key Differences You Need to Know",
    excerpt: "Canadian employers have different expectations than US hiring managers. Learn the formatting, tone, and content differences before you apply.",
    readTime: "5 min read",
    date: "Apr 10, 2026",
  },
  {
    slug: "#",
    category: "Resume Tips",
    title: "Quantify Everything: How to Add Numbers to Any Resume Bullet",
    excerpt: "'Improved team performance' means nothing. 'Reduced onboarding time by 40%' gets interviews. Here's the framework to quantify any achievement.",
    readTime: "4 min read",
    date: "Apr 3, 2026",
  },
];

const CATEGORY_COLORS: Record<string, string> = {
  "Resume Tips":    "text-primary bg-primary/10 border-primary/20",
  "Career Advice":  "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  "Cover Letters":  "text-blue-400 bg-blue-500/10 border-blue-500/20",
  "Job Search":     "text-amber-400 bg-amber-500/10 border-amber-500/20",
  "Global Markets": "text-sky-400 bg-sky-500/10 border-sky-500/20",
};

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-[500px] h-[400px] bg-primary/4 rounded-full blur-[120px]" />
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
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="h-5 w-5 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-widest text-primary">Hyrefy Blog</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-3">Career advice that actually works</h1>
          <p className="text-muted-foreground">Resume tips, job search strategy, and market-specific guidance from the Hyrefy team.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {POSTS.map((post) => (
            <Link
              key={post.title}
              href={post.slug}
              className="group rounded-xl border border-border/30 bg-card/20 p-6 hover:border-primary/30 hover:bg-card/40 transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-3">
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${CATEGORY_COLORS[post.category] ?? "text-muted-foreground bg-muted/20 border-border/30"}`}>
                  {post.category}
                </span>
                <span className="flex items-center gap-1 text-[11px] text-muted-foreground/60">
                  <Clock className="h-3 w-3" />
                  {post.readTime}
                </span>
              </div>
              <h2 className="font-semibold text-base mb-2 group-hover:text-primary transition-colors leading-snug">{post.title}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">{post.excerpt}</p>
              <p className="text-xs text-muted-foreground/50 mt-4">{post.date}</p>
            </Link>
          ))}
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
