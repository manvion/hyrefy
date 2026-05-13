import { NextRequest, NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/utils/auth";
import { generateDocuments, type CountryCode, type OutputLanguage } from "@/lib/ai/generate";
import { db } from "@/lib/db";

const dbc = db as any;

export async function POST(request: NextRequest) {
  const userId = await getAuthUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { masterResumeText, jobTitle, company, targetCountry, jobDescription, outputLanguage, resumeId } = body;

  if (!masterResumeText || !jobTitle || !jobDescription || !targetCountry) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    const result = await generateDocuments({
      masterResumeText,
      jobTitle,
      company,
      targetCountry: targetCountry as CountryCode,
      jobDescription,
      outputLanguage: (outputLanguage || "en") as OutputLanguage,
    });

    // Save to history
    try {
      let dbUserId = userId;
      const user = await dbc.user.findUnique({ where: { clerkId: userId } });
      if (user) dbUserId = user.id;

      const scanResumeId = resumeId || await getOrCreateMasterResume(dbUserId);

      await dbc.resumeScan.create({
        data: {
          userId: dbUserId,
          resumeId: scanResumeId,
          jobTitle,
          company: company || null,
          jobDescription,
          jobCountry: targetCountry,
          atsScore: result.atsScoreAfter,
          status: "COMPLETED",
          aiResults: JSON.parse(JSON.stringify({
            tailoredResume: result.tailoredResume,
            coverLetter: result.coverLetter,
            outputLanguage,
            atsScoreBefore: result.atsScoreBefore,
            atsScoreAfter: result.atsScoreAfter,
            keyChanges: result.keyChanges,
            matchedKeywords: result.matchedKeywords,
          })),
        },
      });
    } catch {
      // History save is optional — don't fail the request
    }

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

async function getOrCreateMasterResume(userId: string): Promise<string> {
  const existing = await dbc.resume.findFirst({ where: { userId, isMaster: true } });
  if (existing) return existing.id;
  const any = await dbc.resume.findFirst({ where: { userId } });
  if (any) return any.id;
  const created = await dbc.resume.create({
    data: { userId, fileName: "master-resume", fileUrl: "", fileType: "text/plain", isMaster: true },
  });
  return created.id;
}
