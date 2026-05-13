import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { rewriteBulletPoint, rewriteFullResume } from "@/lib/ai/rewriter";
import type { RewriteMode } from "@/types";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { text, mode, type, scanId, jobContext } = await req.json() as {
      text: string;
      mode: RewriteMode;
      type: "bullet" | "full";
      scanId?: string;
      jobContext?: string;
    };

    if (!text || !mode) {
      return NextResponse.json({ error: "text and mode are required" }, { status: 400 });
    }

    const validModes: RewriteMode[] = ["PROFESSIONAL", "TECHNICAL", "EXECUTIVE", "STARTUP"];
    if (!validModes.includes(mode)) {
      return NextResponse.json({ error: "Invalid mode" }, { status: 400 });
    }

    // Check premium for non-PROFESSIONAL modes
    const user = await db.user.findUnique({
      where: { clerkId: userId },
      include: { subscription: true },
    });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const isPremium = user.subscription?.status === "PREMIUM";
    if (!isPremium && mode !== "PROFESSIONAL") {
      return NextResponse.json(
        { error: "Advanced rewrite modes require Premium. Upgrade to unlock TECHNICAL, EXECUTIVE, and STARTUP modes." },
        { status: 403 }
      );
    }

    // Perform rewrite
    let result;
    if (type === "full") {
      result = await rewriteFullResume(text, mode, jobContext);
    } else {
      result = await rewriteBulletPoint(text, mode, jobContext);
    }

    // Save to DB if scanId provided
    if (scanId) {
      const scan = await db.resumeScan.findFirst({
        where: { id: scanId, userId: user.id },
      });
      if (scan) {
        await db.resumeVersion.create({
          data: {
            scanId: scan.id,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            mode: mode as any,
            originalText: text,
            rewrittenText: result.rewritten,
            improvements: JSON.parse(JSON.stringify(result.improvements)),
          },
        });
      }
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Rewrite error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Rewrite failed" },
      { status: 500 }
    );
  }
}
