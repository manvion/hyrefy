import { generateText } from "./client";
import type { ATSScore, ParsedResume, JobAnalysis } from "@/types";

export async function analyzeJobDescription(jobDescription: string, jobTitle: string): Promise<JobAnalysis> {
  const prompt = `Analyze this job description and extract structured requirements.

Return a JSON object:
{
  "title": "${jobTitle}",
  "requiredSkills": ["skill1", "skill2"],
  "preferredSkills": ["skill1", "skill2"],
  "keywords": ["keyword1", "keyword2"],
  "experienceLevel": "Senior/Mid/Junior/Entry",
  "industryTerms": ["term1", "term2"],
  "responsibilities": ["responsibility1", "responsibility2"]
}

Be comprehensive with keywords - include technologies, tools, methodologies, soft skills, industry terms.
Return ONLY valid JSON.

JOB TITLE: ${jobTitle}
JOB DESCRIPTION: ${jobDescription}`;

  const text = await generateText(prompt, { maxTokens: 2048 });
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Failed to parse job analysis");
  return JSON.parse(jsonMatch[0]);
}

export async function calculateATSScore(
  resume: ParsedResume,
  jobAnalysis: JobAnalysis
): Promise<ATSScore> {
  const resumeText = resume.rawText.toLowerCase();
  const allJobKeywords = [
    ...jobAnalysis.keywords,
    ...jobAnalysis.requiredSkills,
    ...jobAnalysis.preferredSkills,
    ...jobAnalysis.industryTerms,
  ].map((k) => k.toLowerCase());

  const matchedKeywords: string[] = [];
  const missingKeywords: string[] = [];

  for (const kw of allJobKeywords) {
    if (resumeText.includes(kw.toLowerCase())) {
      matchedKeywords.push(kw);
    } else {
      missingKeywords.push(kw);
    }
  }

  const keywordScore = allJobKeywords.length > 0
    ? Math.round((matchedKeywords.length / allJobKeywords.length) * 100)
    : 50;

  const actionVerbs = ["led", "built", "designed", "developed", "implemented", "improved",
    "managed", "created", "increased", "reduced", "launched", "achieved", "delivered",
    "optimized", "architected", "scaled", "automated", "mentored"];
  const verbCount = actionVerbs.filter((v) => resumeText.includes(v)).length;
  const formattingScore = Math.min(100, Math.round(
    (resume.experience.length > 0 ? 25 : 0) +
    (resume.skills.length > 3 ? 20 : 10) +
    (resume.education.length > 0 ? 15 : 0) +
    (resume.summary ? 15 : 0) +
    Math.min(25, verbCount * 3)
  ));

  const requiredSkillsMatched = jobAnalysis.requiredSkills.filter((s) =>
    resumeText.includes(s.toLowerCase())
  ).length;
  const experienceScore = jobAnalysis.requiredSkills.length > 0
    ? Math.round((requiredSkillsMatched / jobAnalysis.requiredSkills.length) * 100)
    : 60;

  const overall = Math.round((keywordScore * 0.4) + (formattingScore * 0.3) + (experienceScore * 0.3));

  const prompt = `You are an ATS expert. Analyze this resume against the job requirements and provide specific improvements.

RESUME SKILLS: ${resume.skills.join(", ")}
RESUME EXPERIENCE: ${resume.experience.map((e) => `${e.title} at ${e.company}`).join("; ")}
JOB REQUIRED SKILLS: ${jobAnalysis.requiredSkills.join(", ")}
JOB KEYWORDS: ${jobAnalysis.keywords.join(", ")}
KEYWORD MATCH: ${keywordScore}%
MISSING KEYWORDS: ${missingKeywords.slice(0, 15).join(", ")}

Return a JSON object:
{
  "suggestions": [
    "Specific actionable suggestion 1",
    "Specific actionable suggestion 2",
    "Specific actionable suggestion 3",
    "Specific actionable suggestion 4",
    "Specific actionable suggestion 5"
  ],
  "improvementAreas": [
    {
      "area": "Keyword Optimization",
      "priority": "high",
      "suggestion": "Add these specific keywords to your resume",
      "impact": "Could increase ATS score by 15-20 points"
    }
  ]
}

Return ONLY valid JSON.`;

  const text = await generateText(prompt, { maxTokens: 2048 });
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Failed to parse ATS suggestions");
  const aiAnalysis = JSON.parse(jsonMatch[0]);

  return {
    overall,
    keyword: keywordScore,
    formatting: formattingScore,
    experience: experienceScore,
    breakdown: {
      keywordDensity: keywordScore,
      skillsMatch: Math.round((resume.skills.filter((s) =>
        jobAnalysis.requiredSkills.map((r) => r.toLowerCase()).includes(s.toLowerCase())
      ).length / Math.max(jobAnalysis.requiredSkills.length, 1)) * 100),
      experienceRelevance: experienceScore,
      educationMatch: resume.education.length > 0 ? 80 : 40,
      formattingClarity: formattingScore,
      actionVerbs: Math.min(100, verbCount * 10),
    },
    suggestions: aiAnalysis.suggestions || [],
    missingKeywords: missingKeywords.slice(0, 20),
    matchedKeywords: matchedKeywords.slice(0, 20),
    improvementAreas: aiAnalysis.improvementAreas || [],
  };
}
