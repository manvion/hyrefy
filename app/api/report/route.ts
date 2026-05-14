import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

const typeLabel: Record<string, string> = {
  bug:         "Bug Report",
  feature:     "Feature Request",
  performance: "Performance Issue",
  ux:          "UX / Design Issue",
  other:       "Other",
};

export async function POST(request: NextRequest) {
  try {
    const { type, title, description, contactPhone, userName, userEmail, userId } = await request.json();

    if (!description?.trim()) {
      return NextResponse.json({ error: "Description is required" }, { status: 400 });
    }

    const resolvedTitle = title?.trim() || typeLabel[type] || "User Report";

    // Save to database first — always works
    const dbc = db as any;
    await dbc.userReport.create({
      data: {
        type:        type || "other",
        title:       resolvedTitle,
        description: description.trim(),
        contactPhone: contactPhone?.trim() || null,
        userName:    userName || null,
        userEmail:   userEmail || null,
        clerkId:     userId || null,
      },
    });

    // Attempt email notification — best effort, report emailSent status back
    const apiKey   = process.env.RESEND_API_KEY;
    const reportTo = process.env.REPORT_TO_EMAIL;

    console.log(`[report] DB saved. apiKey=${apiKey ? "set("+apiKey.length+"chars)" : "MISSING"}, reportTo=${reportTo ? "set" : "MISSING"}`);

    let emailSent = false;

    if (apiKey && reportTo) {
      try {
        const { Resend } = await import("resend");
        const resend = new Resend(apiKey);

        const now = new Date().toLocaleString("en-CA", {
          timeZone: "America/Toronto",
          dateStyle: "full",
          timeStyle: "short",
        });

        const emailResult = await resend.emails.send({
          from: "Hyrefy Reports <onboarding@resend.dev>",
          to: [reportTo],
          subject: `[HYREFY URGENT] ${typeLabel[type] ?? "Report"}: ${resolvedTitle} — from ${userName || userEmail || "user"}`,
          html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; padding: 24px; color: #111;">
  <div style="background: #0A66C2; padding: 20px 24px; border-radius: 10px 10px 0 0;">
    <h1 style="color: #fff; margin: 0; font-size: 20px;">🚨 Hyrefy User Report</h1>
    <p style="color: #cce4ff; margin: 4px 0 0; font-size: 13px;">${now}</p>
  </div>
  <div style="border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px; padding: 24px;">
    <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
      <tr style="background: #f5f5f5;">
        <td style="padding: 8px 12px; font-weight: bold; width: 140px;">Type</td>
        <td style="padding: 8px 12px;">${typeLabel[type] ?? type}</td>
      </tr>
      <tr>
        <td style="padding: 8px 12px; font-weight: bold;">Summary</td>
        <td style="padding: 8px 12px;">${resolvedTitle}</td>
      </tr>
      <tr style="background: #f5f5f5;">
        <td style="padding: 8px 12px; font-weight: bold;">User Name</td>
        <td style="padding: 8px 12px;">${userName || "—"}</td>
      </tr>
      <tr>
        <td style="padding: 8px 12px; font-weight: bold;">User Email</td>
        <td style="padding: 8px 12px;">${userEmail || "—"}</td>
      </tr>
      <tr style="background: #f5f5f5;">
        <td style="padding: 8px 12px; font-weight: bold;">User ID</td>
        <td style="padding: 8px 12px; font-size: 12px; color: #666;">${userId || "—"}</td>
      </tr>
      <tr>
        <td style="padding: 8px 12px; font-weight: bold;">Phone / Alt Contact</td>
        <td style="padding: 8px 12px;">${contactPhone?.trim() || "Not provided"}</td>
      </tr>
    </table>
    <div style="margin-top: 20px;">
      <p style="font-weight: bold; font-size: 14px; margin-bottom: 8px;">Description</p>
      <div style="background: #f9f9f9; border: 1px solid #e0e0e0; border-radius: 6px; padding: 14px; font-size: 14px; white-space: pre-wrap; line-height: 1.6;">${description}</div>
    </div>
  </div>
  <p style="font-size: 11px; color: #999; margin-top: 16px; text-align: center;">Sent automatically from Hyrefy</p>
</body>
</html>`,
        });

        console.log(`[report] Resend result:`, JSON.stringify(emailResult));
        emailSent = !emailResult.error;
      } catch (emailErr) {
        console.error("[report] Email failed (report saved):", emailErr);
      }
    } else {
      console.warn("[report] Email skipped — env vars missing");
    }

    return NextResponse.json({ success: true, emailSent });
  } catch (err) {
    console.error("Report submission error:", err);
    return NextResponse.json({ error: "Failed to save report" }, { status: 500 });
  }
}
