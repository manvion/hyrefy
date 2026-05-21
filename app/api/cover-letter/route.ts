import { NextRequest, NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/utils/auth";
import { db } from "@/lib/db";
import { generateCoverLetter, type CoverLetterLanguage, type CoverLetterTone } from "@/lib/ai/cover-letter";
import { redactPII } from "@/lib/utils/redact-pii";

export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const {
      resumeId,
      jobTitle,
      jobDescription,
      companyName,
      language = "en",
      tone = "professional",
      candidateName,
    } = body as {
      resumeId?: string;
      jobTitle: string;
      jobDescription: string;
      companyName?: string;
      language: CoverLetterLanguage;
      tone: CoverLetterTone;
      candidateName?: string;
    };

    if (!jobTitle || !jobDescription) {
      return NextResponse.json({ error: "Job title and description are required" }, { status: 400 });
    }

    let resumeText = body.resumeText || "";

    // Load resume text from DB if resumeId provided
    if (resumeId && !resumeText) {
      try {
        const user = await db.user.findUnique({ where: { clerkId: userId } });
        if (user) {
          const resume = await db.resume.findFirst({ where: { id: resumeId, userId: user.id } });
          if (resume) resumeText = resume.rawText;
        }
      } catch {
        // DB not available, continue with empty text
      }
    }

    if (!resumeText) {
      return NextResponse.json({ error: "Resume text is required" }, { status: 400 });
    }

    const { text: safeResumeText, restore } = redactPII(resumeText);
    const rawResult = await generateCoverLetter({
      resumeText: safeResumeText,
      jobTitle,
      jobDescription,
      companyName,
      language,
      tone,
      candidateName,
    });

    const result = {
      ...rawResult,
      coverLetter: restore(rawResult.coverLetter),
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Cover letter generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate cover letter" },
      { status: 500 }
    );
  }
}
