/**
 * Resume parser — uses llama-4-maverick (structured extraction model).
 * Cached per rawText hash to avoid re-parsing the same resume.
 */

import { generateText } from "./client";
import { makeCacheKey, cacheGet, cacheSet } from "./cache";
import type { ParsedResume } from "@/types";

export async function parseResumeWithAI(rawText: string): Promise<ParsedResume> {
  const cacheKey = makeCacheKey("resume-parse", rawText.slice(0, 800));
  const hit = cacheGet(cacheKey);
  if (hit) return JSON.parse(hit);

  const prompt = `Parse this resume. Return ONLY valid JSON — no markdown, no explanation.

{
  "name": "Full Name",
  "email": "email@example.com",
  "phone": "+1234567890",
  "location": "City, Country",
  "summary": "Professional summary",
  "skills": ["skill1","skill2"],
  "experience": [{"company":"Co","title":"Title","duration":"Jan 2020 - Present","bullets":["bullet"]}],
  "education": [{"institution":"Uni","degree":"BSc","field":"CS","year":"2018"}],
  "certifications": ["AWS Certified Developer"],
  "projects": [{"name":"Project","description":"Brief desc","technologies":["React"]}],
  "keywords": ["keyword1","keyword2"]
}

RESUME:
${rawText.slice(0, 5000)}`;

  const text = await generateText(prompt, { maxTokens: 3000, task: "PARSER" });

  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("Resume parse failed — no JSON in response");

  const parsed = JSON.parse(match[0]) as ParsedResume;
  const result = { ...parsed, rawText };
  cacheSet(cacheKey, JSON.stringify(result), 30 * 60 * 1000); // 30 min
  return result;
}
