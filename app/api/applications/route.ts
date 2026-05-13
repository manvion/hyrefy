import { NextRequest, NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/utils/auth";
import { db } from "@/lib/db";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const dbc = db as any;

export async function GET() {
  const userId = await getAuthUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const applications = await dbc.jobApplication.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ applications });
  } catch {
    return NextResponse.json({ applications: [] });
  }
}

export async function POST(request: NextRequest) {
  const userId = await getAuthUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { company, jobTitle, jobUrl, jobDescription, location, salary, currency, status, notes } = body;

  if (!company || !jobTitle) {
    return NextResponse.json({ error: "Company and job title are required" }, { status: 400 });
  }

  try {
    const app = await dbc.jobApplication.create({
      data: {
        userId,
        company,
        jobTitle,
        jobUrl: jobUrl || null,
        jobDescription: jobDescription || null,
        location: location || null,
        salary: salary || null,
        currency: currency || "USD",
        status: status || "WISHLIST",
        notes: notes || null,
      },
    });
    return NextResponse.json({ application: app });
  } catch {
    return NextResponse.json({ error: "Failed to create application" }, { status: 500 });
  }
}
