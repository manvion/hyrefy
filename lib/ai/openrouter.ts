/**
 * OpenRouter AI client — model routing, streaming, retry, and fallback.
 * Uses fetch directly; no SDK dependency.
 */

const BASE_URL = "https://openrouter.ai/api/v1";

// ─── Model registry ────────────────────────────────────────────────────────────
export const OR_MODELS = {
  /** Fast chat — resume writing, cover letters, bullet improvements, summaries */
  RESUME:  "deepseek/deepseek-chat-v3-0324:free",
  /** Large MoE — ATS scoring, keyword analysis, semantic matching */
  ATS:     "qwen/qwen3-235b-a22b:free",
  /** Multimodal — resume parsing, structured extraction */
  PARSER:  "meta-llama/llama-4-maverick:free",
  /** Reasoning — candidate ranking, advanced comparisons */
  RANKING: "deepseek/deepseek-r1:free",
  /** Fast fallback — any task, always available */
  FALLBACK: "meta-llama/llama-3.1-8b-instruct:free",
} as const;

export type ORModel = (typeof OR_MODELS)[keyof typeof OR_MODELS];

export interface OROptions {
  system?: string;
  maxTokens?: number;
  temperature?: number;
  /** Abort after this many ms (default: 45 000) */
  timeout?: number;
  /** Disable chain-of-thought on qwen3 / deepseek-r1 for speed (default: false = disabled) */
  thinking?: boolean;
}

// ─── Internal helpers ──────────────────────────────────────────────────────────

const MAX_RETRIES = 2;
const RETRY_ON = new Set([429, 502, 503, 524]);

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
  const b: Record<string, unknown> = {
    model,
    messages,
    max_tokens: opts.maxTokens ?? 4096,
    temperature: opts.temperature ?? 0.7,
    stream,
  };
  // Disable CoT on qwen3 unless explicitly requested — speeds up response
  if (model.includes("qwen3") && !opts.thinking) {
    b.thinking = { type: "disabled" };
  }
  return b;
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
    if (RETRY_ON.has(res.status) && attempt < MAX_RETRIES) {
      await sleep(Math.pow(2, attempt) * 800);
      return callOnce(model, msgs, opts, attempt + 1);
    }
    const txt = await res.text().catch(() => "");
    throw new Error(`OpenRouter ${res.status}: ${txt.slice(0, 300)}`);
  }

  type ORResponse = { choices?: { message?: { content?: string } }[] };
  const data = (await res.json()) as ORResponse;
  return data.choices?.[0]?.message?.content ?? "";
}

// ─── Public: non-streaming with automatic fallback ────────────────────────────

export async function orGenerate(
  model: ORModel,
  prompt: string,
  opts: OROptions = {}
): Promise<string> {
  const msgs = buildMessages(opts.system, prompt);
  try {
    return await callOnce(model, msgs, opts);
  } catch (primaryErr) {
    if (model === OR_MODELS.FALLBACK) throw primaryErr;
    // Try fallback model once
    try {
      return await callOnce(OR_MODELS.FALLBACK, msgs, { ...opts, timeout: 30_000 }, 0);
    } catch {
      throw primaryErr; // surface original error
    }
  }
}

// ─── Public: streaming — yields content delta strings ─────────────────────────

export async function* orStream(
  model: ORModel,
  prompt: string,
  opts: OROptions = {}
): AsyncGenerator<string> {
  const msgs = buildMessages(opts.system, prompt);
  const timeout = opts.timeout ?? 50_000;
  const reqBody = body(model, msgs, opts, true);

  const res = await fetchWithTimeout(
    `${BASE_URL}/chat/completions`,
    { method: "POST", headers: headers(), body: JSON.stringify(reqBody) },
    timeout
  );

  if (!res.ok) {
    // On stream failure, fall back to non-streaming and yield full text at once
    if (model !== OR_MODELS.FALLBACK) {
      const fallback = await orGenerate(OR_MODELS.FALLBACK, prompt, opts);
      yield fallback;
      return;
    }
    const txt = await res.text().catch(() => "");
    throw new Error(`OpenRouter stream ${res.status}: ${txt.slice(0, 300)}`);
  }

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
