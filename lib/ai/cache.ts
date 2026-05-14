/**
 * In-memory LRU-style cache with TTL.
 * Used for: job description analysis, ATS scores on identical inputs.
 * No external dependency — plain Map.
 */

import { createHash } from "crypto";

interface Entry {
  value: string;
  expiry: number;
}

// Module-level store — persists for the lifetime of the Node.js process
const store = new Map<string, Entry>();

const MAX_ENTRIES = 400;
const DEFAULT_TTL = 10 * 60 * 1000; // 10 minutes

function evict() {
  if (store.size < MAX_ENTRIES) return;
  const now = Date.now();
  // Remove expired entries first
  for (const [k, v] of store) {
    if (v.expiry < now) store.delete(k);
  }
  // Still over limit — evict oldest (insertion order)
  if (store.size >= MAX_ENTRIES) {
    const [oldest] = store.keys();
    store.delete(oldest);
  }
}

export function cacheGet(key: string): string | null {
  const entry = store.get(key);
  if (!entry) return null;
  if (entry.expiry < Date.now()) {
    store.delete(key);
    return null;
  }
  return entry.value;
}

export function cacheSet(key: string, value: string, ttlMs = DEFAULT_TTL): void {
  evict();
  store.set(key, { value, expiry: Date.now() + ttlMs });
}

/**
 * Deterministic cache key from any number of string parts.
 * Uses SHA-256 so keys are always a fixed, safe length.
 */
export function makeCacheKey(...parts: string[]): string {
  return createHash("sha256").update(parts.join("\x00")).digest("hex");
}
