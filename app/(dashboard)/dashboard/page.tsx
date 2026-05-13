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
  BarChart3, Briefcase, Globe,
} from "lucide-react";
import { SUPPORTED_COUNTRIES } from "@/lib/ai/countries";

const sixMonthsAgo = () => {
  const d = new Date();
  d.setMonth(d.getMonth() - 6);
  return d;
};

export default async function DashboardPage() {
  const userId = await getAuthUserId();
  if (!userId) redirect("/sign-in");

  let hasMasterResume = false;
  let masterResumeFile = "";
  let recentScans: any[] = [];
  let isPremium = false;
  let totalGenerations = 0;
  let bestScore = 0;

  try {
    const user = await db.user.upsert({
      where: { clerkId: userId },
      update: {},
      create: {
        clerkId: userId,
        email: `${userId}@placeholder.hyrefy.com`,
        subscription: { create: { scansUsed: 0, scansLimit: 3 } },
      },
      include: { subscription: true },
    });

    isPremium = user.subscription?.status === "PREMIUM";
    const cutoff = sixMonthsAgo();

    const [masterResume, anyResume, scans, count] = await Promise.all([
      (db as any).resume.findFirst({ where: { userId: user.id, isMaster: true }, select: { fileName: true } }),
      (db as any).resume.findFirst({ where: { userId: user.id }, select: { fileName: true } }),
      db.resumeScan.findMany({
        where: { userId: user.id, createdAt: { gte: cutoff } },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true, jobTitle: true, company: true, atsScore: true,
          createdAt: true, jobCountry: true, aiResults: true,
        },
      }),
      db.resumeScan.count({ where: { userId: user.id, createdAt: { gte: cutoff } } }),
    ]);

    const resume = masterResume ?? anyResume;
    if (resume) { hasMasterResume = true; masterResumeFile = resume.fileName || ""; }
    recentScans = scans;
    totalGenerations = count;
    bestScore = scans.reduce((max: number, s: any) => Math.max(max, s.atsScore || 0), 0);
  } catch {
    // DB not configured — demo state
  }

  const avgScore = recentScans.length
    ? Math.round(recentScans.reduce((a: number, s: any) => a + (s.atsScore || 0), 0) / recentScans.length)
    : 0;

  return (
    <div className="space-y-6 max-w-5xl">

      {/* Master Resume Status */}
      <Card className={`border ${hasMasterResume ? "border-emerald-500/30 bg-emerald-500/5" : "border-primary/30 bg-primary/5"}`}>
        <CardContent className="p-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 ${hasMasterResume ? "bg-emerald-500/15 border border-emerald-500/30" : "bg-primary/15 border border-primary/30"}`}>
                {hasMasterResume ? <CheckCircle2 className="h-5 w-5 text-emerald-400" /> : <Upload className="h-5 w-5 text-primary" />}
              </div>
              <div>
                <p className="font-semibold text-sm">
                  {hasMasterResume ? masterResumeFile || "Master Resume" : "Upload Your Master Resume"}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {hasMasterResume ? "Ready — generate tailored resumes for any job" : "Upload once, tailor for every job you apply to"}
                </p>
              </div>
            </div>
            <Button asChild variant={hasMasterResume ? "outline" : "gradient"} size="sm" className="shrink-0">
              <Link href="/resume/upload">{hasMasterResume ? "Update" : "Upload Now"}</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Generate CTA — only when resume is ready */}
      {hasMasterResume && (
        <Card className="border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent overflow-hidden relative">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent pointer-events-none" />
          <CardContent className="p-6 flex items-center justify-between gap-4 relative">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-bold text-base">Generate a tailored resume</p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Paste a job description — get a tailored resume + cover letter in ~20 seconds
                </p>
              </div>
            </div>
            <Button asChild variant="gradient" size="lg" className="shrink-0">
              <Link href="/generate">
                <Sparkles className="mr-2 h-4 w-4" /> Generate
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
              <p className="text-xs text-muted-foreground">Applications</p>
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
            <p className="text-2xl font-bold">{avgScore > 0 ? `${avgScore}%` : "—"}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">across all generations</p>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-3.5 w-3.5 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Best Score</p>
            </div>
            <p className="text-2xl font-bold text-emerald-400">{bestScore > 0 ? `${bestScore}%` : "—"}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">highest ATS achieved</p>
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

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Link href="/generate" className="group">
          <Card className="border-border/50 bg-card/20 hover:bg-card/50 hover:border-primary/30 transition-all h-full cursor-pointer">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold">New Generation</p>
                <p className="text-xs text-muted-foreground">Resume + cover letter</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground ml-auto group-hover:text-primary transition-colors shrink-0" />
            </CardContent>
          </Card>
        </Link>
        <Link href="/history" className="group">
          <Card className="border-border/50 bg-card/20 hover:bg-card/50 hover:border-primary/30 transition-all h-full cursor-pointer">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                <Download className="h-4 w-4 text-blue-400" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold">Download History</p>
                <p className="text-xs text-muted-foreground">PDF or text, all resumes</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground ml-auto group-hover:text-primary transition-colors shrink-0" />
            </CardContent>
          </Card>
        </Link>
        <Link href="/resume/upload" className="group">
          <Card className="border-border/50 bg-card/20 hover:bg-card/50 hover:border-primary/30 transition-all h-full cursor-pointer">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
                <FileText className="h-4 w-4 text-violet-400" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold">Master Resume</p>
                <p className="text-xs text-muted-foreground">{hasMasterResume ? "View or update" : "Upload to get started"}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground ml-auto group-hover:text-primary transition-colors shrink-0" />
            </CardContent>
          </Card>
        </Link>
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
                          <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
                          <span className="font-bold text-emerald-400">{scan.atsScore}%</span>
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

      {/* Empty state */}
      {!hasMasterResume && (
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
