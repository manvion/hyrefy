import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const clerkUser = await currentUser();
    if (!clerkUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const email = clerkUser.emailAddresses[0]?.emailAddress || "";
    const name = `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim();

    const user = await db.user.upsert({
      where: { clerkId: userId },
      update: { email, name, imageUrl: clerkUser.imageUrl || null },
      create: {
        clerkId: userId,
        email,
        name,
        imageUrl: clerkUser.imageUrl || null,
        subscription: { create: { scansUsed: 0, scansLimit: 3 } },
      },
    });

    return NextResponse.json({ userId: user.id });
  } catch {
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}
