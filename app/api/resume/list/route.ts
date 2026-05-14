import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await db.user.findUnique({ where: { clerkId: userId } });
    if (!user) return NextResponse.json([]);

    const resumes = await db.resume.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      select: { id: true, fileName: true, fileType: true, isMaster: true, createdAt: true },
    });

    return NextResponse.json(resumes);
  } catch {
    return NextResponse.json([]);
  }
}
