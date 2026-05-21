/**
 * Resume + cover letter generation.
 * Uses deepseek-chat-v3-0324 (fast, high-quality creative writing).
 * Prompts are token-optimized: resume ≤ 4 000 chars, JD ≤ 2 000 chars.
 */

import { generateText } from "./client";
import { SUPPORTED_COUNTRIES, type CountryCode } from "./countries";

export { SUPPORTED_COUNTRIES, type CountryCode };

export type OutputLanguage = "en" | "fr";

const COUNTRY_STANDARDS: Record<CountryCode, string> = {
  US: "US: 1-page preferred (2 for 10+ yrs), every bullet quantified, ATS keyword-dense, no photo/age.",
  CA: "Canada: 1-2 pages, Canadian spelling, collaborative tone, bilingual skills if applicable.",
  GB: "UK CV: 2 pages, titled 'CV', British English, personal profile at top, references available on request.",
  AU: "Australia: 2-3 pages, AUS English, key achievements section, 'References available on request'.",
  NZ: "New Zealand: 2-3 pages, conversational yet professional, community involvement valued.",
  FR: "France: CV 1-2 pages, français professionnel, chronologie inversée, compétences linguistiques.",
  BE: "Belgique: CV 1-2 pages, mention des langues FR/NL/EN, formation académique détaillée.",
  CH: "Suisse: CV 1-2 pages, très précis, compétences multilingues, permis de travail si pertinent.",
  DE: "Germany: Lebenslauf 1-2 pages, education before experience, photo optional, precise and structured.",
  IN: "India: 2-3 pages, education prominent, skills section critical, objective at top for freshers.",
  AE: "UAE: 1-2 pages, education before experience, include nationality/visa status, formal tone.",
  SA: "Saudi Arabia: 1-2 pages, education section first, include Islamic greeting, formal professional tone.",
  SG: "Singapore: 1-2 pages, education before experience, highlight certifications and language skills.",
  JP: "Japan: Structured resume (rirekisho style), education and work history in chronological order.",
  ZA: "South Africa: 2-3 pages, references section common, ID number sometimes requested, local spelling.",
};

export interface GenerateInput {
  masterResumeText: string;
  jobTitle: string;
  company?: string;
  targetCountry: CountryCode;
  jobDescription: string;
  outputLanguage: OutputLanguage;
}

export interface GenerateResult {
  tailoredResume: string;
  coverLetter: string;
  atsScoreBefore: number;
  atsScoreAfter: number;
  keyChanges: string[];
  matchedKeywords: string[];
}

// ─── Non-streaming path (used by /api/generate for fallback) ──────────────────

export async function generateDocuments(input: GenerateInput): Promise<GenerateResult> {
  const { masterResumeText, jobTitle, company, targetCountry, jobDescription, outputLanguage } = input;
  const isFr = outputLanguage === "fr";

  const [resume, cover] = await Promise.all([
    generateTailoredResume(input),
    generateCoverLetter({ masterResumeText, jobTitle, company, jobDescription, outputLanguage }),
  ]);

  // ATS scores extracted from resume metadata block
  const meta = parseResumeMeta(resume.raw);

  return {
    tailoredResume: resume.clean,
    coverLetter: cover,
    atsScoreBefore: meta.before ?? 55,
    atsScoreAfter: meta.after ?? 80,
    keyChanges: meta.changes,
    matchedKeywords: meta.keywords,
  };
}

// ─── Resume generation (streaming-ready) ─────────────────────────────────────

export function buildResumePrompt(input: GenerateInput): { prompt: string; system: string } {
  const { masterResumeText, jobTitle, company, targetCountry, jobDescription, outputLanguage } = input;
  const isFr = outputLanguage === "fr";
  const countryStd = COUNTRY_STANDARDS[targetCountry];
  const countryName = SUPPORTED_COUNTRIES[targetCountry].name;

  const system = isFr
    ? `Tu es un expert CV avec 20 ans d'expérience sur les marchés francophones. Règle absolue : tu reformules ce qui existe; tu n'inventes aucun fait.`
    : `You are an elite resume writer with 20+ years of experience. Non-negotiable rule: enhance what exists, never invent facts, titles, or metrics.`;

  const prompt = `COUNTRY: ${countryStd}

MASTER RESUME — only source of facts:
${masterResumeText.slice(0, 4000)}

JOB: ${jobTitle}${company ? ` at ${company}` : ""}  |  ${countryName}  |  ${isFr ? "French output" : "English output"}

JOB DESCRIPTION:
${jobDescription.slice(0, 2000)}

OUTPUT FORMAT — CRITICAL:
Write the complete tailored resume as plain text only.
Use ALL CAPS for section headers. Use • for bullets.
After the last line of the resume, add exactly this block:

---META---
CHANGES:change1|change2|change3|change4|change5
KEYWORDS:kw1,kw2,kw3,kw4,kw5,kw6,kw7,kw8
BEFORE:XX
AFTER:YY

Where BEFORE/AFTER are integer ATS scores (0-100) for original vs tailored resume.

RULES:
• Preserve ALL facts: companies, titles, dates, technologies, metrics
• Vary action verbs — no repetition in same section
• Weave JD keywords naturally only where they genuinely fit
• ${isFr ? "Français idiomatique, registre formel. Sections en MAJUSCULES." : "Professional English — no buzzwords (leverage, synergy, robust). No corporate filler."}`;

  return { prompt, system };
}

async function generateTailoredResume(
  input: GenerateInput
): Promise<{ raw: string; clean: string }> {
  const { prompt, system } = buildResumePrompt(input);
  const raw = await generateText(prompt, { maxTokens: 3500, system, task: "RESUME" });
  return { raw, clean: extractCleanResume(raw) };
}

// ─── Cover letter generation ──────────────────────────────────────────────────

export function buildCoverLetterPrompt(
  masterResumeText: string,
  jobTitle: string,
  company: string | undefined,
  jobDescription: string,
  outputLanguage: OutputLanguage
): string {
  const isFr = outputLanguage === "fr";

  return `Write a professional cover letter for ${jobTitle}${company ? ` at ${company}` : ""}.
${isFr ? "Write in French (Canada)." : "Write in English."}

RESUME HIGHLIGHTS:
${masterResumeText.slice(0, 2500)}

JOB DESCRIPTION:
${jobDescription.slice(0, 1500)}

RULES:
• 280-350 words, 4 paragraphs
• Paragraph 1: compelling opening specific to this role — not generic
• Paragraphs 2-3: 2 strongest real experiences mapped to the job's key needs
• Paragraph 4: confident closing with call to action
• No "I am writing to apply" openers
• No AI buzzwords (leverage, spearhead, synergy)
• Based only on facts in the resume${isFr ? "\n• Formule de politesse appropriée" : ""}

Write ONLY the cover letter text. No JSON, no metadata, no title.`;
}

export async function generateCoverLetter(params: {
  masterResumeText: string;
  jobTitle: string;
  company?: string;
  jobDescription: string;
  outputLanguage: OutputLanguage;
}): Promise<string> {
  const prompt = buildCoverLetterPrompt(
    params.masterResumeText,
    params.jobTitle,
    params.company,
    params.jobDescription,
    params.outputLanguage
  );
  return generateText(prompt, { maxTokens: 900, task: "RESUME", temperature: 0.65 });
}

// ─── Metadata parsing from streamed output ───────────────────────────────────

export interface ResumeMeta {
  before: number | null;
  after: number | null;
  changes: string[];
  keywords: string[];
}

export function parseResumeMeta(raw: string): ResumeMeta {
  const metaIdx = raw.indexOf("---META---");
  if (metaIdx === -1) {
    return { before: null, after: null, changes: [], keywords: [] };
  }
  const meta = raw.slice(metaIdx + 10);

  const changesMatch = meta.match(/CHANGES:([^\n]+)/);
  const keywordsMatch = meta.match(/KEYWORDS:([^\n]+)/);
  const beforeMatch = meta.match(/BEFORE:(\d+)/);
  const afterMatch = meta.match(/AFTER:(\d+)/);

  const changes = changesMatch
    ? changesMatch[1].split("|").map((s) => s.trim()).filter(Boolean)
    : [];
  const keywords = keywordsMatch
    ? keywordsMatch[1].split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  return {
    before: beforeMatch ? parseInt(beforeMatch[1], 10) : null,
    after: afterMatch ? parseInt(afterMatch[1], 10) : null,
    changes,
    keywords,
  };
}

export function extractCleanResume(raw: string): string {
  const metaIdx = raw.indexOf("---META---");
  return metaIdx !== -1 ? raw.slice(0, metaIdx).trim() : raw.trim();
}
