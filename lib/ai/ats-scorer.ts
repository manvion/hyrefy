import { generateText } from "./client";

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

export async function analyzeJobDescription(jobDescription: string, jobTitle: string): Promise<JobAnalysis> {
  const prompt = `Extract structured requirements from this job description. Return ONLY valid JSON, no markdown.

{
  "title": "${jobTitle}",
  "requiredSkills": ["skill1", "skill2"],
  "preferredSkills": ["skill1", "skill2"],
  "keywords": ["keyword1", "keyword2"],
  "experienceLevel": "Senior/Mid/Junior/Entry",
  "industryTerms": ["term1", "term2"],
  "responsibilities": ["responsibility1", "responsibility2"]
}

JOB TITLE: ${jobTitle}
JOB DESCRIPTION: ${jobDescription}`;

  const text = await generateText(prompt, { maxTokens: 1500 });
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Failed to parse job analysis");
  return JSON.parse(jsonMatch[0]);
}

export async function calculateATSScore(
  resumeRawText: string,
  jobAnalysis: JobAnalysis
): Promise<ATSScore> {
  const resumeText = resumeRawText.toLowerCase();

  const allJobKeywords = [
    ...jobAnalysis.keywords,
    ...jobAnalysis.requiredSkills,
    ...jobAnalysis.preferredSkills,
    ...jobAnalysis.industryTerms,
  ].map((k) => k.toLowerCase());

  const matchedKeywords: string[] = [];
  const missingKeywords: string[] = [];
  for (const kw of allJobKeywords) {
    (resumeText.includes(kw) ? matchedKeywords : missingKeywords).push(kw);
  }

  const keywordScore = allJobKeywords.length > 0
    ? Math.round((matchedKeywords.length / allJobKeywords.length) * 100)
    : 50;

  const actionVerbs = [
    "led","built","designed","developed","implemented","improved",
    "managed","created","increased","reduced","launched","achieved",
    "delivered","optimized","architected","scaled","automated","mentored",
    "coordinated","executed","deployed","analyzed","streamlined","established",
  ];
  const verbCount = actionVerbs.filter((v) => resumeText.includes(v)).length;

  // Formatting score based on presence of key resume sections
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

  const requiredMatched = jobAnalysis.requiredSkills.filter((s) =>
    resumeText.includes(s.toLowerCase())
  ).length;
  const experienceScore = jobAnalysis.requiredSkills.length > 0
    ? Math.round((requiredMatched / jobAnalysis.requiredSkills.length) * 100)
    : 60;

  const overall = Math.round(keywordScore * 0.4 + formattingScore * 0.3 + experienceScore * 0.3);

  const prompt = `You are an ATS expert. Give 5 specific, actionable improvements for this resume.

MISSING KEYWORDS: ${missingKeywords.slice(0, 15).join(", ")}
MATCHED KEYWORDS: ${matchedKeywords.slice(0, 10).join(", ")}
REQUIRED SKILLS: ${jobAnalysis.requiredSkills.join(", ")}
KEYWORD SCORE: ${keywordScore}%

Return ONLY valid JSON:
{
  "suggestions": ["suggestion1","suggestion2","suggestion3","suggestion4","suggestion5"],
  "improvementAreas": [
    {"area":"Keyword Optimization","priority":"high","suggestion":"Add these keywords","impact":"Could increase score 10-15 points"}
  ]
}`;

  const text = await generateText(prompt, { maxTokens: 1000 });
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  const aiAnalysis = jsonMatch ? JSON.parse(jsonMatch[0]) : { suggestions: [], improvementAreas: [] };

  return {
    overall,
    keyword: keywordScore,
    formatting: formattingScore,
    experience: experienceScore,
    breakdown: {
      keywordDensity: keywordScore,
      skillsMatch: Math.round((requiredMatched / Math.max(jobAnalysis.requiredSkills.length, 1)) * 100),
      experienceRelevance: experienceScore,
      educationMatch: hasEducation ? 80 : 40,
      formattingClarity: formattingScore,
      actionVerbs: Math.min(100, verbCount * 10),
    },
    suggestions: aiAnalysis.suggestions || [],
    missingKeywords: missingKeywords.slice(0, 20),
    matchedKeywords: matchedKeywords.slice(0, 20),
    improvementAreas: aiAnalysis.improvementAreas || [],
  };
}
