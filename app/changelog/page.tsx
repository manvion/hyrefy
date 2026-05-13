import type { Metadata } from "next";
import Link from "next/link";
import { HyreLogo } from "@/components/shared/hyrefy-logo";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Changelog | Hyrefy",
  description: "What's new in Hyrefy — latest features, improvements, and fixes.",
};

const RELEASES = [
  {
    version: "v1.4",
    date: "May 12, 2026",
    badge: "Latest",
    badgeClass: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    changes: [
      { type: "new",  text: "India added as a supported country with skills-first resume standard" },
      { type: "new",  text: "₹ INR pricing tier for Indian users (₹999/month)" },
      { type: "new",  text: "Sitemap and robots.txt for improved SEO indexing" },
      { type: "imp",  text: "New Hyrefy logo mark — gradient H with golden accent" },
      { type: "imp",  text: "Browser tab favicon updated to match new logo" },
      { type: "imp",  text: "Country grid updated to 5-column layout with 9 countries" },
      { type: "fix",  text: "Geo API now caches responses for 1 hour at the CDN edge" },
    ],
  },
  {
    version: "v1.3",
    date: "May 5, 2026",
    badge: null,
    badgeClass: "",
    changes: [
      { type: "new",  text: "Recruiter platform landing page (coming soon)" },
      { type: "new",  text: "Subdomain routing: app.hyrefy.com / recruiter.hyrefy.com" },
      { type: "new",  text: "Privacy Policy and Terms of Service pages" },
      { type: "imp",  text: "Selector landing page redesign with animated gradient CTAs" },
      { type: "imp",  text: "Language toggle rebuilt with proper hover states" },
      { type: "fix",  text: "Country cards now show full country names instead of ISO codes" },
    ],
  },
  {
    version: "v1.2",
    date: "Apr 28, 2026",
    badge: null,
    badgeClass: "",
    changes: [
      { type: "new",  text: "6-month generation history with ATS score tracking" },
      { type: "new",  text: "PDF download for tailored resume and cover letter" },
      { type: "new",  text: "8 countries with country-specific AI resume standards" },
      { type: "new",  text: "IP-based auto currency detection on pricing page" },
      { type: "imp",  text: "Billing page with Stripe checkout and portal integration" },
      { type: "imp",  text: "Dashboard redesigned: master resume status + recent generations" },
    ],
  },
  {
    version: "v1.1",
    date: "Apr 14, 2026",
    badge: null,
    badgeClass: "",
    changes: [
      { type: "new",  text: "Cover letter generation alongside tailored resume" },
      { type: "new",  text: "French language output (complete EN/FR bilingual support)" },
      { type: "new",  text: "ATS before/after score shown after every generation" },
      { type: "imp",  text: "Resume upload now accepts PDF, DOCX, and plain text" },
      { type: "fix",  text: "Fixed Clerk auth crash on sign-in / sign-up in demo mode" },
    ],
  },
  {
    version: "v1.0",
    date: "Apr 1, 2026",
    badge: "Initial release",
    badgeClass: "bg-primary/15 text-primary border-primary/30",
    changes: [
      { type: "new",  text: "Master resume upload — one resume for all applications" },
      { type: "new",  text: "AI-powered resume tailoring from job description" },
      { type: "new",  text: "ATS score analysis with keyword matching" },
      { type: "new",  text: "Free tier: 3 generations/month" },
      { type: "new",  text: "Premium tier: unlimited generations, priority AI" },
    ],
  },
];

const TYPE_STYLES: Record<string, string> = {
  new: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
  imp: "bg-primary/15 text-primary border-primary/25",
  fix: "bg-amber-500/15 text-amber-400 border-amber-500/25",
};

const TYPE_LABELS: Record<string, string> = {
  new: "New",
  imp: "Improved",
  fix: "Fixed",
};

export default function ChangelogPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-[500px] h-[350px] bg-primary/4 rounded-full blur-[110px]" />
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

      <main className="mx-auto max-w-2xl px-4 py-16">
        <div className="mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight mb-3">Changelog</h1>
          <p className="text-muted-foreground">Every update, improvement, and fix — newest first.</p>
        </div>

        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-[7px] top-0 bottom-0 w-px bg-border/30" />

          <div className="space-y-10">
            {RELEASES.map((release) => (
              <div key={release.version} className="relative pl-8">
                {/* Timeline dot */}
                <div className="absolute left-0 top-1.5 h-3.5 w-3.5 rounded-full border-2 border-primary bg-background" />

                <div className="flex flex-wrap items-center gap-2.5 mb-4">
                  <span className="text-lg font-bold">{release.version}</span>
                  {release.badge && (
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${release.badgeClass}`}>
                      {release.badge}
                    </span>
                  )}
                  <span className="text-sm text-muted-foreground ml-auto">{release.date}</span>
                </div>

                <div className="space-y-2.5">
                  {release.changes.map((change, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <span className={`mt-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded border shrink-0 ${TYPE_STYLES[change.type]}`}>
                        {TYPE_LABELS[change.type]}
                      </span>
                      <p className="text-sm text-muted-foreground leading-relaxed">{change.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
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
