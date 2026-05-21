import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { generateText } from "@/lib/ai/client";

export const runtime = "nodejs";
export const maxDuration = 30;

const SECTION_PROMPTS: Record<string, string> = {
  contact: `Clean up and format the contact information. Fix spacing and punctuation only. Do NOT add, remove, or change any actual details (name, email, phone, LinkedIn, location).`,
  summary: `Rewrite this professional summary to be more concise and impactful (3–4 sentences). Use stronger action verbs and clearer language. Only use facts already stated — do NOT add achievements, roles, or skills not mentioned in the original.`,
  experience: `Improve the writing quality of these bullet points. Start each bullet with a strong action verb. Improve clarity and grammar. Do NOT invent numbers, metrics, team sizes, percentages, or outcomes not already in the text. Only rewrite what is there.`,
  education: `Format and improve the education entries. Fix grammar and punctuation. Do NOT add GPA, honors, or details not already present.`,
  skills: `Organize and clean up the skills list. Group related skills. Fix typos. Do NOT add any skills not already listed.`,
  projects: `Improve the writing quality of these project descriptions. Make the language clearer and more concise. Do NOT add technologies, outcomes, or details not already present.`,
  certifications: `Format the certifications cleanly with name, issuer, and year. Only use what is already provided — do NOT add or invent details.`,
  languages: `Format the languages section. If proficiency levels are missing, you may suggest standard levels (Native, Fluent, Conversational, Basic) only if the language is already listed.`,
};

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { section, content, language = "en" } = await req.json();

  if (!section || !content?.trim()) {
    return NextResponse.json({ error: "section and content required" }, { status: 400 });
  }

  const instruction = SECTION_PROMPTS[section] || "Improve the writing quality only. Do NOT add any information not already present in the original text.";
  const langNote = language === "fr" ? " Write the output in French (Canada)." : " Write the output in English.";

  const prompt = `${instruction}${langNote}

CRITICAL: Return ONLY the improved version of the text below — no explanations, no preamble, no markdown, no headings. The output must contain only the same information as the input, rewritten more clearly.

ORIGINAL TEXT:
${content}`;

  try {
    const improved = await generateText(prompt, { maxTokens: 1024 });
    return NextResponse.json({ improved: improved.trim() });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "AI fix failed" },
      { status: 500 }
    );
  }
}
