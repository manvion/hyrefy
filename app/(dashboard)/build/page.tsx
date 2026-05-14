export const dynamic = "force-dynamic";

import { getAuthUserId } from "@/lib/utils/auth";
import { db } from "@/lib/db";
import { BuildClient } from "@/components/build/build-client";
import { Button } from "@/components/ui/button";
import { Crown, PenSquare } from "lucide-react";
import Link from "next/link";

export const metadata = { title: "Build New Resume | Hyrefy" };

export default async function BuildPage() {
  const userId = await getAuthUserId();

  let buildsUsed = 0;
  let buildsLimit = 1;
  let isPremium = false;

  if (userId) {
    try {
      const user = await db.user.findUnique({
        where: { clerkId: userId },
        include: { subscription: true },
      });
      if (user?.subscription) {
        isPremium = user.subscription.status === "PREMIUM";
        buildsUsed = (user.subscription as any).buildsUsed ?? 0;
        buildsLimit = isPremium ? 9999 : 1;
      }
    } catch { /* DB not configured */ }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0 pb-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <PenSquare className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Build New Resume</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Start fresh — fill each section and use AI to polish it instantly
              </p>
            </div>
          </div>

          {!isPremium && (
            <div className="flex items-center gap-3 rounded-xl border border-border/50 bg-card/30 px-4 py-2.5 shrink-0">
              <div className="text-right">
                <p className="text-xs font-medium">{Math.max(0, buildsLimit - buildsUsed)} build{buildsLimit - buildsUsed !== 1 ? "s" : ""} remaining</p>
                <p className="text-[11px] text-muted-foreground">Free plan · 1/month</p>
              </div>
              <Button asChild size="sm" variant="gradient" className="h-7 text-xs gap-1">
                <Link href="/billing"><Crown className="h-3 w-3" />Upgrade</Link>
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <BuildClient
          buildsUsed={buildsUsed}
          buildsLimit={buildsLimit}
          isPremium={isPremium}
        />
      </div>
    </div>
  );
}
