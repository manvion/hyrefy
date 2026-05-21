import { NextRequest, NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/utils/auth";
import { roastResume } from "@/lib/ai/roast";
import { db } from "@/lib/db";
import { redactPII } from "@/lib/utils/redact-pii";

const dbc = db as any;

export async function POST(request: NextRequest) {
  const clerkId = await getAuthUserId();
  if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { resumeText } = body;

  if (!resumeText) return NextResponse.json({ error: "Resume text required" }, { status: 400 });

  try {
    const { text: safeResumeText, restore } = redactPII(resumeText);
    const rawResult = await roastResume(safeResumeText);
    // Restore PII tokens in all string fields of the roast result
    const result = JSON.parse(restore(JSON.stringify(rawResult)));

    let shareToken = "";
    try {
      const user = await db.user.findUnique({ where: { clerkId } });
      if (user) {
        // Get or create a resume record for this user
        let resume = await db.resume.findFirst({ where: { userId: user.id } });
        if (!resume) {
          resume = await db.resume.create({
            data: { userId: user.id, fileName: "resume.txt", fileUrl: "", fileType: "text/plain" },
          });
        }

        const saved = await dbc.resumeRoast.create({
          data: {
            userId: user.id,
            resumeId: resume.id,
            roastText: result.roastText,
            score: result.score,
            grade: result.grade,
            issues: JSON.parse(JSON.stringify(result.issues)),
            buzzwords: JSON.parse(JSON.stringify(result.buzzwords)),
            weakVerbs: JSON.parse(JSON.stringify(result.weakVerbs)),
          },
        });
        shareToken = saved.shareToken;
      }
    } catch {
      // DB save optional — roast still returns to user
    }

    return NextResponse.json({ ...result, shareToken });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Roast failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
