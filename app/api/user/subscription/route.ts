import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await db.user.findUnique({
      where: { clerkId: userId },
      include: { subscription: true },
    });

    if (!user?.subscription) {
      return NextResponse.json({ status: "FREE", scansUsed: 0, scansLimit: 3 });
    }

    return NextResponse.json({
      status: user.subscription.status,
      scansUsed: user.subscription.scansUsed,
      scansLimit: user.subscription.scansLimit,
      currentPeriodEnd: user.subscription.currentPeriodEnd?.toISOString(),
    });
  } catch {
    return NextResponse.json({ status: "FREE", scansUsed: 0, scansLimit: 3 });
  }
}
