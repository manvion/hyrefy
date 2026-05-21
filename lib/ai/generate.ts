/**
 * Resume + cover letter generation.
 * Uses deepseek-chat-v3-0324 (fast, high-quality creative writing).
 * Prompts are token-optimized: resume ≤ 4 000 chars, JD ≤ 2 000 chars.
 */

import { generateText } from "./client";
import { SUPPORTED_COUNTRIES, type CountryCode } from "./countries";
import { redactPII } from "@/lib/utils/redact-pii";

export function extractCandidateHeader(resumeText: string): string {
  const lines = resumeText.split("\n").map(l => l.trim()).filter(Boolean);
  const name = lines[0] || "";
  const contact = lines.slice(1, 4).find(l =>
    l.includes("@") || l.includes("+") || l.includes("|") || l.match(/linkedin|github/i)
  ) || lines[1] || "";
  const location = lines.slice(1, 5).find(l =>
    !l.includes("@") && !l.includes("+") && l.length < 60 && l.length > 3 &&
    !l.match(/^(SUMMARY|EXPERIENCE|EDUCATION|SKILLS)/i)
  ) || "";
  return [name, contact, location].filter(Boolean).join("\n");
}

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
  IN: "India: 2-3 pages, education prominent, skills section critical, objective at top for freshers.",
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
  const { jobTitle, company, jobDescription, outputLanguage } = input;

  const candidateHeader = extractCandidateHeader(input.masterResumeText);
  const { text: safeResumeText, restore } = redactPII(input.masterResumeText);
  const safeInput = { ...input, masterResumeText: safeResumeText };

  const [resume, cover] = await Promise.all([
    generateTailoredResume(safeInput),
    generateCoverLetter({ masterResumeText: safeResumeText, jobTitle, company, jobDescription, outputLanguage, candidateHeader }),
  ]);

  const meta = parseResumeMeta(resume.raw);

  return {
    tailoredResume: restore(resume.clean),
    coverLetter: restore(cover),
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
${masterResumeText.slice(0, 8000)}

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
• Preserve ALL [PLACEHOLDER] tokens exactly as they appear — they will be replaced with real values
• Vary action verbs — no repetition in same section
• Weave JD keywords naturally only where they genuinely fit
• ${isFr ? "Français idiomatique, registre formel. Sections en MAJUSCULES." : "Professional English — no buzzwords (leverage, synergy, robust). No corporate filler."}`;

  return { prompt, system };
}

async function generateTailoredResume(
  input: GenerateInput
): Promise<{ raw: string; clean: string }> {
  const { prompt, system } = buildResumePrompt(input);
  const raw = await generateText(prompt, { maxTokens: 4500, system, task: "RESUME" });
  return { raw, clean: extractCleanResume(raw) };
}

// ─── Cover letter generation ──────────────────────────────────────────────────

const COVER_LETTER_COUNTRY_GUIDE: Partial<Record<CountryCode, string>> = {
  GB: "Tone: formal British English. Use 'I look forward to hearing from you' as closing hook. Avoid contractions.",
  AU: "Tone: direct and conversational Australian English. Emphasise cultural fit and teamwork.",
  NZ: "Tone: friendly and professional New Zealand English. Emphasise adaptability and team contribution.",
  FR: "Tone: formal and structured (style lettre de motivation). Polished vocabulary, no colloquialisms.",
  BE: "Tone: formal Belgian French or Dutch-influenced. Clear structure, no personal jokes or informalities.",
  CH: "Tone: precise and formal Swiss style. Structured, concise, avoid superlatives.",
  IN: "Tone: professional Indian English. Highlight technical skills and academic credentials if relevant.",
};

export function buildCoverLetterPrompt(
  masterResumeText: string,
  jobTitle: string,
  company: string | undefined,
  jobDescription: string,
  outputLanguage: OutputLanguage,
  candidateHeader?: string,
  targetCountry?: CountryCode
): string {
  const isFr = outputLanguage === "fr";
  const countryGuide = targetCountry ? COVER_LETTER_COUNTRY_GUIDE[targetCountry] ?? "" : "";

  return `Write a professional cover letter for ${jobTitle}${company ? ` at ${company}` : ""}. ${isFr ? "Write in French (Canada)." : "Write in English."}${countryGuide ? `\nStyle: ${countryGuide}` : ""}

RESUME (for context only — do NOT copy contact info):
${masterResumeText.slice(0, 6000)}

JOB DESCRIPTION:
${jobDescription.slice(0, 1500)}

Write ONLY the 3 body paragraphs. Do NOT include a header, date, salutation, or closing — those are added automatically.

Paragraph 1 (3 sentences): Specific opening tied to this exact role — reference the job title and a real achievement from the resume.
Paragraph 2 (3 sentences): Strongest real experience from the resume mapped to the job's key requirements. Name real employers/projects/metrics.
Paragraph 3 (2 sentences): Confident closing with call to action.

RULES:
• 180-220 words total across all 3 paragraphs
• Use ONLY facts from the resume — NEVER invent names, companies, metrics, or technologies not in the resume
• No "I am writing to apply" openers
• No buzzwords (leverage, spearhead, synergy, passionate, robust)
• Preserve ALL [PLACEHOLDER] tokens exactly as they appear

Output ONLY the 3 paragraphs separated by blank lines. Nothing else.`;
}

function extractParagraphsOnly(raw: string): string {
  const segments = raw.split(/\n{2,}/).map(s => s.trim()).filter(Boolean);
  const prose = segments.filter(seg => {
    const lines = seg.split("\n").map(l => l.trim()).filter(Boolean);
    // Drop all-caps headers (ACTIVITIES, LICENSES, SKILLS, etc.)
    if (lines.every(l => l === l.toUpperCase() && !l.match(/[.!?,;]/) && l.split(/\s+/).length <= 4)) return false;
    // Drop very short segments (dates, greetings, one-word lines)
    if (seg.split(/\s+/).length < 15) return false;
    return true;
  });
  return prose.slice(0, 3).join("\n\n");
}

function getCountrySalutation(country: CountryCode | undefined, isFr: boolean): string {
  if (isFr || country === "FR" || country === "BE") return "Madame, Monsieur,";
  if (country === "GB" || country === "CH") return "Dear Sir or Madam,";
  return "Dear Hiring Manager,";
}

function getOpeningLine(jobTitle: string, company: string | undefined, country: CountryCode | undefined, isFr: boolean): string {
  const co = company ? ` at ${company}` : "";
  const coFr = company ? ` chez ${company}` : "";
  if (isFr || country === "FR" || country === "BE") {
    return `Je me permets de vous adresser ma candidature pour le poste de ${jobTitle}${coFr}.`;
  }
  switch (country) {
    case "US": return `I am excited to apply for the ${jobTitle} position${co}.`;
    case "GB": return `I am writing to apply for the position of ${jobTitle}${co}, as advertised.`;
    case "AU":
    case "NZ": return `I am writing to express my interest in the ${jobTitle} role${co}.`;
    default: return `I am pleased to apply for the ${jobTitle} position${co}.`;
  }
}

export async function generateCoverLetter(params: {
  masterResumeText: string;
  jobTitle: string;
  company?: string;
  jobDescription: string;
  outputLanguage: OutputLanguage;
  candidateHeader?: string;
  targetCountry?: CountryCode;
}): Promise<string> {
  const isFr = params.outputLanguage === "fr";
  const today = new Date().toLocaleDateString(isFr ? "fr-CA" : "en-CA", {
    year: "numeric", month: "long", day: "numeric",
  });
  const salutation = getCountrySalutation(params.targetCountry, isFr);
  const closing = isFr ? "Cordialement," : "Sincerely,";
  const recipientLine = params.company ? `Hiring Manager\n${params.company}` : "Hiring Manager";

  const prompt = buildCoverLetterPrompt(
    params.masterResumeText,
    params.jobTitle,
    params.company,
    params.jobDescription,
    params.outputLanguage,
    params.candidateHeader,
    params.targetCountry
  );
  const raw = await generateText(prompt, { maxTokens: 800, task: "RESUME", temperature: 0.65 });
  const body = extractParagraphsOnly(raw);
  const openingLine = getOpeningLine(params.jobTitle, params.company, params.targetCountry, isFr);

  const headerBlock = params.candidateHeader
    ? `${params.candidateHeader}\n\n${today}\n\n${recipientLine}\n\n${salutation}`
    : `${today}\n\n${recipientLine}\n\n${salutation}`;

  const candidateName = params.candidateHeader
    ? params.candidateHeader.split("\n")[0].trim()
    : "";

  return `${headerBlock}\n\n${openingLine}\n\n${body}\n\n${closing}\n\n${candidateName}`.trim();
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
