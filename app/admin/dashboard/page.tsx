export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, BarChart3, CreditCard, TrendingUp, Building2, Bell, FileText, Clock, Flag, Mail, Shield } from "lucide-react";
import Link from "next/link";
import { AdminLogout } from "@/components/admin/admin-logout";
import { HyreLogo } from "@/components/shared/hyrefy-logo";
import { AdminUsersPanel } from "@/components/admin/admin-users-panel";
import { AdminEmailPanel } from "@/components/admin/admin-email-panel";
import { AdminReportsPanel } from "@/components/admin/admin-reports-panel";

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  const activeTab = tab === "employers" ? "employers"
    : tab === "reports" ? "reports"
    : tab === "users" ? "users"
    : tab === "email" ? "email"
    : "overview";

  let overviewStats = {
    totalUsers: 0,
    premiumUsers: 0,
    blockedUsers: 0,
    totalScans: 0,
    totalRevenue: 0,
  };

  let employerStats = {
    totalWaitlist: 0,
    recentWaitlist: [] as { email: string; company: string | null; createdAt: Date }[],
  };

  let reports: { id: string; type: string; title: string; description: string; contactPhone: string | null; userName: string | null; userEmail: string | null; status: string; adminNote: string | null; createdAt: Date }[] = [];

  try {
    const [totalUsers, premiumSubs, blockedCount, scansCount, payingCount] = await Promise.all([
      db.user.count(),
      db.subscription.count({ where: { status: "PREMIUM" } }),
      db.user.count({ where: { isBlocked: true } }),
      db.resumeScan.count(),
      db.subscription.count({ where: { status: "PREMIUM", stripeSubscriptionId: { not: null } } }),
    ]);
    overviewStats = {
      totalUsers,
      premiumUsers: premiumSubs,
      blockedUsers: blockedCount,
      totalScans: scansCount,
      totalRevenue: payingCount * 19,
    };
  } catch (e) {
    console.error("[admin] overview stats error:", e);
  }

  try {
    const waitlist = await (db as any).recruiterWaitlist.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    employerStats = {
      totalWaitlist: await (db as any).recruiterWaitlist.count(),
      recentWaitlist: waitlist,
    };
  } catch (e) {
    console.error("[admin] recruiterWaitlist fetch error:", e);
  }

  try {
    reports = await (db as any).userReport.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  } catch (e) {
    console.error("[admin] userReport fetch error:", e);
  }

  const conversionRate = overviewStats.totalUsers
    ? Math.round((overviewStats.premiumUsers / overviewStats.totalUsers) * 100)
    : 0;

  const stripeStatus = {
    secretKey: !!(process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.includes("dummy")),
    priceId: !!(process.env.STRIPE_PREMIUM_PRICE_ID && !process.env.STRIPE_PREMIUM_PRICE_ID.includes("dummy")),
    webhookSecret: !!(process.env.STRIPE_WEBHOOK_SECRET && !process.env.STRIPE_WEBHOOK_SECRET.includes("dummy")),
  };

  const newReportCount = reports.filter(r => r.status === "new").length;

  const TAB_LINKS = [
    { id: "overview", label: "Overview", icon: BarChart3, color: "text-primary", active: "bg-primary/10 text-primary border-primary/20" },
    { id: "users", label: "Users", icon: Users, color: "text-blue-400", active: "bg-blue-500/10 text-blue-400 border-blue-500/20", badge: overviewStats.totalUsers },
    { id: "email", label: "Email Blast", icon: Mail, color: "text-violet-400", active: "bg-violet-500/10 text-violet-400 border-violet-500/20" },
    { id: "employers", label: "Employers", icon: Building2, color: "text-amber-400", active: "bg-amber-500/10 text-amber-400 border-amber-500/20", badge: employerStats.totalWaitlist || undefined },
    { id: "reports", label: "Reports", icon: Flag, color: "text-red-400", active: "bg-red-500/10 text-red-400 border-red-500/20", badge: newReportCount || undefined },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-card/30 backdrop-blur-sm px-4 sm:px-6 py-4 sticky top-0 z-10">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <HyreLogo size={32} />
            <div>
              <p className="text-sm font-bold">Hyrefy Admin</p>
              <p className="text-xs text-muted-foreground hidden sm:block">Management Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/" className="text-xs text-muted-foreground hover:text-foreground transition-colors hidden sm:block">
              ← Back to site
            </Link>
            <AdminLogout />
          </div>
        </div>
      </header>

      {/* Tab bar — scrollable on mobile */}
      <div className="border-b border-border/30 bg-card/10 overflow-x-auto">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex gap-1 py-2 min-w-max">
            {TAB_LINKS.map(t => (
              <Link
                key={t.id}
                href={`/admin/dashboard?tab=${t.id}`}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === t.id
                    ? `border ${t.active}`
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                }`}
              >
                <t.icon className="h-4 w-4" />
                <span className="hidden xs:inline">{t.label}</span>
                {t.badge !== undefined && t.badge > 0 && (
                  <span className={`px-1.5 py-0.5 rounded-full text-[11px] font-bold ${
                    activeTab === t.id ? "bg-current/20" : "bg-muted"
                  }`}>
                    {t.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-8 space-y-6">

        {/* ── OVERVIEW TAB ── */}
        {activeTab === "overview" && (
          <>
            <div>
              <h1 className="text-xl font-bold">Platform Overview</h1>
              <p className="text-muted-foreground text-sm mt-0.5">Key metrics for Hyrefy</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {[
                { icon: Users, label: "Total Users", value: overviewStats.totalUsers, color: "text-blue-400", bg: "bg-blue-500/10" },
                { icon: CreditCard, label: "Premium Users", value: overviewStats.premiumUsers, color: "text-emerald-400", bg: "bg-emerald-500/10" },
                { icon: BarChart3, label: "Total Scans", value: overviewStats.totalScans, color: "text-purple-400", bg: "bg-purple-500/10" },
                { icon: TrendingUp, label: "Monthly Revenue", value: `$${overviewStats.totalRevenue}`, color: "text-amber-400", bg: "bg-amber-500/10" },
              ].map((stat) => (
                <Card key={stat.label} className="border-border/50 bg-card/30">
                  <CardContent className="p-4 sm:p-5">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                      <div className={`h-7 w-7 sm:h-8 sm:w-8 rounded-lg ${stat.bg} flex items-center justify-center`}>
                        <stat.icon className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${stat.color}`} />
                      </div>
                    </div>
                    <p className="text-xl sm:text-2xl font-bold">{stat.value}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Extra stats row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <Card className="border-destructive/20 bg-destructive/5">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Shield className="h-4 w-4 text-destructive" />
                    <p className="text-xs text-muted-foreground">Blocked Users</p>
                  </div>
                  <p className="text-xl font-bold text-destructive">{overviewStats.blockedUsers}</p>
                </CardContent>
              </Card>
              <Card className="border-border/50 bg-card/30">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">Conversion</p>
                  </div>
                  <p className="text-xl font-bold">{conversionRate}%</p>
                </CardContent>
              </Card>
              <Card className="border-border/50 bg-card/30">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Bell className="h-4 w-4 text-amber-400" />
                    <p className="text-xs text-muted-foreground">Waitlist</p>
                  </div>
                  <p className="text-xl font-bold">{employerStats.totalWaitlist}</p>
                </CardContent>
              </Card>
              <Card className={newReportCount > 0 ? "border-red-500/20 bg-red-500/5" : "border-border/50 bg-card/30"}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Flag className={`h-4 w-4 ${newReportCount > 0 ? "text-red-400" : "text-muted-foreground"}`} />
                    <p className="text-xs text-muted-foreground">New Reports</p>
                  </div>
                  <p className={`text-xl font-bold ${newReportCount > 0 ? "text-red-400" : ""}`}>{newReportCount}</p>
                </CardContent>
              </Card>
            </div>

            {/* Stripe config */}
            <Card className="border-amber-500/20 bg-amber-500/5">
              <CardContent className="p-5">
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-amber-400" />
                  Stripe Configuration
                </h3>
                <div className="space-y-2">
                  {[
                    { label: "Stripe Secret Key", configured: stripeStatus.secretKey },
                    { label: "Premium Price ID", configured: stripeStatus.priceId },
                    { label: "Webhook Secret", configured: stripeStatus.webhookSecret },
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

        {/* ── USERS TAB ── */}
        {activeTab === "users" && (
          <>
            <div>
              <h1 className="text-xl font-bold">User Management</h1>
              <p className="text-muted-foreground text-sm mt-0.5">Search, filter, block, grant trials, and manage all users</p>
            </div>
            <AdminUsersPanel />
          </>
        )}

        {/* ── EMAIL BLAST TAB ── */}
        {activeTab === "email" && (
          <>
            <div>
              <h1 className="text-xl font-bold">Email Blast</h1>
              <p className="text-muted-foreground text-sm mt-0.5">Send promotional or announcement emails to filtered user groups</p>
            </div>
            <AdminEmailPanel />
          </>
        )}

        {/* ── EMPLOYERS TAB ── */}
        {activeTab === "employers" && (
          <>
            <div>
              <h1 className="text-xl font-bold">Employers & Recruiters</h1>
              <p className="text-muted-foreground text-sm mt-0.5">Waitlist signups from recruiter.hyrefy.com</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
              <Card className="border-border/50 bg-card/30 sm:col-span-2">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0">
                    <Building2 className="h-5 w-5 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Recruiter Platform — Coming Soon</p>
                    <p className="text-xs text-muted-foreground mt-0.5">AI candidate screening, smart job matching, visual hiring pipeline.</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="border-border/50 bg-card/30">
              <CardHeader>
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Bell className="h-4 w-4 text-amber-400" />
                  Waitlist ({employerStats.totalWaitlist})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {employerStats.recentWaitlist.length > 0 ? (
                  <div className="divide-y divide-border/20">
                    {employerStats.recentWaitlist.map((entry, i) => (
                      <div key={`${entry.email}-${i}`} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-xs font-bold text-amber-400">
                            {((entry.email || "?")[0] ?? "?").toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{entry.email}</p>
                            {entry.company && <p className="text-xs text-muted-foreground">{entry.company}</p>}
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
              <h1 className="text-xl font-bold">User Reports & Issues</h1>
              <p className="text-muted-foreground text-sm mt-0.5">User-submitted feedback, admin-tracked issues, and status management</p>
            </div>
            <AdminReportsPanel
              initialReports={reports.map(r => ({
                ...r,
                adminNote: r.adminNote ?? null,
                createdAt: r.createdAt.toISOString(),
              }))}
            />
          </>
        )}
      </main>
    </div>
  );
}
