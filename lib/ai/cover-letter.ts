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

  const system = language === "fr"
    ? `Tu es un expert en rédaction de lettres de motivation professionnelles en français avec 20 ans d'expérience sur les marchés francophones.
Style: ${TONE_PROMPTS[tone]}
RÈGLES ABSOLUES:
- Français idiomatique et naturel — jamais une traduction de l'anglais, jamais d'anglicismes
- Sonne comme une vraie personne cultivée, pas une IA
- Structure: accroche spécifique au poste + valeur ajoutée réelle + motivation sincère + call-to-action direct
- Personnalisée à cette offre précise — jamais générique
- Ne jamais inventer de faits, d'expériences ou de réalisations non présentes dans le CV
- Formule de politesse professionnelle appropriée en clôture
- Format: lettre prête à envoyer, 280-350 mots`
    : `You are an expert cover letter writer with 20 years of experience. You craft letters that sound like they came from a smart, accomplished human professional — never an AI.
Style: ${TONE_PROMPTS[tone]}
ABSOLUTE RULES:
- Never start with "I am writing to apply for" or "I am a highly motivated"
- No AI buzzwords: leverage, spearhead, synergy, passionate, robust, dynamic
- Every claim must be grounded in the candidate's actual background from the resume
- Never fabricate experiences, achievements, or skills not present in the resume provided
- Structure: specific hook tied to this role → value proposition from real experience → alignment with job needs → direct call-to-action
- Professional but human — reads like the candidate wrote it themselves
- 280-350 words, ready to send`;

  const prompt = `Write a cover letter for the following:

CANDIDATE NAME: ${candidateName || "the candidate"}
TARGET ROLE: ${jobTitle}
${companyName ? `COMPANY: ${companyName}` : ""}

RESUME/BACKGROUND:
${resumeText.slice(0, 6000)}

JOB DESCRIPTION:
${jobDescription.slice(0, 3000)}

Return a JSON object with:
{
  "coverLetter": "the full cover letter text, formatted with paragraphs",
  "highlights": ["key strength 1 emphasized", "key strength 2 emphasized", "key alignment 3"]
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
