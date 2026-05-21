import { generateText } from "./client";
import { makeCacheKey, cacheGet, cacheSet } from "./cache";

export interface JobAnalysis {
  title: string;
  requiredSkills: string[];
  preferredSkills: string[];
  keywords: string[];
  experienceLevel: string;
  industryTerms: string[];
  responsibilities: string[];
}

export interface ATSScore {
  overall: number;
  keyword: number;
  formatting: number;
  experience: number;
  breakdown: {
    keywordDensity: number;
    skillsMatch: number;
    experienceRelevance: number;
    educationMatch: number;
    formattingClarity: number;
    actionVerbs: number;
  };
  suggestions: string[];
  missingKeywords: string[];
  matchedKeywords: string[];
  improvementAreas: { area: string; priority: string; suggestion: string; impact: string }[];
}

// ─── Job description analysis — cached, routed to qwen3-235b ──────────────────

export async function analyzeJobDescription(
  jobDescription: string,
  jobTitle: string
): Promise<JobAnalysis> {
  // Cache on the first 600 chars of the JD — same JD → free
  const cacheKey = makeCacheKey("jd-analysis", jobTitle, jobDescription.slice(0, 600));
  const hit = cacheGet(cacheKey);
  if (hit) return JSON.parse(hit);

  const prompt = `Extract structured requirements from this job description. Return ONLY valid JSON, no markdown.

{
  "title": "${jobTitle}",
  "requiredSkills": ["skill1","skill2"],
  "preferredSkills": ["skill1","skill2"],
  "keywords": ["keyword1","keyword2"],
  "experienceLevel": "Senior|Mid|Junior|Entry",
  "industryTerms": ["term1","term2"],
  "responsibilities": ["resp1","resp2"]
}

JOB TITLE: ${jobTitle}
JOB DESCRIPTION: ${jobDescription.slice(0, 2500)}`;

  const text = await generateText(prompt, {
    maxTokens: 1200,
    task: "ATS",
    thinking: false,
  });

  let result: JobAnalysis | null = null;
  const matches = text.match(/\{[\s\S]*?\}/g) || [];
  for (const m of matches) {
    try {
      const parsed = JSON.parse(m);
      if (parsed.requiredSkills || parsed.keywords) { result = parsed as JobAnalysis; break; }
    } catch { /**/ }
  }
  // Try the largest JSON blob
  if (!result) {
    const bigMatch = text.match(/\{[\s\S]*\}/);
    if (bigMatch) {
      try { result = JSON.parse(bigMatch[0]) as JobAnalysis; } catch { /**/ }
    }
  }
  if (!result) {
    // Graceful fallback — extract keywords from raw text
    const words = jobDescription.toLowerCase().match(/\b[a-z][a-z0-9+#.\-]{2,}\b/g) || [];
    const stopwords = new Set(["the","and","for","are","with","that","this","from","will","have"]);
    const kw = [...new Set(words.filter(w => !stopwords.has(w)))].slice(0, 20);
    result = { title: jobTitle, requiredSkills: kw.slice(0,10), preferredSkills: [], keywords: kw, experienceLevel: "Mid", industryTerms: [], responsibilities: [] };
  }

  cacheSet(cacheKey, JSON.stringify(result), 15 * 60 * 1000); // 15 min — JDs don't change
  return result;
}

// ─── ATS scoring — local computation + qwen3-235b for suggestions ─────────────

export async function calculateATSScore(
  resumeRawText: string,
  jobAnalysis: JobAnalysis
): Promise<ATSScore> {
  const resumeLower = resumeRawText.toLowerCase();

  // ── Keyword matching (local, ~1 ms) ──────────────────────────────────────────
  const allKeywords = [
    ...jobAnalysis.keywords,
    ...jobAnalysis.requiredSkills,
    ...jobAnalysis.preferredSkills,
    ...jobAnalysis.industryTerms,
  ].map((k) => k.toLowerCase().trim()).filter(Boolean);

  const matched: string[] = [];
  const missing: string[] = [];
  for (const kw of allKeywords) {
    (resumeLower.includes(kw) ? matched : missing).push(kw);
  }

  const keywordScore =
    allKeywords.length > 0
      ? Math.round((matched.length / allKeywords.length) * 100)
      : 50;

  // ── Formatting score (local, regex-based) ────────────────────────────────────
  const ACTION_VERBS = [
    "led","built","designed","developed","implemented","improved",
    "managed","created","increased","reduced","launched","achieved",
    "delivered","optimized","architected","scaled","automated","mentored",
    "coordinated","executed","deployed","analyzed","streamlined","established",
  ];
  const verbCount = ACTION_VERBS.filter((v) => resumeLower.includes(v)).length;
  const hasExperience = /experience|employment|work history/i.test(resumeRawText);
  const hasEducation = /education|degree|university|college|bachelor|master|diploma/i.test(resumeRawText);
  const hasSummary = /summary|objective|profile|about/i.test(resumeRawText);
  const hasSkills = /skills|technologies|tools|proficiencies/i.test(resumeRawText);

  const formattingScore = Math.min(100,
    (hasExperience ? 25 : 0) +
    (hasSkills ? 20 : 10) +
    (hasEducation ? 15 : 0) +
    (hasSummary ? 15 : 0) +
    Math.min(25, verbCount * 3)
  );

  // ── Experience match (local) ─────────────────────────────────────────────────
  const reqMatched = jobAnalysis.requiredSkills.filter((s) =>
    resumeLower.includes(s.toLowerCase())
  ).length;
  const experienceScore =
    jobAnalysis.requiredSkills.length > 0
      ? Math.round((reqMatched / jobAnalysis.requiredSkills.length) * 100)
      : 60;

  const overall = Math.round(
    keywordScore * 0.4 + formattingScore * 0.3 + experienceScore * 0.3
  );

  // ── AI suggestions — routed to qwen3-235b, cached ────────────────────────────
  const suggestKey = makeCacheKey(
    "ats-suggest",
    missing.slice(0, 15).join(","),
    jobAnalysis.requiredSkills.join(",")
  );
  const suggestHit = cacheGet(suggestKey);

  let aiAnalysis: { suggestions: string[]; improvementAreas: ATSScore["improvementAreas"] } = {
    suggestions: [],
    improvementAreas: [],
  };

  if (suggestHit) {
    aiAnalysis = JSON.parse(suggestHit);
  } else {
    const prompt = `ATS expert. Give 5 specific, actionable resume improvements.

MISSING KEYWORDS: ${missing.slice(0, 15).join(", ")}
MATCHED KEYWORDS: ${matched.slice(0, 10).join(", ")}
REQUIRED SKILLS: ${jobAnalysis.requiredSkills.join(", ")}
KEYWORD SCORE: ${keywordScore}%

Return ONLY valid JSON:
{
  "suggestions": ["s1","s2","s3","s4","s5"],
  "improvementAreas": [{"area":"Keyword Optimization","priority":"high","suggestion":"Add these keywords","impact":"Could increase score 10-15 points"}]
}`;

    try {
      const text = await generateText(prompt, {
        maxTokens: 800,
        task: "ATS",
        thinking: false,
      });
      const match = text.match(/\{[\s\S]*\}/);
      if (match) {
        aiAnalysis = JSON.parse(match[0]);
        cacheSet(suggestKey, JSON.stringify(aiAnalysis), 20 * 60 * 1000);
      }
    } catch {
      /* suggestions are non-critical — continue without them */
    }
  }

  return {
    overall,
    keyword: keywordScore,
    formatting: formattingScore,
    experience: experienceScore,
    breakdown: {
      keywordDensity: keywordScore,
      skillsMatch: Math.round((reqMatched / Math.max(jobAnalysis.requiredSkills.length, 1)) * 100),
      experienceRelevance: experienceScore,
      educationMatch: hasEducation ? 80 : 40,
      formattingClarity: formattingScore,
      actionVerbs: Math.min(100, verbCount * 10),
    },
    suggestions: aiAnalysis.suggestions ?? [],
    missingKeywords: missing.slice(0, 20),
    matchedKeywords: matched.slice(0, 20),
    improvementAreas: aiAnalysis.improvementAreas ?? [],
  };
}

// ─── Quick local-only ATS — no AI, < 1 ms ─────────────────────────────────────
// Used in the streaming generate route to show an instant score.

export function quickATS(
  resumeText: string,
  keywords: string[]
): { score: number; matchedKeywords: string[]; missingKeywords: string[] } {
  const lower = resumeText.toLowerCase();
  const matched = keywords.filter((k) => lower.includes(k.toLowerCase().trim()));
  const missing = keywords.filter((k) => !lower.includes(k.toLowerCase().trim()));
  const ratio = keywords.length > 0 ? matched.length / keywords.length : 0.5;
  const score = Math.round(30 + ratio * 50); // 30–80 range for base score
  return { score, matchedKeywords: matched.slice(0, 20), missingKeywords: missing.slice(0, 20) };
}
