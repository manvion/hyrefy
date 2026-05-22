import { generateText, streamText } from "./client";
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

function buildPrompt(input: InterviewPrepInput, safeResumeText: string, format: "json" | "ndjson"): string {
  const { jobTitle, company, jobDescription, industry, level } = input;
  const hasResume = safeResumeText.trim().length > 50;

  const resumeRules = hasResume
    ? `• For behavioral, situational, HR, and STAR questions: write sample answers that reference the candidate's ACTUAL experiences from their resume. Name real companies, projects, technologies, metrics.
• For technical questions: provide expert-level answers with code or step-by-step explanations. Do NOT use resume for technical answers.
• NEVER invent companies, job titles, or metrics not in the resume.`
    : `• Write detailed, realistic sample answers appropriate for the role and level.
• For technical questions: provide expert-level answers with code snippets or step-by-step explanations where relevant.`;

  const questionMix = `Include EXACTLY this mix of 20 questions:
- 4 behavioral questions (STAR method) — leadership, conflict, achievement, teamwork (type: "behavioral")
- 7 technical questions — ${jobDescription ? "drawn from specific tools/languages/frameworks in the JD" : "core technical skills for this role"} — test depth not definitions (type: "technical")
- 4 situational questions with real work scenarios (type: "situational")
- 3 HR questions — motivation, strengths/weaknesses, culture fit (type: "hr")
- 2 curveball or strategic thinking questions (type: "star")`;

  if (format === "ndjson") {
    return `You are an expert interview coach. Generate 20 interview questions for:
- Job Title: ${jobTitle}
- Company: ${company || "Not specified"}
- Level: ${level || "Mid-level"}
- Industry: ${industry || "Technology"}
${jobDescription ? `\nJob Description:\n${jobDescription.slice(0, 1500)}` : ""}
${hasResume ? `\nCANDIDATE RESUME:\n${safeResumeText.slice(0, 4000)}` : ""}

RULES FOR ANSWERS:
${resumeRules}
• Every sample answer must be 3-5 sentences. Specific and actionable tips only.
${jobDescription ? `• Technical questions must draw from tools/languages/frameworks in the JD.` : ""}

${questionMix}

OUTPUT FORMAT — CRITICAL: Output each question as a SINGLE LINE starting with "QUESTION:" followed by a compact JSON object. End with one "META:" line.
Do NOT use pretty-printing. Each line must be parseable independently.

Example format:
QUESTION:{"question":"Tell me about yourself.","type":"hr","sampleAnswer":"I have been...","tips":["Focus on recent 3 years","Connect to this role"]}
QUESTION:{"question":"What is a closure?","type":"technical","sampleAnswer":"A closure is...","tips":["Give a code example"]}
META:{"overview":"This interview focuses on...","keyThemes":["JavaScript","Leadership","Communication","Problem-solving","Agile"]}

Output ONLY the QUESTION: and META: lines. No other text.`;
  }

  return `You are an expert interview coach with 20+ years of experience.

Generate exactly 20 high-quality interview questions for:
- Job Title: ${jobTitle}
- Company: ${company || "Not specified"}
- Level: ${level || "Mid-level"}
- Industry: ${industry || "Technology"}
${jobDescription ? `\nJob Description:\n${jobDescription.slice(0, 1500)}` : ""}
${hasResume ? `\nCANDIDATE RESUME:\n${safeResumeText.slice(0, 4000)}` : ""}

RULES:
${resumeRules}
• Every sample answer must be at least 3-5 sentences. No short or vague answers.
• Tips must be specific and actionable.
${jobDescription ? `• Technical questions draw DIRECTLY from the JD.` : ""}

${questionMix}

Return a JSON object:
{
  "overview": "2-3 sentence overview of what this interview will focus on",
  "keyThemes": ["theme1", "theme2", "theme3", "theme4", "theme5"],
  "questions": [{ "question": "...", "type": "hr", "sampleAnswer": "...", "tips": ["..."] }]
}

Return ONLY valid JSON. No markdown fences.`;
}

export async function generateInterviewPrep(input: InterviewPrepInput): Promise<InterviewPrepResult> {
  const hasResume = !!(input.resumeText && input.resumeText.trim().length > 50);
  const { text: safeResumeText, restore } = hasResume
    ? redactPII(input.resumeText!)
    : { text: "", restore: (s: string) => s };

  const prompt = buildPrompt(input, safeResumeText, "json");
  const text = await generateText(prompt, { maxTokens: 6000 });
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Failed to parse interview prep response");

  const result: InterviewPrepResult = JSON.parse(jsonMatch[0]);
  return JSON.parse(restore(JSON.stringify(result)));
}

export type StreamEvent =
  | { type: "question"; question: InterviewQuestion }
  | { type: "meta"; overview: string; keyThemes: string[] }
  | { type: "status"; message: string }
  | { type: "error"; message: string };

export async function* streamInterviewPrep(input: InterviewPrepInput): AsyncGenerator<StreamEvent> {
  const hasResume = !!(input.resumeText && input.resumeText.trim().length > 50);
  const { text: safeResumeText, restore } = hasResume
    ? redactPII(input.resumeText!)
    : { text: "", restore: (s: string) => s };

  yield { type: "status", message: "Connecting to AI..." };

  const prompt = buildPrompt(input, safeResumeText, "ndjson");

  let buffer = "";
  let aiStarted = false;
  try {
    for await (const token of streamText(prompt, { maxTokens: 6000 })) {
      if (!aiStarted) {
        aiStarted = true;
        yield { type: "status", message: "Generating your questions..." };
      }
      buffer += token;
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        const t = line.trim();
        if (t.startsWith("QUESTION:")) {
          try {
            const raw = t.slice("QUESTION:".length).trim();
            const q: InterviewQuestion = JSON.parse(raw);
            // Restore PII tokens in sample answer
            q.sampleAnswer = restore(q.sampleAnswer);
            yield { type: "question", question: q };
          } catch { /* malformed line, skip */ }
        } else if (t.startsWith("META:")) {
          try {
            const raw = t.slice("META:".length).trim();
            const meta = JSON.parse(restore(raw));
            yield { type: "meta", overview: meta.overview ?? "", keyThemes: meta.keyThemes ?? [] };
          } catch { /* skip */ }
        }
      }
    }

    // Process any remaining buffer
    const t = buffer.trim();
    if (t.startsWith("QUESTION:")) {
      try {
        const q: InterviewQuestion = JSON.parse(t.slice("QUESTION:".length).trim());
        q.sampleAnswer = restore(q.sampleAnswer);
        yield { type: "question", question: q };
      } catch { /* skip */ }
    } else if (t.startsWith("META:")) {
      try {
        const meta = JSON.parse(restore(t.slice("META:".length).trim()));
        yield { type: "meta", overview: meta.overview ?? "", keyThemes: meta.keyThemes ?? [] };
      } catch { /* skip */ }
    }
  } catch (err) {
    yield { type: "error", message: err instanceof Error ? err.message : "Generation failed" };
  }
}
