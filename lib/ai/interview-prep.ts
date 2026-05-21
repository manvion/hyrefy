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
  const hasResume = !!(resumeText && resumeText.trim().length > 50);

  const prompt = `You are an expert interview coach with 20+ years of experience preparing candidates at top companies.

Generate 10 high-quality interview questions for:
- Job Title: ${jobTitle}
- Company: ${company || "Not specified"}
- Level: ${level || "Mid-level"}
- Industry: ${industry || "Technology"}
${jobDescription ? `\nJob Description (key requirements):\n${jobDescription.slice(0, 1500)}` : ""}
${hasResume ? `\nCANDIDATE RESUME:\n${resumeText!.slice(0, 2500)}` : ""}

CRITICAL RULES FOR SAMPLE ANSWERS:
${hasResume ? `• For behavioral, situational, HR, and STAR questions: write sample answers that reference the candidate's ACTUAL experiences from their resume above. Name their real companies, real projects, real technologies, real metrics. Make it feel like the candidate is speaking from their genuine background.
• For technical questions: write generic best-practice answers (not resume-specific), since technical skills are being evaluated independently.
• NEVER invent companies, job titles, or metrics not in the resume.` : `• Write generic but realistic sample answers appropriate for the role and level.`}
• Tips should be actionable and specific to the question type.

Return a JSON object with this exact structure:
{
  "overview": "2-3 sentence overview of what this interview will focus on",
  "keyThemes": ["theme1", "theme2", "theme3"],
  "questions": [
    {
      "question": "Tell me about yourself and why you're interested in this role.",
      "type": "hr",
      "sampleAnswer": "Detailed sample answer...",
      "tips": ["Tip 1", "Tip 2", "Tip 3"]
    }
  ]
}

Include exactly this mix:
- 3 behavioral questions (STAR method, type: "behavioral")
- 2 technical questions relevant to the role (type: "technical")
- 2 situational questions (type: "situational")
- 2 HR questions — culture fit, motivation, strengths/weaknesses (type: "hr")
- 1 role-specific question (type: "star")

Return ONLY valid JSON. No markdown, no explanation.`;

  const text = await generateText(prompt, { maxTokens: 4500 });
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Failed to parse interview prep response");

  return JSON.parse(jsonMatch[0]);
}
