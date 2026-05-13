import { NextRequest, NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/utils/auth";
import { generateInterviewPrep } from "@/lib/ai/interview-prep";
import { db } from "@/lib/db";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const dbc = db as any;

export async function GET() {
  const userId = await getAuthUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const preps = await dbc.interviewPrep.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
    return NextResponse.json({ preps });
  } catch {
    return NextResponse.json({ preps: [] });
  }
}

export async function POST(request: NextRequest) {
  const userId = await getAuthUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { jobTitle, company, jobDescription, industry, level, resumeText } = body;

  if (!jobTitle) return NextResponse.json({ error: "Job title required" }, { status: 400 });

  try {
    const result = await generateInterviewPrep({ jobTitle, company, jobDescription, industry, level, resumeText });

    try {
      await dbc.interviewPrep.create({
        data: {
          userId,
          jobTitle,
          company: company || null,
          jobDescription: jobDescription || null,
          industry: industry || null,
          level: level || null,
          questions: JSON.parse(JSON.stringify(result.questions)),
        },
      });
    } catch {
      // DB save optional
    }

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
