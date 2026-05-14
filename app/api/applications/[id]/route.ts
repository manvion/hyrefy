import { NextRequest, NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/utils/auth";
import { db } from "@/lib/db";

const dbc = db as any;

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const clerkId = await getAuthUserId();
  if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();

  try {
    const user = await db.user.findUnique({ where: { clerkId } });
    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const existing = await dbc.jobApplication.findFirst({ where: { id, userId: user.id } });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const updated = await dbc.jobApplication.update({
      where: { id },
      data: {
        ...(body.status && { status: body.status }),
        ...(body.company !== undefined && { company: body.company }),
        ...(body.jobTitle !== undefined && { jobTitle: body.jobTitle }),
        ...(body.jobUrl !== undefined && { jobUrl: body.jobUrl }),
        ...(body.jobDescription !== undefined && { jobDescription: body.jobDescription }),
        ...(body.location !== undefined && { location: body.location }),
        ...(body.salary !== undefined && { salary: body.salary }),
        ...(body.currency !== undefined && { currency: body.currency }),
        ...(body.notes !== undefined && { notes: body.notes }),
        ...(body.appliedAt !== undefined && { appliedAt: body.appliedAt ? new Date(body.appliedAt) : null }),
      },
    });
    return NextResponse.json({ application: updated });
  } catch {
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const clerkId = await getAuthUserId();
  if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const user = await db.user.findUnique({ where: { clerkId } });
    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await dbc.jobApplication.deleteMany({ where: { id, userId: user.id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
