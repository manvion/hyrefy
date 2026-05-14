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

  try {
    const result = await generateInterviewPrep({ jobTitle, company, jobDescription, industry, level, resumeText });

    try {
      const user = await db.user.findUnique({ where: { clerkId } });
      if (user) {
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
      }
    } catch {
      // DB save optional — don't fail the request
    }

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
