import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Fast model for lightweight tasks (ATS scoring, parsing, analysis)
export const FAST_MODEL = "claude-haiku-4-5-20251001";
// Smart model for full resume + cover letter generation
export const SMART_MODEL = "claude-sonnet-4-6";

export async function generateText(
  prompt: string,
  options: { maxTokens?: number; system?: string; smart?: boolean } = {}
): Promise<string> {
  const model = options.smart ? SMART_MODEL : FAST_MODEL;
  const message = await client.messages.create({
    model,
    max_tokens: options.maxTokens ?? 4096,
    ...(options.system ? { system: options.system } : {}),
    messages: [{ role: "user", content: prompt }],
  });
  const block = message.content[0];
  if (block.type !== "text") throw new Error("Unexpected response type from Claude");
  return block.text;
}
