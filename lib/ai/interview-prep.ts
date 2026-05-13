import { generateText } from "./client";

export interface InterviewQuestion {
  question: string;
  type: "behavioral" | "technical" | "situational" | "hr" | "star";
  sampleAnswer: string;
  tips: string[];
}

export interface InterviewPrepInput {
  jobTitle: string;
  company?: string;
  jobDescription?: string;
  industry?: string;
  level?: string;
  resumeText?: string;
}

export interface InterviewPrepResult {
  questions: InterviewQuestion[];
  overview: string;
  keyThemes: string[];
}

export async function generateInterviewPrep(input: InterviewPrepInput): Promise<InterviewPrepResult> {
  const { jobTitle, company, jobDescription, industry, level, resumeText } = input;

  const prompt = `You are an expert interview coach and hiring manager with 20+ years of experience at top companies.

Generate 10 high-quality interview questions for:
- Job Title: ${jobTitle}
- Company: ${company || "Not specified"}
- Level: ${level || "Mid-level"}
- Industry: ${industry || "Technology"}
${jobDescription ? `\nJob Description:\n${jobDescription}` : ""}
${resumeText ? `\nCandidate Resume:\n${resumeText.slice(0, 2000)}` : ""}

Return a JSON object with this exact structure:
{
  "overview": "2-3 sentence overview of what this interview will focus on",
  "keyThemes": ["theme1", "theme2", "theme3"],
  "questions": [
    {
      "question": "Tell me about yourself and why you're interested in this role.",
      "type": "hr",
      "sampleAnswer": "Detailed sample answer that would impress an interviewer...",
      "tips": ["Tip 1", "Tip 2", "Tip 3"]
    }
  ]
}

Include a mix of:
- 3 behavioral questions (STAR method)
- 2 technical questions relevant to the role
- 2 situational questions
- 2 HR questions (culture fit, motivation, strengths/weaknesses)
- 1 role-specific question

Make sample answers specific, impactful, and interview-ready. Tips should be actionable.
Return ONLY valid JSON.`;

  const text = await generateText(prompt, { maxTokens: 4000 });
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Failed to parse interview prep response");

  return JSON.parse(jsonMatch[0]);
}
