import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

function isAdmin(request: NextRequest): boolean {
  const cookie = request.cookies.get("hyrefy-admin-session");
  const pw = process.env.ADMIN_PASSWORD || "hyrefy-admin-2024";
  return cookie?.value === Buffer.from(pw).toString("base64");
}

// POST: create a new admin-side report entry
export async function POST(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { type, title, description, adminNote } = body;

  if (!title || !description) {
    return NextResponse.json({ error: "Title and description required" }, { status: 400 });
  }

  try {
    const report = await (db as any).userReport.create({
      data: {
        type: type || "other",
        title,
        description,
        adminNote: adminNote || null,
        status: "new",
        userName: "Admin",
      },
    });
    return NextResponse.json({ report });
  } catch (e) {
    console.error("[admin/reports] POST error:", e);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
