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
      return NextResponse.json({
        scansUsed: 0, scansLimit: 2,
        buildsUsed: 0, buildsLimit: 1,
        coverLettersUsed: 0, coverLettersLimit: 1,
        interviewPrepsUsed: 0, interviewPrepsLimit: 1,
        isPremium: false, status: "FREE",
      });
    }

    const sub = user.subscription;
    const isPremium = sub.status === "PREMIUM";

    // Check if monthly period has reset (30-day rolling window)
    const periodStart = (sub as any).periodStart as Date | null;
    const shouldReset = periodStart
      ? Date.now() - new Date(periodStart).getTime() > 30 * 24 * 60 * 60 * 1000
      : false;

    if (shouldReset && !isPremium) {
      await (db as any).subscription.update({
        where: { id: sub.id },
        data: {
          scansUsed: 0, buildsUsed: 0, coverLettersUsed: 0,
          interviewPrepsUsed: 0, periodStart: new Date(),
        },
      });
      return NextResponse.json({
        scansUsed: 0, scansLimit: 2,
        buildsUsed: 0, buildsLimit: 1,
        coverLettersUsed: 0, coverLettersLimit: 1,
        interviewPrepsUsed: 0, interviewPrepsLimit: 1,
        isPremium: false, status: "FREE",
      });
    }

    return NextResponse.json({
      scansUsed: sub.scansUsed,
      scansLimit: isPremium ? 9999 : 2,
      buildsUsed: (sub as any).buildsUsed ?? 0,
      buildsLimit: isPremium ? 9999 : 1,
      coverLettersUsed: sub.coverLettersUsed,
      coverLettersLimit: isPremium ? 9999 : 1,
      interviewPrepsUsed: sub.interviewPrepsUsed,
      interviewPrepsLimit: isPremium ? 9999 : 1,
      isPremium,
      status: sub.status,
    });
  } catch {
    return NextResponse.json({
      scansUsed: 0, scansLimit: 2,
      buildsUsed: 0, buildsLimit: 1,
      coverLettersUsed: 0, coverLettersLimit: 1,
      interviewPrepsUsed: 0, interviewPrepsLimit: 1,
      isPremium: false, status: "FREE",
    });
  }
}
