export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import Link from "next/link";
import { getAuthUserId } from "@/lib/utils/auth";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { HistoryClient } from "@/components/history/history-client";
import { SUPPORTED_COUNTRIES } from "@/lib/ai/countries";

const SIX_MONTHS_AGO = () => {
  const d = new Date();
  d.setMonth(d.getMonth() - 6);
  return d;
};

export default async function HistoryPage() {
  const userId = await getAuthUserId();
  if (!userId) redirect("/sign-in");

  let scans: any[] = [];

  try {
    const user = await db.user.findUnique({ where: { clerkId: userId } });
    if (user) {
      scans = await db.resumeScan.findMany({
        where: { userId: user.id, createdAt: { gte: SIX_MONTHS_AGO() } },
        orderBy: { createdAt: "desc" },
      });
    }
  } catch { /* DB not available */ }

  // Serialize for client
  const serialized = scans.map((s: any) => ({
    id: s.id,
    jobTitle: s.jobTitle ?? "Untitled",
    company: s.company ?? null,
    atsScore: s.atsScore ?? 0,
    jobCountry: s.jobCountry ?? null,
    createdAt: s.createdAt.toISOString(),
    aiResults: s.aiResults ?? null,
    status: s.status ?? "COMPLETED",
  }));

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">History</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {scans.length} resume{scans.length !== 1 ? "s" : ""} generated in the last 6 months
          </p>
        </div>
        <Button asChild variant="gradient" size="sm">
          <Link href="/generate">
            <Sparkles className="mr-1.5 h-3.5 w-3.5" />
            New
          </Link>
        </Button>
      </div>

      <HistoryClient scans={serialized} />
    </div>
  );
}
