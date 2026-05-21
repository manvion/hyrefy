import { generateText } from "./client";
import { redactPII } from "@/lib/utils/redact-pii";

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

  const { text: safeResumeText, restore } = hasResume
    ? redactPII(resumeText!)
    : { text: "", restore: (s: string) => s };

  const prompt = `You are an expert interview coach with 20+ years of experience preparing candidates at top companies.

Generate exactly 20 high-quality interview questions for:
- Job Title: ${jobTitle}
- Company: ${company || "Not specified"}
- Level: ${level || "Mid-level"}
- Industry: ${industry || "Technology"}
${jobDescription ? `\nJob Description (extract technical requirements, tools, frameworks, and skills mentioned):\n${jobDescription.slice(0, 2000)}` : ""}
${hasResume ? `\nCANDIDATE RESUME:\n${safeResumeText.slice(0, 6000)}` : ""}

CRITICAL RULES FOR SAMPLE ANSWERS:
${hasResume ? `• For behavioral, situational, HR, and STAR questions: write sample answers that reference the candidate's ACTUAL experiences from their resume above. Name their real companies, real projects, real technologies, real metrics. Make it sound like the candidate is speaking from their genuine background.
• For technical questions: provide thorough, expert-level answers with real code snippets, formulas, or step-by-step explanations where relevant. Do NOT use the resume for technical answers — evaluate on role knowledge.
• NEVER invent companies, job titles, or metrics not in the resume.` : `• Write detailed, realistic sample answers appropriate for the role and level.
• For technical questions: provide expert-level answers with code snippets, examples, or step-by-step explanations where relevant.`}
• Every sample answer must be at least 3-5 sentences. No short or vague answers.
• Tips must be specific and actionable, not generic advice.
${jobDescription ? `• For technical questions, draw DIRECTLY from the specific tools, languages, frameworks, and responsibilities mentioned in the job description above. Make these feel like questions a real interviewer at this company would ask based on that JD.` : ""}

Return a JSON object with this exact structure:
{
  "overview": "2-3 sentence overview of what this interview will focus on",
  "keyThemes": ["theme1", "theme2", "theme3", "theme4", "theme5"],
  "questions": [
    {
      "question": "The interview question.",
      "type": "hr",
      "sampleAnswer": "Detailed, specific sample answer of at least 3-5 sentences...",
      "tips": ["Specific tip 1", "Specific tip 2", "Specific tip 3"]
    }
  ]
}

Include EXACTLY this mix of 20 questions:
- 5 behavioral questions using the STAR method (type: "behavioral") — focus on leadership, conflict, failure, teamwork, achievement
- 6 technical questions (type: "technical") — ${jobDescription ? "extract the specific technologies, tools, languages, and concepts FROM the job description above and ask real hands-on questions about them" : "ask real hands-on questions about core technical skills for this role"} — include questions that test depth of knowledge, not just definitions
- 3 situational questions presenting real work scenarios (type: "situational")
- 3 HR questions — motivation, culture fit, strengths/weaknesses, salary, growth (type: "hr")
- 2 role-specific strategic questions about industry trends, approach to the role, or solving a business problem (type: "star")
- 1 curveball or creative thinking question that top companies actually ask (type: "star")

Return ONLY valid JSON. No markdown fences, no explanation outside the JSON.`;

  const text = await generateText(prompt, { maxTokens: 7000 });
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Failed to parse interview prep response");

  const result: InterviewPrepResult = JSON.parse(jsonMatch[0]);
  // Restore any PII tokens that appeared in sample answers
  return JSON.parse(restore(JSON.stringify(result)));
}
