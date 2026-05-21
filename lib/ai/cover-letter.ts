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
}

export interface CoverLetterResult {
  coverLetter: string;
  wordCount: number;
  highlights: string[];
}

const TONE_PROMPTS = {
  professional: "formal, polished, confident",
  enthusiastic: "warm, genuine enthusiasm, personal connection to the role",
  concise: "brief, punchy, impact-driven — under 300 words",
};

export async function generateCoverLetter(input: CoverLetterInput): Promise<CoverLetterResult> {
  const { resumeText, jobTitle, jobDescription, companyName, language, tone, candidateName } = input;
  const isFr = language === "fr";

  const today = new Date().toLocaleDateString(isFr ? "fr-CA" : "en-CA", {
    year: "numeric", month: "long", day: "numeric",
  });

  const system = isFr
    ? `Tu es un expert en rédaction de lettres de motivation professionnelles en français avec 20 ans d'expérience.
Style: ${TONE_PROMPTS[tone]}
RÈGLES ABSOLUES:
- Français idiomatique et naturel — jamais d'anglicismes
- Sonne comme une vraie personne cultivée, pas une IA
- Ne jamais inventer de faits non présents dans le CV
- Préserver tous les tokens [PLACEHOLDER] exactement tels quels`
    : `You are an expert cover letter writer with 20 years of experience.
Style: ${TONE_PROMPTS[tone]}
ABSOLUTE RULES:
- Never start with "I am writing to apply for" or "I am a highly motivated"
- No AI buzzwords: leverage, spearhead, synergy, passionate, robust, dynamic
- Every claim must be grounded in the candidate's resume
- Never fabricate experiences or skills not in the resume
- Preserve all [PLACEHOLDER] tokens exactly as they appear`;

  const prompt = `Write a COMPLETE, properly formatted cover letter for:
TARGET ROLE: ${jobTitle}
${companyName ? `COMPANY: ${companyName}` : ""}

RESUME (extract candidate name and contact from the first 3 lines):
${resumeText.slice(0, 8000)}

JOB DESCRIPTION:
${jobDescription.slice(0, 3000)}

OUTPUT FORMAT — output the full letter exactly like this structure (preserve blank lines):

[Candidate full name from resume line 1]
[Email | Phone from resume]
[City/Country or LinkedIn if present]

${today}

${isFr ? "Madame, Monsieur," : "Hiring Manager"}${companyName ? `\n${companyName}` : ""}

${isFr ? "Madame, Monsieur," : "Dear Hiring Manager,"}

[Body paragraph 1 — specific compelling opening tied to this role]

[Body paragraph 2 — strongest real experience mapped to this job's key needs]

[Body paragraph 3 — second key differentiator or experience mapped to the role]

[Body paragraph 4 — confident closing with call to action, availability]

${isFr ? "Cordialement," : "Sincerely,"}

[Candidate full name from resume line 1]

Return a JSON object:
{
  "coverLetter": "the complete formatted letter above, with all blank lines preserved as \\n\\n",
  "highlights": ["key strength 1 emphasized", "key strength 2", "key alignment 3"]
}`;

  const text = await generateText(prompt, { maxTokens: 4096, system });
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Could not parse cover letter response");

  const result = JSON.parse(jsonMatch[0]) as { coverLetter: string; highlights: string[] };
  const wordCount = result.coverLetter.split(/\s+/).length;

  return {
    coverLetter: result.coverLetter,
    wordCount,
    highlights: result.highlights || [],
  };
}
