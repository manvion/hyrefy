import { generateText } from "./client";
import type { RewriteMode, RewriteResult } from "@/types";

const MODE_PROMPTS: Record<RewriteMode, string> = {
  PROFESSIONAL: "formal, polished business language with strong action verbs and quantified achievements",
  TECHNICAL: "technical precision with specific technologies, methodologies, and measurable engineering outcomes",
  EXECUTIVE: "executive-level language emphasizing leadership, strategy, business impact, and organizational results",
  STARTUP: "dynamic startup language emphasizing ownership, impact, rapid iteration, and cross-functional collaboration",
  COUNTRY_SPECIFIC: "country-optimized format and conventions",
};

const COUNTRY_PROMPTS: Record<string, string> = {
  US: "US market: ATS-heavy keyword optimization, use metrics that already exist in the resume (%, $, numbers), strong varied action verbs, tailor to job description keywords where they genuinely fit",
  CA: "Canadian market: 1-2 page format, bilingual (English/French) keywords valued where applicable, professional collaborative tone, reference Canadian certifications/standards where present",
  GB: "UK market: titled CV not Resume, British English spelling, 2-page format, personal profile at top, education section prominent, references available on request at end",
  AU: "Australian market: 2-3 page resume, Australian English, key achievements section, references available on request at end",
  NZ: "New Zealand market: 2-3 pages, conversational yet professional, NZ English, community involvement valued",
  FR: "Marché français: CV 1-2 pages, français professionnel idiomatique (pas d'anglicismes), chronologie inversée, compétences linguistiques, style formel et précis",
  BE: "Marché belge: CV 1-2 pages, format européen, mention des langues (FR/NL/EN), formation académique détaillée, style professionnel",
  CH: "Marché suisse: CV 1-2 pages, très précis et structuré, compétences multilingues valorisées, style européen soigné",
  IN: "Indian market: 2-3 pages, education section prominent (institutions, years, scores), skills section with full technical stack, career objective at top for junior profiles, quantified achievements where numbers exist",
};

export async function rewriteBulletPoint(
  text: string,
  mode: RewriteMode,
  jobContext?: string
): Promise<RewriteResult> {
  const modeDescription = MODE_PROMPTS[mode];

  const prompt = `You are an expert resume writer. Rewrite the following resume content using ${modeDescription}.

Rules:
1. Use strong action verbs at the start of each bullet
2. Use specific numbers that already exist in the text; if no metric exists, strengthen the verb and result description — never invent figures
3. Include relevant keywords for ATS optimization where they genuinely fit
4. Keep bullets concise (under 2 lines each)
5. Maintain professional tone appropriate for the mode — no AI buzzwords (leverage, spearhead, synergy, robust, etc.)
6. NEVER fabricate companies, titles, dates, metrics, technologies, or skills not already present in the original
${jobContext ? `7. Optimize for this role: ${jobContext}` : ""}

ORIGINAL TEXT:
${text}

Return a JSON object:
{
  "rewritten": "The fully rewritten text with improved bullets",
  "improvements": [
    "Added quantification to achievement",
    "Replaced weak verb with strong action verb",
    "Added relevant technical keywords"
  ],
  "atsImpact": "Brief explanation of how these changes improve ATS compatibility"
}

Return ONLY valid JSON.`;

  const result = await generateText(prompt, { maxTokens: 2048 });
  const jsonMatch = result.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Failed to parse rewrite response");
  const parsed = JSON.parse(jsonMatch[0]);

  return {
    mode,
    original: text,
    rewritten: parsed.rewritten,
    improvements: parsed.improvements || [],
    atsImpact: parsed.atsImpact || "",
  };
}

export async function rewriteFullResume(
  resumeText: string,
  mode: RewriteMode,
  jobDescription?: string,
  targetCountry?: string
): Promise<RewriteResult> {
  const countryContext = targetCountry && COUNTRY_PROMPTS[targetCountry]
    ? `\nCountry-specific rules for ${targetCountry}: ${COUNTRY_PROMPTS[targetCountry]}`
    : "";
  const modeDescription = mode === "COUNTRY_SPECIFIC" && targetCountry
    ? COUNTRY_PROMPTS[targetCountry] || MODE_PROMPTS.PROFESSIONAL
    : MODE_PROMPTS[mode];

  const prompt = `You are a professional resume writer. Rewrite this entire resume using ${modeDescription}.

Rules:
1. Preserve ALL factual information exactly — companies, schools, dates, technologies, metrics must not change
2. Rewrite bullet points with stronger, varied action verbs while keeping the same facts
3. Use metrics and numbers already present; if none exist for a bullet, improve the language — do not invent figures
4. Optimize for ATS with strategic keyword placement where keywords genuinely fit
5. Improve the professional summary using only information already in the resume
6. Maintain logical structure and readability — no AI buzzwords (leverage, spearhead, synergy, etc.)
${jobDescription ? `7. Target this job description: ${jobDescription.slice(0, 500)}` : ""}${countryContext}

ORIGINAL RESUME:
${resumeText}

Return a JSON object:
{
  "rewritten": "The complete rewritten resume maintaining original formatting structure",
  "improvements": [
    "Specific improvement 1",
    "Specific improvement 2"
  ],
  "atsImpact": "Summary of ATS improvements made"
}

Return ONLY valid JSON.`;

  const result = await generateText(prompt, { maxTokens: 8096 });
  const jsonMatch = result.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Failed to parse full resume rewrite");
  const parsed = JSON.parse(jsonMatch[0]);

  return {
    mode,
    original: resumeText,
    rewritten: parsed.rewritten,
    improvements: parsed.improvements || [],
    atsImpact: parsed.atsImpact || "",
  };
}
