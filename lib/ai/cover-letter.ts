import { generateText } from "./client";

export type CoverLetterLanguage = "en" | "fr";
export type CoverLetterTone = "professional" | "enthusiastic" | "concise";

export interface CoverLetterInput {
  resumeText: string;
  jobTitle: string;
  jobDescription: string;
  companyName?: string;
  language: CoverLetterLanguage;
  tone: CoverLetterTone;
  candidateName?: string;
  candidateHeader?: string;
}

export interface CoverLetterResult {
  coverLetter: string;
  wordCount: number;
  highlights: string[];
}

const TONE_PROMPTS: Record<CoverLetterTone, string> = {
  professional: "formal, polished, confident",
  enthusiastic: "warm, genuine enthusiasm, personal connection to the role",
  concise: "brief, punchy, impact-driven",
};

export async function generateCoverLetter(input: CoverLetterInput): Promise<CoverLetterResult> {
  const { resumeText, jobTitle, jobDescription, companyName, language, tone, candidateHeader } = input;
  const isFr = language === "fr";

  const today = new Date().toLocaleDateString(isFr ? "fr-CA" : "en-CA", {
    year: "numeric", month: "long", day: "numeric",
  });
  const salutation = isFr ? "Madame, Monsieur," : "Dear Hiring Manager,";
  const closing = isFr ? "Cordialement," : "Sincerely,";
  const recipientLine = companyName ? `Hiring Manager\n${companyName}` : "Hiring Manager";

  const system = isFr
    ? `Expert en rédaction de lettres de motivation. Style: ${TONE_PROMPTS[tone]}. Jamais d'anglicismes. Jamais inventer de faits. Préserver les tokens [PLACEHOLDER].`
    : `Expert cover letter writer. Style: ${TONE_PROMPTS[tone]}. Never invent facts. Only use what's in the resume.`;

  const prompt = `Write a cover letter for ${jobTitle}${companyName ? ` at ${companyName}` : ""}.${isFr ? " In French (Canada)." : ""}

RESUME:
${resumeText.slice(0, 6000)}

JOB DESCRIPTION:
${jobDescription.slice(0, 2000)}

Write ONLY 3 body paragraphs (no header, no date, no salutation, no closing):
- Paragraph 1: compelling specific opening tied to this role using real resume facts
- Paragraph 2: strongest real achievement mapped to the job's key needs
- Paragraph 3: confident closing with call to action

RULES: 180-220 words total. Only facts from resume. No buzzwords. No "I am writing to apply".

Also return a JSON highlights array at the end:
HIGHLIGHTS_JSON: {"highlights":["strength1","strength2","strength3"]}

Output the 3 paragraphs, then HIGHLIGHTS_JSON on its own line.`;

  const text = await generateText(prompt, { maxTokens: 700, system });

  // Extract highlights JSON if present
  let highlights: string[] = [];
  let rawBody = text;
  const hlMatch = text.match(/HIGHLIGHTS_JSON:\s*(\{[\s\S]*?\})/);
  if (hlMatch) {
    try { highlights = JSON.parse(hlMatch[1]).highlights || []; } catch { /**/ }
    rawBody = text.slice(0, hlMatch.index).trim();
  }

  // Strip any AI-generated resume sections (e.g. ACTIVITIES, LICENSES) from the body
  const segments = rawBody.split(/\n{2,}/).map(s => s.trim()).filter(Boolean);
  const proseOnly = segments.filter(seg => {
    const lines = seg.split("\n").map(l => l.trim()).filter(Boolean);
    if (lines.every(l => l === l.toUpperCase() && !l.match(/[.!?,;]/) && l.split(/\s+/).length <= 4)) return false;
    if (seg.split(/\s+/).length < 15) return false;
    return true;
  });
  const bodyText = proseOnly.slice(0, 3).join("\n\n");

  // Assemble full letter
  const headerBlock = candidateHeader
    ? `${candidateHeader}\n\n${today}\n\n${recipientLine}\n\n${salutation}`
    : `${today}\n\n${recipientLine}\n\n${salutation}`;
  const candidateName = candidateHeader ? candidateHeader.split("\n")[0].trim() : "";
  const coverLetter = `${headerBlock}\n\n${bodyText}\n\n${closing}\n\n${candidateName}`.trim();

  return { coverLetter, wordCount: coverLetter.split(/\s+/).length, highlights };
}
