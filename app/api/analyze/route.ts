import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { analyzeJobDescription, calculateATSScore } from "@/lib/ai/ats-scorer";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { resumeId, jobTitle, jobDescription } = await req.json();

    if (!resumeId || !jobDescription) {
      return NextResponse.json({ error: "resumeId and jobDescription are required" }, { status: 400 });
    }

    // Get user
    const user = await db.user.findUnique({
      where: { clerkId: userId },
      include: { subscription: true },
    });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Check scan limit
    const subscription = user.subscription;
    if (subscription && subscription.status === "FREE") {
      if (subscription.scansUsed >= subscription.scansLimit) {
        return NextResponse.json(
          { error: "Monthly scan limit reached. Upgrade to Premium for unlimited scans." },
          { status: 429 }
        );
      }
    }

    // Get resume
    const resume = await db.resume.findFirst({
      where: { id: resumeId, userId: user.id },
    });

    if (!resume) return NextResponse.json({ error: "Resume not found" }, { status: 404 });

    if (!resume.rawText) {
      return NextResponse.json({ error: "Resume text not found. Please re-upload your resume." }, { status: 400 });
    }

    // Analyze job description
    const jobAnalysis = await analyzeJobDescription(jobDescription, jobTitle || "Position");

    // Calculate ATS score using raw resume text
    const atsScore = await calculateATSScore(resume.rawText, jobAnalysis);

    // Create scan record
    const scan = await db.resumeScan.create({
      data: {
        userId: user.id,
        resumeId: resume.id,
        jobTitle: jobTitle || jobAnalysis.title,
        jobDescription,
        atsScore: atsScore.overall,
        keywordScore: atsScore.keyword,
        formattingScore: atsScore.formatting,
        experienceScore: atsScore.experience,
        aiResults: JSON.parse(JSON.stringify({ jobAnalysis, breakdown: atsScore.breakdown })),
        suggestions: JSON.parse(JSON.stringify(atsScore.suggestions)),
        missingKeywords: JSON.parse(JSON.stringify(atsScore.missingKeywords)),
        matchedKeywords: JSON.parse(JSON.stringify(atsScore.matchedKeywords)),
        status: "COMPLETED",
      },
    });

    // Increment scan usage
    if (subscription) {
      await db.subscription.update({
        where: { id: subscription.id },
        data: { scansUsed: { increment: 1 } },
      });
    }

    return NextResponse.json({
      scanId: scan.id,
      atsScore,
      jobAnalysis,
    });
  } catch (_error) {
    console.error("Analysis error:", _error);
    return NextResponse.json(
      { error: _error instanceof Error ? _error.message : "Analysis failed" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const scanId = searchParams.get("scanId");

    const user = await db.user.findUnique({ where: { clerkId: userId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    if (scanId) {
      const scan = await db.resumeScan.findFirst({
        where: { id: scanId, userId: user.id },
        include: { resume: true },
      });
      if (!scan) return NextResponse.json({ error: "Scan not found" }, { status: 404 });
      return NextResponse.json(scan);
    }

    const scans = await db.resumeScan.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: { resume: { select: { fileName: true } } },
    });

    return NextResponse.json(scans);
  } catch {
    return NextResponse.json({ error: "Failed to fetch scans" }, { status: 500 });
  }
}
