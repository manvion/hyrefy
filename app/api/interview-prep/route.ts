import { NextRequest, NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/utils/auth";
import { generateInterviewPrep } from "@/lib/ai/interview-prep";
import { db } from "@/lib/db";

const dbc = db as any;

export async function GET() {
  const clerkId = await getAuthUserId();
  if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const user = await db.user.findUnique({ where: { clerkId } });
    if (!user) return NextResponse.json({ preps: [] });

    const preps = await dbc.interviewPrep.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
    return NextResponse.json({ preps });
  } catch {
    return NextResponse.json({ preps: [] });
  }
}

export async function POST(request: NextRequest) {
  const clerkId = await getAuthUserId();
  if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { jobTitle, company, jobDescription, industry, level, resumeText } = body;

  if (!jobTitle) return NextResponse.json({ error: "Job title required" }, { status: 400 });

  const user = await db.user.findUnique({ where: { clerkId }, include: { subscription: true } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const isPremium = user.subscription?.status === "PREMIUM";
  if (!isPremium) {
    const limit = user.subscription?.interviewPrepsLimit ?? 1;
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonthCount = await dbc.interviewPrep.count({
      where: { userId: user.id, createdAt: { gte: monthStart } },
    });
    if (thisMonthCount >= limit) {
      return NextResponse.json(
        { error: "Monthly limit reached. Upgrade to Premium for unlimited access.", used: thisMonthCount, limit },
        { status: 403 }
      );
    }
  }

  try {
    const result = await generateInterviewPrep({ jobTitle, company, jobDescription, industry, level, resumeText });

    try {
      await dbc.interviewPrep.create({
        data: {
          userId: user.id,
          jobTitle,
          company: company || null,
          jobDescription: jobDescription || null,
          industry: industry || null,
          level: level || null,
          questions: JSON.parse(JSON.stringify(result.questions)),
        },
      });
    } catch {
      // DB save optional — don't fail the request
    }

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
