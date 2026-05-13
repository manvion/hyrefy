import { generateText } from "./client";
import type { ParsedResume } from "@/types";

export async function parseResumeWithAI(rawText: string): Promise<ParsedResume> {
  const prompt = `You are an expert resume parser. Extract structured information from the following resume text.

Return a JSON object with this exact structure:
{
  "name": "Full Name",
  "email": "email@example.com",
  "phone": "+1234567890",
  "location": "City, State/Country",
  "summary": "Professional summary",
  "skills": ["skill1", "skill2"],
  "experience": [
    {
      "company": "Company Name",
      "title": "Job Title",
      "duration": "Jan 2020 - Present",
      "bullets": ["bullet point 1", "bullet point 2"]
    }
  ],
  "education": [
    {
      "institution": "University Name",
      "degree": "Bachelor of Science",
      "field": "Computer Science",
      "year": "2018"
    }
  ],
  "certifications": ["AWS Certified Developer"],
  "projects": [
    {
      "name": "Project Name",
      "description": "Brief description",
      "technologies": ["React", "Node.js"]
    }
  ],
  "keywords": ["keyword1", "keyword2"]
}

Extract ALL skills mentioned and generate comprehensive keywords from the resume content.
Return ONLY valid JSON, no markdown or explanation.

RESUME TEXT:
${rawText}`;

  const text = await generateText(prompt, { maxTokens: 4096 });

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found in response");
    const parsed = JSON.parse(jsonMatch[0]);
    return { ...parsed, rawText };
  } catch {
    throw new Error("Failed to parse AI response as JSON");
  }
}
