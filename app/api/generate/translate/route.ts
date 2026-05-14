import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { generateText } from "@/lib/ai/client";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { text, targetLanguage, docType } = await req.json();

  if (!text || !targetLanguage) {
    return NextResponse.json({ error: "text and targetLanguage required" }, { status: 400 });
  }

  const langName = targetLanguage === "fr" ? "French (Canada)" : "English";
  const prompt = `Translate the following ${docType === "cover" ? "cover letter" : "resume"} to ${langName}.
Preserve all formatting, structure, bullet points, and whitespace exactly.
Only translate the text content — do not add, remove, or reorder any sections.
Return only the translated document with no explanations.

DOCUMENT:
${text}`;

  try {
    const translated = await generateText(prompt, { maxTokens: 4096 });
    return NextResponse.json({ translated });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Translation failed" },
      { status: 500 }
    );
  }
}
