/**
 * OpenRouter AI client — model routing, streaming, retry, and fallback.
 * Uses fetch directly; no SDK dependency.
 * Models verified from openrouter.ai/collections/free-models
 */

const BASE_URL = "https://openrouter.ai/api/v1";

// ─── Model registry ────────────────────────────────────────────────────────────
export const OR_MODELS = {
  /** Resume writing, cover letters, bullet improvements */
  RESUME:   "openai/gpt-oss-120b:free",
  /** ATS scoring, keyword analysis */
  ATS:      "google/gemma-4-31b-it:free",
  /** Structured extraction — resume parsing */
  PARSER:   "openai/gpt-oss-20b:free",
  /** Reasoning — candidate ranking, advanced comparisons */
  RANKING:  "nvidia/nemotron-3-super-120b-a12b:free",
  /** Final fallback — OpenRouter auto-routes to best available free model */
  FALLBACK: "openrouter/free",
} as const;

export type ORModel = (typeof OR_MODELS)[keyof typeof OR_MODELS];

// Ordered fallback chain — tried in sequence on 404 (endpoint unavailable)
const FREE_CHAIN: string[] = [
  "openai/gpt-oss-120b:free",
  "google/gemma-4-31b-it:free",
  "nvidia/nemotron-3-super-120b-a12b:free",
  "openai/gpt-oss-20b:free",
  "nvidia/nemotron-3-nano-30b-a3b:free",
  "openrouter/free",
];

export interface OROptions {
  system?: string;
  maxTokens?: number;
  temperature?: number;
  /** Abort after this many ms (default: 45 000) */
  timeout?: number;
  /** Enable chain-of-thought (default: false) */
  thinking?: boolean;
}

// ─── Internal helpers ──────────────────────────────────────────────────────────

const MAX_RETRIES = 2;
const RETRY_ON = new Set([429, 502, 503, 524]);
const FALLBACK_ON = new Set([404, 400]);

function headers() {
  return {
    Authorization: `Bearer ${process.env.OPENROUTER_API_KEY ?? ""}`,
    "Content-Type": "application/json",
    "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL ?? "https://app.hyrefy.com",
    "X-Title": "Hyrefy",
  };
}

function body(
  model: string,
  messages: { role: string; content: string }[],
  opts: OROptions,
  stream: boolean
): Record<string, unknown> {
  return {
    model,
    messages,
    max_tokens: opts.maxTokens ?? 4096,
    temperature: opts.temperature ?? 0.7,
    stream,
  };
}

function buildMessages(system: string | undefined, prompt: string) {
  const msgs: { role: string; content: string }[] = [];
  if (system) msgs.push({ role: "system", content: system });
  msgs.push({ role: "user", content: prompt });
  return msgs;
}

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  ms: number
): Promise<Response> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { ...init, signal: ctrl.signal });
  } finally {
    clearTimeout(timer);
  }
}

// ─── Non-streaming call with retry ────────────────────────────────────────────

async function callOnce(
  model: string,
  msgs: { role: string; content: string }[],
  opts: OROptions,
  attempt = 0
): Promise<string> {
  const timeout = opts.timeout ?? 45_000;
  const reqBody = body(model, msgs, opts, false);

  let res: Response;
  try {
    res = await fetchWithTimeout(
      `${BASE_URL}/chat/completions`,
      { method: "POST", headers: headers(), body: JSON.stringify(reqBody) },
      timeout
    );
  } catch (err) {
    if (attempt < MAX_RETRIES) {
      await sleep(Math.pow(2, attempt) * 800);
      return callOnce(model, msgs, opts, attempt + 1);
    }
    throw new Error(`OpenRouter fetch error: ${err instanceof Error ? err.message : err}`);
  }

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    if (FALLBACK_ON.has(res.status)) {
      throw new Error(`OpenRouter ${res.status}: ${txt.slice(0, 300)}`);
    }
    if (RETRY_ON.has(res.status) && attempt < MAX_RETRIES) {
      await sleep(Math.pow(2, attempt) * 800);
      return callOnce(model, msgs, opts, attempt + 1);
    }
    throw new Error(`OpenRouter ${res.status}: ${txt.slice(0, 300)}`);
  }

  type ORResponse = { choices?: { message?: { content?: string } }[] };
  const data = (await res.json()) as ORResponse;
  return data.choices?.[0]?.message?.content ?? "";
}

function shouldTryNextModel(err: Error): boolean {
  const msg = err.message;
  return msg.includes("404") || msg.includes("No endpoints") || msg.includes("429");
}

// ─── Public: non-streaming with chain fallback ─────────────────────────────────

export async function orGenerate(
  model: ORModel,
  prompt: string,
  opts: OROptions = {}
): Promise<string> {
  const msgs = buildMessages(opts.system, prompt);
  const chain = [model as string, ...FREE_CHAIN.filter(m => m !== model)];

  let lastErr: Error | undefined;
  for (const m of chain) {
    try {
      return await callOnce(m, msgs, opts);
    } catch (err) {
      lastErr = err instanceof Error ? err : new Error(String(err));
      if (!shouldTryNextModel(lastErr)) throw lastErr;
      // 404 = endpoint unavailable, 429 = rate-limited — try next model
    }
  }
  throw lastErr ?? new Error("All OpenRouter free models are currently unavailable");
}

// ─── Public: streaming with chain fallback — yields content delta strings ──────

export async function* orStream(
  model: ORModel,
  prompt: string,
  opts: OROptions = {}
): AsyncGenerator<string> {
  const msgs = buildMessages(opts.system, prompt);
  const timeout = opts.timeout ?? 50_000;
  const chain = [model as string, ...FREE_CHAIN.filter(m => m !== model)];

  for (const m of chain) {
    const reqBody = body(m, msgs, opts, true);

    let res: Response;
    try {
      res = await fetchWithTimeout(
        `${BASE_URL}/chat/completions`,
        { method: "POST", headers: headers(), body: JSON.stringify(reqBody) },
        timeout
      );
    } catch {
      continue; // network error — try next
    }

    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      if (FALLBACK_ON.has(res.status) || res.status === 429) continue; // endpoint down or rate-limited — try next
      throw new Error(`OpenRouter stream ${res.status}: ${txt.slice(0, 300)}`);
    }

    // Stream from this model
    yield* readSSEStream(res);
    return;
  }

  throw new Error("All OpenRouter free models are currently unavailable for streaming");
}

async function* readSSEStream(res: Response): AsyncGenerator<string> {
  const reader = res.body!.getReader();
  const dec = new TextDecoder();
  let buf = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buf += dec.decode(value, { stream: true });
      const lines = buf.split("\n");
      buf = lines.pop() ?? "";

      for (const line of lines) {
        const t = line.trim();
        if (!t.startsWith("data:")) continue;
        const raw = t.slice(5).trim();
        if (raw === "[DONE]") return;
        try {
          type Delta = { choices?: { delta?: { content?: string } }[] };
          const parsed = JSON.parse(raw) as Delta;
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) yield content;
        } catch {
          /* skip malformed chunk */
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}
