export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import Link from "next/link";
import { getAuthUserId } from "@/lib/utils/auth";
import { db } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Upload, Sparkles, History, FileText, TrendingUp, Clock,
  ArrowRight, CheckCircle2, Target, Download, ChevronRight,
  BarChart3, Briefcase, Globe, Crown, Zap, PenSquare,
  FileSearch, BrainCircuit, AlertTriangle,
} from "lucide-react";
import { SUPPORTED_COUNTRIES } from "@/lib/ai/countries";

const sixMonthsAgo = () => {
  const d = new Date();
  d.setMonth(d.getMonth() - 6);
  return d;
};

function atsColor(score: number) {
  if (score >= 80) return "text-emerald-400";
  if (score >= 65) return "text-blue-400";
  if (score >= 50) return "text-amber-400";
  return "text-red-400";
}

export default async function DashboardPage() {
  const userId = await getAuthUserId();
  if (!userId) redirect("/sign-in");

  let hasMasterResume = false;
  let masterResumeFile = "";
  let recentScans: any[] = [];
  let isPremium = false;
  let totalGenerations = 0;
  let bestScore = 0;
  let scansUsed = 0;
  let scansLimit = 2;
  let buildsUsed = 0;
  let currentPeriodEnd: Date | null = null;

  try {
    const user = await db.user.upsert({
      where: { clerkId: userId },
      update: {},
      create: {
        clerkId: userId,
        email: `${userId}@placeholder.hyrefy.com`,
        subscription: { create: { scansUsed: 0, scansLimit: 2 } },
      },
      include: { subscription: true },
    });

    isPremium = user.subscription?.status === "PREMIUM";
    scansUsed = user.subscription?.scansUsed ?? 0;
    scansLimit = isPremium ? 9999 : 2;
    buildsUsed = (user.subscription as any)?.buildsUsed ?? 0;
    currentPeriodEnd = (user.subscription as any)?.currentPeriodEnd ?? null;

    const cutoff = sixMonthsAgo();
    const [resume, scans, count] = await Promise.all([
      db.resume.findFirst({
        where: { userId: user.id },
        orderBy: [{ isMaster: "desc" }, { updatedAt: "desc" }],
        select: { fileName: true },
      }),
      db.resumeScan.findMany({
        where: { userId: user.id, createdAt: { gte: cutoff } },
        orderBy: { createdAt: "desc" },
        take: 4,
        select: { id: true, jobTitle: true, company: true, atsScore: true, createdAt: true, jobCountry: true, aiResults: true },
      }),
      db.resumeScan.count({ where: { userId: user.id, createdAt: { gte: cutoff } } }),
    ]);

    if (resume) { hasMasterResume = true; masterResumeFile = resume.fileName || ""; }
    recentScans = scans;
    totalGenerations = count;
    bestScore = scans.reduce((max: number, s: any) => Math.max(max, s.atsScore || 0), 0);
  } catch { /* DB not configured — demo state */ }

  const avgScore = recentScans.length
    ? Math.round(recentScans.reduce((a: number, s: any) => a + (s.atsScore || 0), 0) / recentScans.length)
    : 0;

  const scansRemaining = Math.max(0, scansLimit - scansUsed);

  // Renewal alert logic
  const daysUntilRenewal = currentPeriodEnd
    ? Math.ceil((currentPeriodEnd.getTime() - Date.now()) / 86400000)
    : null;
  const showRenewalAlert = isPremium && daysUntilRenewal !== null && daysUntilRenewal <= 7;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">

      {/* Renewal alert banner */}
      {showRenewalAlert && (
        <div className={`rounded-xl border p-4 flex items-center justify-between gap-3 ${
          daysUntilRenewal! <= 0
            ? "border-destructive/30 bg-destructive/5"
            : "border-amber-500/30 bg-amber-500/5"
        }`}>
          <div className="flex items-center gap-3">
            <AlertTriangle className={`h-5 w-5 shrink-0 ${daysUntilRenewal! <= 0 ? "text-destructive" : "text-amber-500"}`} />
            <div>
              <p className={`text-sm font-semibold ${daysUntilRenewal! <= 0 ? "text-destructive" : "text-amber-500"}`}>
                {daysUntilRenewal! <= 0
                  ? "Your Premium subscription has expired"
                  : `Premium renews in ${daysUntilRenewal} day${daysUntilRenewal === 1 ? "" : "s"}`}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {daysUntilRenewal! <= 0
                  ? "Renew to restore unlimited access"
                  : `Renews on ${currentPeriodEnd!.toLocaleDateString("en-CA", { month: "long", day: "numeric", year: "numeric" })}`}
              </p>
            </div>
          </div>
          <Link
            href="/billing"
            className="shrink-0 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors"
          >
            {daysUntilRenewal! <= 0 ? "Renew" : "Manage"}
          </Link>
        </div>
      )}

      {/* Master Resume Status */}
      <Card className={`border ${hasMasterResume ? "border-emerald-500/25 bg-emerald-500/5" : "border-primary/25 bg-primary/5"}`}>
        <CardContent className="p-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 ${hasMasterResume ? "bg-emerald-500/15 border border-emerald-500/25" : "bg-primary/15 border border-primary/25"}`}>
                {hasMasterResume ? <CheckCircle2 className="h-5 w-5 text-emerald-400" /> : <Upload className="h-5 w-5 text-primary" />}
              </div>
              <div>
                <p className="font-semibold text-sm">
                  {hasMasterResume ? masterResumeFile || "Master Resume" : "Upload Your Master Resume"}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {hasMasterResume ? "Ready — tailor it for any job in seconds" : "Upload once, tailor for every job you apply to"}
                </p>
              </div>
            </div>
            <Button asChild variant={hasMasterResume ? "outline" : "gradient"} size="sm" className="shrink-0">
              <Link href="/resume/upload">{hasMasterResume ? "View / Update" : "Upload Now"}</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Generate CTA */}
      {hasMasterResume && (
        <Card className="border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent overflow-hidden relative">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent pointer-events-none" />
          <CardContent className="p-6 flex items-center justify-between gap-4 relative">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-bold text-base">Improve My Resume</p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Paste a job description — get a tailored resume + cover letter in ~20 seconds
                </p>
              </div>
            </div>
            <Button asChild variant="gradient" size="lg" className="shrink-0">
              <Link href="/generate">
                <Sparkles className="mr-2 h-4 w-4" /> Improve
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border-border/50 bg-card/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Generations</p>
            </div>
            <p className="text-2xl font-bold">{totalGenerations}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">last 6 months</p>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="h-3.5 w-3.5 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Avg ATS Score</p>
            </div>
            <p className={`text-2xl font-bold ${avgScore > 0 ? atsColor(avgScore) : ""}`}>{avgScore > 0 ? `${avgScore}%` : "—"}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">across generations</p>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-3.5 w-3.5 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Best Score</p>
            </div>
            <p className={`text-2xl font-bold ${bestScore > 0 ? atsColor(bestScore) : ""}`}>{bestScore > 0 ? `${bestScore}%` : "—"}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">highest ATS</p>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Plan</p>
            </div>
            <Badge variant={isPremium ? "success" : "secondary"} className="text-xs px-2.5 py-0.5">
              {isPremium ? "Premium" : "Free"}
            </Badge>
            {!isPremium && (
              <p className="text-[11px] text-muted-foreground mt-1.5">
                <Link href="/billing" className="text-primary hover:underline">Upgrade</Link> for unlimited
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Usage indicators (free users only) */}
      {!isPremium && (
        <Card className="border-border/50 bg-card/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                Monthly Usage
              </p>
              <Button asChild size="sm" variant="outline" className="h-7 text-xs gap-1">
                <Link href="/billing"><Crown className="h-3 w-3" />Upgrade</Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { label: "Resume Improvements", used: scansUsed, limit: 2 },
                { label: "Resume Builds", used: buildsUsed, limit: 1 },
                { label: "Interview AI", used: 0, limit: 1 },
              ].map(item => {
                const pct = Math.min(100, (item.used / item.limit) * 100);
                const remaining = Math.max(0, item.limit - item.used);
                return (
                  <div key={item.label} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{item.label}</span>
                      <span className="text-xs font-medium">{item.used}/{item.limit}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${pct >= 100 ? "bg-destructive" : pct >= 50 ? "bg-amber-400" : "bg-primary"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      {remaining === 0 ? "Limit reached" : `${remaining} remaining`}
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { href: "/generate",       icon: Sparkles,    label: "Improve Resume",   desc: "Resume + cover letter",  color: "bg-primary/10 border-primary/20 text-primary" },
          { href: "/build",          icon: PenSquare,   label: "Build New Resume", desc: "Start from scratch",     color: "bg-violet-500/10 border-violet-500/20 text-violet-400" },
          { href: "/analyze",        icon: FileSearch,  label: "ATS Analyzer",     desc: "Score your resume",      color: "bg-blue-500/10 border-blue-500/20 text-blue-400" },
          { href: "/interview-prep", icon: BrainCircuit,label: "Interview AI",     desc: "Practice questions",     color: "bg-amber-500/10 border-amber-500/20 text-amber-400" },
        ].map(item => (
          <Link key={item.href} href={item.href} className="group">
            <Card className="border-border/50 bg-card/20 hover:bg-card/50 hover:border-primary/30 transition-all h-full cursor-pointer">
              <CardContent className="p-4 flex flex-col gap-2.5">
                <div className={`h-9 w-9 rounded-lg border flex items-center justify-center shrink-0 ${item.color}`}>
                  <item.icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{item.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors mt-auto" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Recent generations */}
      {recentScans.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Recent Generations</h2>
            <Link href="/history" className="text-xs text-primary hover:underline flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="space-y-2">
            {recentScans.map((scan: any) => {
              const country = SUPPORTED_COUNTRIES[scan.jobCountry as keyof typeof SUPPORTED_COUNTRIES];
              const aiResults = scan.aiResults as any;
              const lang = aiResults?.outputLanguage === "fr" ? "FR" : "EN";
              return (
                <Card key={scan.id} className="border-border/50 bg-card/30 hover:bg-card/50 transition-all">
                  <CardContent className="p-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center shrink-0 text-base">
                        {country?.flag ?? <Globe className="h-4 w-4 text-muted-foreground" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{scan.jobTitle}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                          <Clock className="h-3 w-3" />
                          {new Date(scan.createdAt).toLocaleDateString("en-CA", { month: "short", day: "numeric" })}
                          {scan.company && <> · {scan.company}</>}
                          <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-auto">{lang}</Badge>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {scan.atsScore > 0 && (
                        <div className="flex items-center gap-1 text-sm">
                          <TrendingUp className={`h-3.5 w-3.5 ${atsColor(scan.atsScore)}`} />
                          <span className={`font-bold ${atsColor(scan.atsScore)}`}>{scan.atsScore}%</span>
                        </div>
                      )}
                      <Button asChild size="sm" variant="ghost" className="h-7 text-xs">
                        <Link href="/history">
                          <Download className="h-3 w-3 mr-1" /> Download
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Premium upsell (free users) */}
      {!isPremium && (
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-blue-500/5 to-violet-500/5 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          <CardContent className="p-6 relative">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center shrink-0">
                <Crown className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-base">Unlock Premium</p>
                <p className="text-sm text-muted-foreground mt-1 mb-3">
                  Unlimited resume improvements, ATS analyses, and cover letters.
                </p>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {[
                    "Unlimited improvements",
                    "Unlimited ATS analyses",
                    "Unlimited resume builds",
                    "Priority AI processing",
                  ].map(f => (
                    <div key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                      {f}
                    </div>
                  ))}
                </div>
                <Button asChild variant="gradient" size="sm">
                  <Link href="/billing"><Crown className="mr-1.5 h-3.5 w-3.5" />Upgrade to Premium</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {!hasMasterResume && recentScans.length === 0 && (
        <div className="text-center py-14 rounded-2xl border border-dashed border-border/50">
          <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Start with your master resume</h3>
          <p className="text-muted-foreground text-sm mb-6 max-w-sm mx-auto">
            Upload your full resume once. Hyrefy tailors it for every job — resume + cover letter in English or French.
          </p>
          <Button asChild variant="gradient" size="lg">
            <Link href="/resume/upload">
              <Upload className="mr-2 h-4 w-4" /> Upload Master Resume
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
