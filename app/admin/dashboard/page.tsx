export const dynamic = "force-dynamic";

import { requireAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, BarChart3, CreditCard, TrendingUp, Building2, Bell, FileText, Clock, Flag } from "lucide-react";
import Link from "next/link";
import { AdminLogout } from "@/components/admin/admin-logout";
import { HyreLogo } from "@/components/shared/hyrefy-logo";

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  await requireAdmin();
  const { tab } = await searchParams;
  const activeTab = tab === "employers" ? "employers" : tab === "reports" ? "reports" : "job-seekers";

  let jobSeekerStats = {
    totalUsers: 0,
    premiumUsers: 0,
    totalScans: 0,
    totalRevenue: 0,
    recentUsers: [] as { email: string; name: string | null; subscription: { status: string; scansUsed: number } | null; createdAt: Date }[],
  };

  let employerStats = {
    totalWaitlist: 0,
    recentWaitlist: [] as { email: string; company: string | null; createdAt: Date }[],
  };

  try {
    const [users, subscriptions, scans] = await Promise.all([
      db.user.findMany({ include: { subscription: true }, orderBy: { createdAt: "desc" }, take: 15 }),
      db.subscription.findMany({ where: { status: "PREMIUM" } }),
      db.resumeScan.count(),
    ]);

    jobSeekerStats = {
      totalUsers: await db.user.count(),
      premiumUsers: subscriptions.length,
      totalScans: scans,
      totalRevenue: subscriptions.length * 19,
      recentUsers: users.map(u => ({
        email: u.email,
        name: u.name,
        subscription: u.subscription,
        createdAt: u.createdAt,
      })),
    };
  } catch {
    // DB not configured
  }

  try {
    const waitlist = await (db as any).recruiterWaitlist.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
    });
    employerStats = {
      totalWaitlist: await (db as any).recruiterWaitlist.count(),
      recentWaitlist: waitlist,
    };
  } catch {
    // DB not configured or migration not run
  }

  let reports: { id: string; type: string; title: string; description: string; contactPhone: string | null; userName: string | null; userEmail: string | null; status: string; createdAt: Date }[] = [];
  try {
    reports = await (db as any).userReport.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  } catch {
    // table not yet migrated
  }

  const conversionRate = jobSeekerStats.totalUsers
    ? Math.round((jobSeekerStats.premiumUsers / jobSeekerStats.totalUsers) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-card/30 backdrop-blur-sm px-6 py-4 sticky top-0 z-10">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <HyreLogo size={32} />
            <div>
              <p className="text-sm font-bold">Hyrefy Admin</p>
              <p className="text-xs text-muted-foreground">Management Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              ← Back to site
            </Link>
            <AdminLogout />
          </div>
        </div>
      </header>

      {/* Tab bar */}
      <div className="border-b border-border/30 bg-card/10">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex gap-1 py-2">
            <Link
              href="/admin/dashboard?tab=job-seekers"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === "job-seekers"
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
              }`}
            >
              <Users className="h-4 w-4" />
              Job Seekers
              {jobSeekerStats.totalUsers > 0 && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full bg-primary/15 text-primary text-[11px] font-bold">
                  {jobSeekerStats.totalUsers}
                </span>
              )}
            </Link>
            <Link
              href="/admin/dashboard?tab=employers"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === "employers"
                  ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
              }`}
            >
              <Building2 className="h-4 w-4" />
              Employers / Recruiters
              {employerStats.totalWaitlist > 0 && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 text-[11px] font-bold">
                  {employerStats.totalWaitlist}
                </span>
              )}
            </Link>
            <Link
              href="/admin/dashboard?tab=reports"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === "reports"
                  ? "bg-red-500/10 text-red-400 border border-red-500/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
              }`}
            >
              <Flag className="h-4 w-4" />
              User Reports
              {reports.filter(r => r.status === "new").length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full bg-red-500/15 text-red-400 text-[11px] font-bold">
                  {reports.filter(r => r.status === "new").length}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-6 py-8 space-y-6">

        {/* ── JOB SEEKERS TAB ── */}
        {activeTab === "job-seekers" && (
          <>
            <div>
              <h1 className="text-xl font-bold">Job Seekers Overview</h1>
              <p className="text-muted-foreground text-sm mt-0.5">Users registered on app.hyrefy.com</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: Users, label: "Total Users", value: jobSeekerStats.totalUsers, color: "text-blue-400", bg: "bg-blue-500/10" },
                { icon: CreditCard, label: "Premium Users", value: jobSeekerStats.premiumUsers, color: "text-emerald-400", bg: "bg-emerald-500/10" },
                { icon: BarChart3, label: "Total Scans", value: jobSeekerStats.totalScans, color: "text-purple-400", bg: "bg-purple-500/10" },
                { icon: TrendingUp, label: "Monthly Revenue", value: `$${jobSeekerStats.totalRevenue}`, color: "text-amber-400", bg: "bg-amber-500/10" },
              ].map((stat) => (
                <Card key={stat.label} className="border-border/50 bg-card/30">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                      <div className={`h-8 w-8 rounded-lg ${stat.bg} flex items-center justify-center`}>
                        <stat.icon className={`h-4 w-4 ${stat.color}`} />
                      </div>
                    </div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Conversion rate */}
            <Card className="border-border/50 bg-card/30">
              <CardHeader>
                <CardTitle className="text-sm font-semibold">Free → Premium Conversion</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-3 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-blue-500 rounded-full transition-all duration-1000"
                      style={{ width: `${conversionRate}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold">{conversionRate}%</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {jobSeekerStats.premiumUsers} premium out of {jobSeekerStats.totalUsers} total users
                </p>
              </CardContent>
            </Card>

            {/* Recent users */}
            <Card className="border-border/50 bg-card/30">
              <CardHeader>
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  Recent Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                {jobSeekerStats.recentUsers.length > 0 ? (
                  <div className="divide-y divide-border/20">
                    {jobSeekerStats.recentUsers.map((user) => (
                      <div key={user.email} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                            {(user.name || user.email)[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{user.name || user.email}</p>
                            {user.name && <p className="text-xs text-muted-foreground">{user.email}</p>}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            {user.subscription?.scansUsed || 0} scans
                          </span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(user.createdAt).toLocaleDateString("en-CA", { month: "short", day: "numeric" })}
                          </span>
                          <Badge
                            variant={user.subscription?.status === "PREMIUM" ? "success" : "secondary"}
                            className="text-xs"
                          >
                            {user.subscription?.status || "FREE"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No users yet — or database not configured.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Stripe config */}
            <Card className="border-amber-500/20 bg-amber-500/5">
              <CardContent className="p-5">
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-amber-400" />
                  Stripe Configuration Status
                </h3>
                <div className="space-y-2">
                  {[
                    { label: "Stripe Secret Key", configured: !!(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY !== "sk_test_dummy") },
                    { label: "Premium Price ID", configured: !!(process.env.STRIPE_PREMIUM_PRICE_ID && process.env.STRIPE_PREMIUM_PRICE_ID !== "price_dummy") },
                    { label: "Webhook Secret", configured: !!(process.env.STRIPE_WEBHOOK_SECRET && process.env.STRIPE_WEBHOOK_SECRET !== "whsec_dummy") },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{item.label}</span>
                      <Badge variant={item.configured ? "success" : "warning"} className="text-xs">
                        {item.configured ? "✓ Configured" : "Not set"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* ── EMPLOYERS TAB ── */}
        {activeTab === "employers" && (
          <>
            <div>
              <h1 className="text-xl font-bold">Employers & Recruiters</h1>
              <p className="text-muted-foreground text-sm mt-0.5">Waitlist signups from recruiter.hyrefy.com</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              <Card className="border-border/50 bg-card/30">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs text-muted-foreground">Waitlist Signups</p>
                    <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                      <Bell className="h-4 w-4 text-amber-400" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold">{employerStats.totalWaitlist}</p>
                </CardContent>
              </Card>
              <Card className="border-border/50 bg-card/30 col-span-1 lg:col-span-2">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0">
                    <Building2 className="h-5 w-5 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Recruiter Platform — Coming Soon</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      AI candidate screening, smart job matching, visual hiring pipeline. Users who click "Notify Me" are saved here.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Waitlist */}
            <Card className="border-border/50 bg-card/30">
              <CardHeader>
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Bell className="h-4 w-4 text-amber-400" />
                  Waitlist Signups
                </CardTitle>
              </CardHeader>
              <CardContent>
                {employerStats.recentWaitlist.length > 0 ? (
                  <div className="divide-y divide-border/20">
                    {employerStats.recentWaitlist.map((entry) => (
                      <div key={entry.email} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-xs font-bold text-amber-400">
                            {entry.email[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{entry.email}</p>
                            {entry.company && (
                              <p className="text-xs text-muted-foreground">{entry.company}</p>
                            )}
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(entry.createdAt).toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <Bell className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">No waitlist signups yet.</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">
                      Signups appear when recruiters submit their email on recruiter.hyrefy.com
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {/* ── REPORTS TAB ── */}
        {activeTab === "reports" && (
          <>
            <div>
              <h1 className="text-xl font-bold">User Reports</h1>
              <p className="text-muted-foreground text-sm mt-0.5">Issues and feedback submitted by users</p>
            </div>

            {reports.length > 0 ? (
              <div className="space-y-3">
                {reports.map((report) => {
                  const typeColors: Record<string, string> = {
                    bug:         "text-red-400 bg-red-500/10 border-red-500/20",
                    feature:     "text-amber-400 bg-amber-500/10 border-amber-500/20",
                    performance: "text-blue-400 bg-blue-500/10 border-blue-500/20",
                    ux:          "text-purple-400 bg-purple-500/10 border-purple-500/20",
                    other:       "text-muted-foreground bg-muted/30 border-border/40",
                  };
                  const typeNames: Record<string, string> = {
                    bug: "Bug", feature: "Feature", performance: "Performance", ux: "UI/UX", other: "Other",
                  };
                  return (
                    <Card key={report.id} className={`border-border/50 bg-card/30 ${report.status === "new" ? "border-l-4 border-l-red-400" : ""}`}>
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${typeColors[report.type] ?? typeColors.other}`}>
                              {typeNames[report.type] ?? report.type}
                            </span>
                            <h3 className="text-sm font-semibold text-foreground">{report.title}</h3>
                          </div>
                          <span className="text-xs text-muted-foreground whitespace-nowrap flex items-center gap-1 shrink-0">
                            <Clock className="h-3 w-3" />
                            {new Date(report.createdAt).toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" })}
                          </span>
                        </div>
                        <p className="text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed mb-3">{report.description}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground border-t border-border/20 pt-3">
                          {report.userName && <span><strong>Name:</strong> {report.userName}</span>}
                          {report.userEmail && <span><strong>Email:</strong> {report.userEmail}</span>}
                          {report.contactPhone && <span><strong>Phone:</strong> {report.contactPhone}</span>}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card className="border-border/50 bg-card/30">
                <CardContent className="py-14 text-center">
                  <Flag className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No reports yet.</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">Reports submitted by users appear here.</p>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </main>
    </div>
  );
}
