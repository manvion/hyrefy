import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const user = await db.user.findUnique({
      where: { clerkId: userId },
      include: { subscription: true },
    });

    if (!user || !user.subscription) {
      return NextResponse.json({ scansUsed: 0, scansLimit: 3, status: "FREE" });
    }

    return NextResponse.json({
      scansUsed: user.subscription.scansUsed,
      scansLimit: user.subscription.scansLimit,
      status: user.subscription.status,
    });
  } catch {
    return NextResponse.json({ scansUsed: 0, scansLimit: 3, status: "FREE" });
  }
}
