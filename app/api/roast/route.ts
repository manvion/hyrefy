import { NextRequest, NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/utils/auth";
import { roastResume } from "@/lib/ai/roast";
import { db } from "@/lib/db";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const dbc = db as any;

export async function POST(request: NextRequest) {
  const userId = await getAuthUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { resumeText, resumeId } = body;

  if (!resumeText) return NextResponse.json({ error: "Resume text required" }, { status: 400 });

  try {
    const result = await roastResume(resumeText);

    let shareToken = "";
    try {
      const targetResumeId = resumeId || await getOrCreateDemoResume(userId);
      const saved = await dbc.resumeRoast.create({
        data: {
          userId,
          resumeId: targetResumeId,
          roastText: result.roastText,
          score: result.score,
          grade: result.grade,
          issues: JSON.parse(JSON.stringify(result.issues)),
          buzzwords: JSON.parse(JSON.stringify(result.buzzwords)),
          weakVerbs: JSON.parse(JSON.stringify(result.weakVerbs)),
        },
      });
      shareToken = saved.shareToken;
    } catch {
      // DB optional
    }

    return NextResponse.json({ ...result, shareToken });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Roast failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

async function getOrCreateDemoResume(userId: string): Promise<string> {
  const existing = await db.resume.findFirst({ where: { userId } });
  if (existing) return existing.id;

  const created = await db.resume.create({
    data: {
      userId,
      fileName: "resume.txt",
      fileUrl: "",
      fileType: "text/plain",
    },
  });
  return created.id;
}
