import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Resend } from "resend";

function isAdmin(request: NextRequest): boolean {
  const cookie = request.cookies.get("hyrefy-admin-session");
  const pw = process.env.ADMIN_PASSWORD || "hyrefy-admin-2024";
  return cookie?.value === Buffer.from(pw).toString("base64");
}

export async function POST(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { subject, htmlBody, filter } = body;

  if (!subject || !htmlBody) {
    return NextResponse.json({ error: "Subject and body required" }, { status: 400 });
  }

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    return NextResponse.json({ error: "Email service not configured" }, { status: 503 });
  }

  const fromEmail = process.env.RESEND_FROM_EMAIL || "Hyrefy <noreply@hyrefy.com>";

  // Build recipient filter
  const where: Record<string, unknown> = {};
  if (filter === "premium") {
    where.subscription = { status: "PREMIUM" };
  } else if (filter === "free") {
    where.subscription = { is: { status: "FREE" } };
  } else if (filter === "active_30d") {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);
    where.updatedAt = { gte: cutoff };
  }
  // filter === "all" means no extra where

  try {
    const users = await db.user.findMany({
      where: { ...where, isBlocked: false },
      select: { email: true, name: true },
    });

    if (users.length === 0) {
      return NextResponse.json({ error: "No recipients found" }, { status: 400 });
    }

    const resend = new Resend(resendKey);
    const emails = users.map((u) => u.email).filter(Boolean);

    // Send in batches of 50 (Resend batch limit)
    const batchSize = 50;
    let sent = 0;
    let failed = 0;

    for (let i = 0; i < emails.length; i += batchSize) {
      const batch = emails.slice(i, i + batchSize);
      try {
        await resend.batch.send(
          batch.map((to) => ({
            from: fromEmail,
            to,
            subject,
            html: htmlBody,
          }))
        );
        sent += batch.length;
      } catch {
        failed += batch.length;
      }
    }

    return NextResponse.json({
      success: true,
      sent,
      failed,
      total: emails.length,
    });
  } catch (e) {
    console.error("[admin/email] POST error:", e);
    return NextResponse.json({ error: "Failed to send emails" }, { status: 500 });
  }
}
