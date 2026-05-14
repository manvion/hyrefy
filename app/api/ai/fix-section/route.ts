import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { generateText } from "@/lib/ai/client";

export const runtime = "nodejs";
export const maxDuration = 30;

const SECTION_PROMPTS: Record<string, string> = {
  contact: "Fix and format the contact information. Ensure name, email, phone, LinkedIn, and location are properly structured.",
  summary: "Improve this professional summary. Make it concise (3-4 sentences), impactful, and achievement-focused. Use strong action words. Remove clichés.",
  experience: "Improve these work experience bullet points. Start each bullet with a strong action verb. Add quantifiable metrics where plausible (e.g., 'increased by X%', 'managed team of N'). Remove weak phrasing.",
  education: "Format and improve the education section. Include degree, institution, graduation year, and any notable achievements or GPA if relevant.",
  skills: "Organize and improve this skills section. Group related skills together. Remove outdated technologies. Ensure skills are ATS-friendly.",
  projects: "Improve these project descriptions. Add technologies used, your role, and the impact or outcome of each project.",
  certifications: "Format the certifications section with certification name, issuing organization, and year.",
  languages: "Format the languages section with proficiency level (Native, Fluent, Conversational, Basic) for each language.",
};

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { section, content, language = "en" } = await req.json();

  if (!section || !content) {
    return NextResponse.json({ error: "section and content required" }, { status: 400 });
  }

  const instruction = SECTION_PROMPTS[section] || "Improve this resume section. Make it professional, concise, and impactful.";
  const langNote = language === "fr" ? " Write the output in French (Canada)." : " Write the output in English.";

  const prompt = `${instruction}${langNote}

Return ONLY the improved content with no explanations, no headers, no markdown — just the plain text exactly as it should appear in the resume.

CURRENT CONTENT:
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
