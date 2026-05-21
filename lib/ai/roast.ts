import { generateText } from "./client";

export interface RoastIssue {
  category: string;
  severity: "critical" | "major" | "minor";
  description: string;
  fix: string;
}

export interface RoastResult {
  roastText: string;
  score: number;
  grade: string;
  issues: RoastIssue[];
  buzzwords: string[];
  weakVerbs: string[];
  strengths: string[];
}

const BUZZWORDS = [
  "results-driven", "dynamic", "team player", "synergy", "passionate", "innovative",
  "thought leader", "guru", "ninja", "rockstar", "wizard", "self-starter", "go-getter",
  "proactive", "strategic thinker", "detail-oriented", "hard worker", "fast learner",
  "excellent communication skills", "outside the box", "leverage", "utilize", "facilitate",
  "paradigm shift", "holistic approach", "value-add", "bandwidth",
];

const WEAK_VERBS = [
  "helped", "assisted", "worked on", "responsible for", "participated in",
  "was part of", "involved in", "contributed to", "did", "made", "got",
];

export async function roastResume(resumeText: string): Promise<RoastResult> {
  const foundBuzzwords = BUZZWORDS.filter(b => resumeText.toLowerCase().includes(b.toLowerCase()));
  const foundWeakVerbs = WEAK_VERBS.filter(v => resumeText.toLowerCase().includes(v.toLowerCase()));

  const prompt = `You are a brutally honest senior hiring manager who has reviewed 10,000+ resumes. You give direct, no-BS feedback that actually helps candidates. You're like Simon Cowell but for resumes.

Analyze this resume and provide an honest roast:

${resumeText.slice(0, 8000)}

Detected buzzwords: ${foundBuzzwords.join(", ") || "none"}
Detected weak verbs: ${foundWeakVerbs.join(", ") || "none"}

Return a JSON object:
{
  "roastText": "A brutally honest 2-3 paragraph assessment. Be direct and specific. Name real problems. Don't soften it. But end with actionable hope.",
  "score": <0-100 integer>,
  "grade": "<F|D|C|B|A|S>",
  "issues": [
    {
      "category": "Impact Metrics",
      "severity": "critical",
      "description": "No numbers anywhere. '5 years of experience' means nothing. 'Grew revenue by 340%' means everything.",
      "fix": "Add specific numbers to every bullet: %, $, time saved, team size, etc."
    }
  ],
  "strengths": ["strength1", "strength2"]
}

Score guide: 0-40=F, 41-55=D, 56-65=C, 66-79=B, 80-90=A, 91-100=S
Issues should cover: Impact/Metrics, Action Verbs, Buzzwords, Formatting, ATS compatibility, Length, Skills section, Summary, Job-specific tailoring.
Be specific about what's wrong and exactly how to fix it.
Return ONLY valid JSON.`;

  const text = await generateText(prompt, { maxTokens: 2500 });
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Failed to parse roast response");

  const parsed = JSON.parse(jsonMatch[0]);
  return {
    ...parsed,
    buzzwords: foundBuzzwords,
    weakVerbs: foundWeakVerbs,
  };
}
