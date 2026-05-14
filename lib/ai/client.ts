import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);

export const MODEL = "gemini-2.0-flash";

export async function generateText(
  prompt: string,
  options: { maxTokens?: number; system?: string; smart?: boolean } = {}
): Promise<string> {
  const model = genAI.getGenerativeModel({
    model: MODEL,
    ...(options.system ? { systemInstruction: options.system } : {}),
    generationConfig: { maxOutputTokens: options.maxTokens ?? 4096, temperature: 0.7 },
  });
  const result = await model.generateContent(prompt);
  return result.response.text();
}
