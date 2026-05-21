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
  const { action, trialDays, adminNote, newStatus } = body;

  try {
    const dbc = db as any;

    if (action === "block") {
      await db.user.update({ where: { id }, data: { isBlocked: true } });
      return NextResponse.json({ success: true, message: "User blocked" });
    }

    if (action === "unblock") {
      await db.user.update({ where: { id }, data: { isBlocked: false } });
      return NextResponse.json({ success: true, message: "User unblocked" });
    }

    if (action === "grant_trial") {
      const days = Math.max(1, Math.min(90, trialDays || 7));
      const periodEnd = new Date();
      periodEnd.setDate(periodEnd.getDate() + days);

      await dbc.subscription.upsert({
        where: { userId: id },
        update: {
          status: "PREMIUM",
          currentPeriodEnd: periodEnd,
          scansLimit: 9999,
          buildsLimit: 9999,
          coverLettersLimit: 9999,
          interviewPrepsLimit: 9999,
        },
        create: {
          userId: id,
          status: "PREMIUM",
          currentPeriodEnd: periodEnd,
          scansLimit: 9999,
          buildsLimit: 9999,
          coverLettersLimit: 9999,
          interviewPrepsLimit: 9999,
        },
      });
      return NextResponse.json({ success: true, message: `${days}-day trial granted` });
    }

    if (action === "revoke_premium") {
      await dbc.subscription.updateMany({
        where: { userId: id },
        data: {
          status: "FREE",
          currentPeriodEnd: null,
          scansLimit: 2,
          buildsLimit: 1,
          coverLettersLimit: 1,
          interviewPrepsLimit: 1,
        },
      });
      return NextResponse.json({ success: true, message: "Premium revoked" });
    }

    if (action === "add_note") {
      await db.user.update({ where: { id }, data: { adminNote: adminNote || null } });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (e) {
    console.error("[admin/users/:id] PATCH error:", e);
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
    await db.user.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "User deleted" });
  } catch (e) {
    console.error("[admin/users/:id] DELETE error:", e);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
