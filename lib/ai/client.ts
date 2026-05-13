import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);

export const MODEL = "gemini-2.0-flash";
export const MAX_TOKENS = 4096;

export function getModel(maxOutputTokens: number = MAX_TOKENS, systemInstruction?: string): GenerativeModel {
  return genAI.getGenerativeModel({
    model: MODEL,
    ...(systemInstruction ? { systemInstruction } : {}),
    generationConfig: { maxOutputTokens, temperature: 0.7 },
  });
}

export async function generateText(
  prompt: string,
  options: { maxTokens?: number; system?: string } = {}
): Promise<string> {
  const model = getModel(options.maxTokens ?? MAX_TOKENS, options.system);
  const result = await model.generateContent(prompt);
  return result.response.text();
}
