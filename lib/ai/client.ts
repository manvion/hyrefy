import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Fast model for ATS scoring, analysis, parsing
const FAST_MODEL = "llama-3.3-70b-versatile";
// Same model used for generation (Groq free tier handles it well)
const SMART_MODEL = "llama-3.3-70b-versatile";

export async function generateText(
  prompt: string,
  options: { maxTokens?: number; system?: string; smart?: boolean } = {}
): Promise<string> {
  const model = options.smart ? SMART_MODEL : FAST_MODEL;
  const messages: Groq.Chat.ChatCompletionMessageParam[] = [];

  if (options.system) {
    messages.push({ role: "system", content: options.system });
  }
  messages.push({ role: "user", content: prompt });

  const completion = await groq.chat.completions.create({
    model,
    messages,
    max_tokens: options.maxTokens ?? 4096,
    temperature: 0.7,
  });

  return completion.choices[0]?.message?.content ?? "";
}
