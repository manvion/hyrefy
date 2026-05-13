import { generateText } from "./client";
import { SUPPORTED_COUNTRIES, type CountryCode } from "./countries";

export { SUPPORTED_COUNTRIES, type CountryCode };

export type OutputLanguage = "en" | "fr";

const COUNTRY_STANDARDS: Record<CountryCode, string> = {
  US: "US market: 1-page preferred (2 for 10+ yrs), ATS keyword-dense, every bullet quantified ($/%/numbers), tailored keywords from JD, no photo/age/marital status.",
  CA: "Canadian market: 1-2 pages, Canadian spelling, professional and collaborative tone, highlight bilingual skills if applicable, no photo required, ATS-friendly.",
  GB: "UK market: titled 'CV' not 'Resume', 2 pages standard, British English, personal profile at top, education section prominent for graduates, hobbies optional, references available on request.",
  AU: "Australian market: 2-3 pages, Australian English, key achievements section, selection criteria addressed, 'References available on request' at end.",
  NZ: "New Zealand market: 2-3 pages, conversational yet professional, key achievements highlighted, community involvement valued, NZ English.",
  FR: "Marché français: CV 1-2 pages, français professionnel, chronologie inversée, compétences linguistiques, pas de photo obligatoire, style formel et précis.",
  BE: "Marché belge: CV 1-2 pages, format européen, mention des langues (FR/NL/EN), formation académique détaillée, style professionnel.",
  CH: "Marché suisse: CV 1-2 pages, très précis et structuré, compétences multilingues valorisées, permis de travail si pertinent, style européen soigné.",
  IN: "Indian market: 2-3 pages, mention education prominently (IIT/IIM etc. if applicable), skills section critical (technical stack), objective/summary at top for freshers, quantified achievements preferred, include career objective, no photo required unless specifically requested.",
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

export async function generateDocuments(input: GenerateInput): Promise<GenerateResult> {
  const { masterResumeText, jobTitle, company, targetCountry, jobDescription, outputLanguage } = input;
  const isFr = outputLanguage === "fr";
  const countryStd = COUNTRY_STANDARDS[targetCountry];
  const countryName = SUPPORTED_COUNTRIES[targetCountry].name;

  const system = isFr
    ? `Tu es un expert en rédaction de CV et lettres de motivation avec 20 ans d'expérience sur les marchés francophones (France, Belgique, Suisse, Canada). Ton écriture est idiomatique, naturelle et professionnelle — jamais une traduction de l'anglais, jamais du jargon AI. Règle absolue : tu reformules et valorises ce qui existe dans le CV source; tu n'inventes aucun fait, chiffre, expérience ou compétence.`
    : `You are an elite resume and cover letter writer with 20+ years helping professionals at every level land top roles worldwide. You write with surgical precision — every word earns its place, every sentence sounds like it came from a seasoned human professional, never an AI. Your single non-negotiable rule: you enhance and reframe what exists; you never invent.`;

  const prompt = `COUNTRY STANDARD — apply strictly:
${countryStd}

MASTER RESUME — this is the ONLY source of facts. Never add companies, titles, dates, degrees, technologies, metrics, or skills not present here:
${masterResumeText.slice(0, 6000)}

JOB TARGET:
- Title: ${jobTitle}
- Company: ${company || "Not specified"}
- Country: ${countryName}
- Output language: ${isFr ? "French" : "English"}

JOB DESCRIPTION:
${jobDescription.slice(0, 3000)}

${isFr ? "IMPORTANT: Rédige TOUT en français idiomatique." : "IMPORTANT: Write everything in English."}

Return ONLY a JSON object (no markdown, no explanation):
{
  "atsScoreBefore": <int 0-100, original resume vs this job>,
  "atsScoreAfter": <int 0-100, tailored version vs this job>,
  "keyChanges": [<5 specific improvements you made>],
  "matchedKeywords": [<8-12 keywords from JD you wove in naturally>],
  "tailoredResume": "<complete tailored resume, section headers in ALL CAPS, bullets with •, ready to use>",
  "coverLetter": "<complete cover letter, 3-4 paragraphs, 280-350 words>"
}

RESUME RULES — follow exactly:
• PRESERVE every fact: companies, titles, dates, degrees, technologies, metrics — if it is not in the master resume, do not add it
• If a bullet has no number, improve the verb and result description — never invent a metric
• Reframe bullets to emphasize what the JD values most, using the candidate's own words as a base
• Weave JD keywords in naturally where they genuinely fit — never force-insert keywords that do not match the experience
• Vary action verbs — avoid repeating the same verb more than once in a section
• ${isFr ? "Français idiomatique, registre formel — pas d'anglicismes, pas de calques. Sections en majuscules." : "Clean professional English — no AI buzzwords (leverage, spearhead, synergy, robust, etc.). No corporate filler."}

COVER LETTER RULES:
• Paragraph 1: specific compelling opening tied to this exact role and company — not a generic opener
• Paragraphs 2-3: 2 strongest real experiences from the resume mapped to the job's key needs
• Paragraph 4: direct confident closing with call to action
• 280-350 words — tight and impactful
• ${isFr ? "Français formel et humain — formule de politesse appropriée. Sonne comme une vraie personne, pas une IA." : "Sounds like the candidate wrote it themselves — professional, direct, no AI tells."}
• Draw only from facts in the resume — never mention experiences or achievements not in the source`;

  const text = await generateText(prompt, { maxTokens: 6000, system, smart: true });
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Failed to parse AI response");

  return JSON.parse(jsonMatch[0]);
}
