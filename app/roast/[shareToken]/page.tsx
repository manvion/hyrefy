import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Flame, Zap, AlertTriangle, CheckCircle, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const dbc = db as any;

const GRADE_COLORS: Record<string, { text: string; bg: string; ring: string }> = {
  F: { text: "text-red-400",     bg: "bg-red-500/10",     ring: "ring-red-500/30" },
  D: { text: "text-orange-400",  bg: "bg-orange-500/10",  ring: "ring-orange-500/30" },
  C: { text: "text-amber-400",   bg: "bg-amber-500/10",   ring: "ring-amber-500/30" },
  B: { text: "text-yellow-400",  bg: "bg-yellow-500/10",  ring: "ring-yellow-500/30" },
  A: { text: "text-emerald-400", bg: "bg-emerald-500/10", ring: "ring-emerald-500/30" },
  S: { text: "text-primary",     bg: "bg-primary/10",     ring: "ring-primary/30" },
};

export default async function SharedRoastPage({ params }: { params: Promise<{ shareToken: string }> }) {
  const { shareToken } = await params;

  let roast: {
    grade: string; score: number; roastText: string;
    issues: unknown; buzzwords: unknown; weakVerbs: unknown; createdAt: Date;
  } | null = null;

  try {
    roast = await dbc.resumeRoast.findUnique({
      where: { shareToken },
      select: { grade: true, score: true, roastText: true, issues: true, buzzwords: true, weakVerbs: true, createdAt: true },
    });
    if (roast) {
      await dbc.resumeRoast.update({ where: { shareToken }, data: { shareCount: { increment: 1 } } });
    }
  } catch {
    // DB not available
  }

  if (!roast) notFound();

  const gradeStyle = GRADE_COLORS[roast.grade] || GRADE_COLORS.C;
  const issues = Array.isArray(roast.issues) ? roast.issues as { category: string; severity: string; description: string; fix: string }[] : [];
  const buzzwords = Array.isArray(roast.buzzwords) ? roast.buzzwords as string[] : [];
  const weakVerbs = Array.isArray(roast.weakVerbs) ? roast.weakVerbs as string[] : [];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/30 px-6 py-4">
        <div className="mx-auto max-w-2xl flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center">
              <Zap className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <span className="font-bold">Hyrefy</span>
          </Link>
          <Link href="/roast" className="text-xs text-primary hover:underline">Roast my resume →</Link>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-10 space-y-6">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 text-muted-foreground mb-2">
            <Flame className="h-4 w-4 text-orange-400" />
            <span className="text-sm">AI Resume Roast</span>
          </div>
          <h1 className="text-2xl font-bold">Resume Roast Result</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Shared on {new Date(roast.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </p>
        </div>

        <div className="rounded-2xl border border-border/50 bg-card/30 p-6 flex items-center gap-6">
          <div className={cn("h-20 w-20 rounded-xl ring-4 flex flex-col items-center justify-center shrink-0", gradeStyle.bg, gradeStyle.ring)}>
            <span className={cn("text-3xl font-black", gradeStyle.text)}>{roast.grade}</span>
            <span className="text-[10px] text-muted-foreground">{roast.score}/100</span>
          </div>
          <div className="flex-1">
            <div className="h-2 rounded-full bg-muted overflow-hidden mb-2">
              <div
                className={cn("h-full rounded-full", roast.score >= 80 ? "bg-emerald-500" : roast.score >= 60 ? "bg-amber-500" : "bg-red-500")}
                style={{ width: `${roast.score}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {roast.score >= 80 ? "Strong resume" : roast.score >= 60 ? "Average — improvements needed" : "Needs significant work"}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-orange-500/20 bg-orange-500/5 p-6">
          <div className="flex items-center gap-2 mb-3">
            <Flame className="h-4 w-4 text-orange-400" />
            <span className="text-sm font-semibold text-orange-400">The Honest Assessment</span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{roast.roastText}</p>
        </div>

        {issues.length > 0 && (
          <div className="rounded-2xl border border-border/50 bg-card/30 p-6">
            <h3 className="text-sm font-semibold mb-4">Issues Found</h3>
            <div className="space-y-3">
              {issues.map((issue, i) => {
                const severity = (issue.severity || "minor") as "critical" | "major" | "minor";
                const cfg = severity === "critical"
                  ? { icon: AlertTriangle, color: "text-red-400", bg: "bg-red-500/10" }
                  : severity === "major"
                  ? { icon: AlertCircle, color: "text-amber-400", bg: "bg-amber-500/10" }
                  : { icon: CheckCircle, color: "text-blue-400", bg: "bg-blue-500/10" };
                const Icon = cfg.icon;
                return (
                  <div key={i} className={cn("rounded-lg p-4", cfg.bg)}>
                    <div className="flex items-start gap-3">
                      <Icon className={cn("h-4 w-4 mt-0.5 shrink-0", cfg.color)} />
                      <div>
                        <p className="text-sm font-semibold mb-1">{issue.category}</p>
                        <p className="text-sm text-muted-foreground mb-2">{issue.description}</p>
                        <p className="text-xs text-foreground/80 flex items-start gap-1.5">
                          <span className="text-emerald-400 font-bold shrink-0">Fix:</span>
                          {issue.fix}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {(buzzwords.length > 0 || weakVerbs.length > 0) && (
          <div className="grid grid-cols-2 gap-4">
            {buzzwords.length > 0 && (
              <div className="rounded-xl border border-border/50 bg-card/30 p-4">
                <p className="text-xs text-muted-foreground font-semibold uppercase mb-2">Buzzwords</p>
                <div className="flex flex-wrap gap-1.5">
                  {buzzwords.map(w => <Badge key={w} variant="secondary" className="text-xs line-through opacity-60">{w}</Badge>)}
                </div>
              </div>
            )}
            {weakVerbs.length > 0 && (
              <div className="rounded-xl border border-border/50 bg-card/30 p-4">
                <p className="text-xs text-muted-foreground font-semibold uppercase mb-2">Weak Verbs</p>
                <div className="flex flex-wrap gap-1.5">
                  {weakVerbs.map(w => <Badge key={w} variant="secondary" className="text-xs text-amber-400/70">{w}</Badge>)}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 text-center">
          <p className="text-sm font-semibold mb-1">Want to fix your resume?</p>
          <p className="text-xs text-muted-foreground mb-4">Hyrefy&apos;s AI rewrites your resume to score 80+</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Zap className="h-3.5 w-3.5" />
            Try Hyrefy Free
          </Link>
        </div>
      </main>
    </div>
  );
}
