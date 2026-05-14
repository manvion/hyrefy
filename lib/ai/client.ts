/**
 * Unified AI text generation interface.
 * Routes to the correct OpenRouter model based on task type.
 * Drop-in replacement for the old Groq client — same generateText() signature.
 */

import { orGenerate, orStream, OR_MODELS, type ORModel, type OROptions } from "./openrouter";
import { cacheGet, cacheSet, makeCacheKey } from "./cache";

export type AITask = "RESUME" | "ATS" | "PARSER" | "RANKING";

export interface GenerateOptions {
  maxTokens?: number;
  system?: string;
  /** Legacy flag — kept for backward compat, maps to RESUME model */
  smart?: boolean;
  /** Task type determines which model is used */
  task?: AITask;
  /** Enable response caching */
  cache?: boolean;
  /** Cache TTL in ms (default: 10 min) */
  cacheTtl?: number;
  temperature?: number;
  thinking?: boolean;
}

function resolveModel(opts: GenerateOptions): ORModel {
  if (opts.task) return OR_MODELS[opts.task];
  // Backward compat: smart:true was "use better model" — still maps to RESUME (deepseek-chat-v3)
  return OR_MODELS.RESUME;
}

/**
 * Generate text — non-streaming.
 * Compatible with the old Groq-based generateText() signature.
 */
export async function generateText(
  prompt: string,
  options: GenerateOptions = {}
): Promise<string> {
  const model = resolveModel(options);

  if (options.cache) {
    const key = makeCacheKey(model, prompt.slice(0, 500), options.system ?? "");
    const hit = cacheGet(key);
    if (hit) return hit;

    const result = await orGenerate(model, prompt, toOROptions(options));
    cacheSet(key, result, options.cacheTtl);
    return result;
  }

  return orGenerate(model, prompt, toOROptions(options));
}

/**
 * Stream text tokens as an async generator.
 * Use in API routes that support Server-Sent Events.
 */
export async function* streamText(
  prompt: string,
  options: GenerateOptions = {}
): AsyncGenerator<string> {
  const model = resolveModel(options);
  yield* orStream(model, prompt, toOROptions(options));
}

function toOROptions(opts: GenerateOptions): OROptions {
  return {
    system: opts.system,
    maxTokens: opts.maxTokens,
    temperature: opts.temperature,
    thinking: opts.thinking,
  };
}
