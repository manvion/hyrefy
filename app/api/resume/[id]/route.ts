import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { rawText } = await req.json();
  if (typeof rawText !== "string") return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  try {
    const user = await db.user.findUnique({ where: { clerkId: userId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const resume = await db.resume.findFirst({ where: { id, userId: user.id } });
    if (!resume) return NextResponse.json({ error: "Resume not found" }, { status: 404 });

    await db.resume.update({ where: { id }, data: { rawText } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const user = await db.user.findUnique({ where: { clerkId: userId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const resume = await db.resume.findFirst({ where: { id, userId: user.id } });
    if (!resume) return NextResponse.json({ error: "Resume not found" }, { status: 404 });

    await db.resume.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
