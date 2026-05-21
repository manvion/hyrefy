import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

function isAdmin(request: NextRequest): boolean {
  const cookie = request.cookies.get("hyrefy-admin-session");
  const pw = process.env.ADMIN_PASSWORD || "hyrefy-admin-2024";
  return cookie?.value === Buffer.from(pw).toString("base64");
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const { status, adminNote } = body;

  const validStatuses = ["new", "in_progress", "resolved"];
  if (status && !validStatuses.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  try {
    const data: Record<string, unknown> = {};
    if (status) data.status = status;
    if (adminNote !== undefined) data.adminNote = adminNote || null;

    const report = await (db as any).userReport.update({ where: { id }, data });
    return NextResponse.json({ report });
  } catch (e) {
    console.error("[admin/reports/:id] PATCH error:", e);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    await (db as any).userReport.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[admin/reports/:id] DELETE error:", e);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
