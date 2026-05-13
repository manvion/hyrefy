export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import Link from "next/link";
import { getAuthUserId } from "@/lib/utils/auth";
import { db } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, Sparkles, History, FileText, TrendingUp, Clock, ArrowRight, CheckCircle2 } from "lucide-react";

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

  try {
    // Upsert user — use clerkId-based placeholder email (sync API sets the real one)
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

    // Run remaining queries in parallel
    const [masterResume, anyResume, scans, count] = await Promise.all([
      (db as any).resume.findFirst({ where: { userId: user.id, isMaster: true }, select: { fileName: true } }),
      (db as any).resume.findFirst({ where: { userId: user.id }, select: { fileName: true } }),
      db.resumeScan.findMany({
        where: { userId: user.id, createdAt: { gte: cutoff } },
        orderBy: { createdAt: "desc" },
        take: 4,
        select: { id: true, jobTitle: true, company: true, atsScore: true, createdAt: true },
      }),
      db.resumeScan.count({ where: { userId: user.id, createdAt: { gte: cutoff } } }),
    ]);

    const resume = masterResume ?? anyResume;
    if (resume) { hasMasterResume = true; masterResumeFile = resume.fileName || ""; }
    recentScans = scans;
    totalGenerations = count;
  } catch {
    // DB not configured — demo state
  }

  const avgScore = recentScans.length
    ? Math.round(recentScans.reduce((a: number, s: any) => a + (s.atsScore || 0), 0) / recentScans.length)
    : 0;

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Your AI-powered resume generation hub</p>
      </div>

      {/* Master Resume Status */}
      <Card className={`border ${hasMasterResume ? "border-emerald-500/30 bg-emerald-500/5" : "border-primary/30 bg-primary/5"}`}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${hasMasterResume ? "bg-emerald-500/15 border border-emerald-500/30" : "bg-primary/15 border border-primary/30"}`}>
                {hasMasterResume
                  ? <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                  : <Upload className="h-6 w-6 text-primary" />
                }
              </div>
              <div>
                <p className="font-semibold text-base">
                  {hasMasterResume ? "Master Resume" : "Upload Your Master Resume"}
                </p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {hasMasterResume
                    ? masterResumeFile || "Ready to generate tailored applications"
                    : "Upload once — we tailor it to every job you apply for"
                  }
                </p>
              </div>
            </div>
            <Button asChild variant={hasMasterResume ? "outline" : "gradient"} size="sm" className="shrink-0">
              <Link href="/resume/upload">{hasMasterResume ? "Update" : "Upload Now"}</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Generate CTA */}
      {hasMasterResume && (
        <Card className="border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
          <CardContent className="p-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-base">Ready to apply for a new job?</p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Paste the job description — get a tailored resume and cover letter in seconds
                </p>
              </div>
            </div>
            <Button asChild variant="gradient" size="lg" className="shrink-0">
              <Link href="/generate">
                <Sparkles className="mr-2 h-4 w-4" />Generate
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-border/50 bg-card/30">
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Generations (6 mo.)</p>
            <p className="text-3xl font-bold">{totalGenerations}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/30">
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Avg ATS Score</p>
            <p className="text-3xl font-bold flex items-end gap-1">
              {avgScore > 0 ? <><span>{avgScore}</span><span className="text-sm font-normal text-muted-foreground">%</span></> : "—"}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/30">
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Plan</p>
            <Badge variant={isPremium ? "success" : "secondary"} className="text-sm px-3 py-1">
              {isPremium ? "Premium" : "Free"}
            </Badge>
            {!isPremium && (
              <p className="text-xs text-muted-foreground mt-2">
                <Link href="/billing" className="text-primary hover:underline">Upgrade</Link> for unlimited
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent history */}
      {recentScans.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold">Recent Generations</h2>
            <Link href="/history" className="text-sm text-primary hover:underline flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="space-y-2">
            {recentScans.map((scan: any) => (
              <Card key={scan.id} className="border-border/50 bg-card/30">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{scan.jobTitle}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Clock className="h-3 w-3" />
                        {new Date(scan.createdAt).toLocaleDateString("en-CA", { month: "short", day: "numeric" })}
                        {scan.company && <> · {scan.company}</>}
                      </p>
                    </div>
                  </div>
                  {scan.atsScore > 0 && (
                    <div className="flex items-center gap-1.5 text-sm">
                      <TrendingUp className="h-4 w-4 text-emerald-400" />
                      <span className="font-semibold text-emerald-400">{scan.atsScore}%</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!hasMasterResume && (
        <div className="text-center py-14 rounded-2xl border border-dashed border-border/50">
          <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Start with your master resume</h3>
          <p className="text-muted-foreground text-sm mb-6 max-w-sm mx-auto">
            Upload your comprehensive resume once. Our AI tailors it for every job — in English or French.
          </p>
          <Button asChild variant="gradient" size="lg">
            <Link href="/resume/upload">
              <Upload className="mr-2 h-4 w-4" />Upload Master Resume
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
