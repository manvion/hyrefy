/**
 * PII redaction for resume text before it leaves the application to AI providers.
 *
 * Replaces personal identifiers with stable tokens ([NAME], [EMAIL1], etc.).
 * The returned `restore` function swaps tokens back in any AI output string.
 *
 * Redacted fields:
 *   - Candidate name (first non-empty line that looks like a name)
 *   - Email addresses
 *   - Phone numbers (North American + international)
 *   - LinkedIn profile URLs
 *   - GitHub profile URLs
 *   - Other URLs (personal site, portfolio)
 *   - Street addresses (number + street pattern)
 */

export interface Redacted {
  text: string;
  /** Call this on any AI output to swap tokens back to real values. */
  restore: (aiOutput: string) => string;
}

export function redactPII(resumeText: string): Redacted {
  const map: Record<string, string> = {};
  let n = 0;

  const ph = (prefix: string, original: string): string => {
    // Reuse the same token if the same value appears multiple times
    const existing = Object.entries(map).find(([, v]) => v === original);
    if (existing) return existing[0];
    const key = `[${prefix}${n++ > 0 ? n : ""}]`;
    map[key] = original;
    return key;
  };

  let text = resumeText;

  // ── Email addresses ──────────────────────────────────────────────────────────
  text = text.replace(
    /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g,
    m => ph("EMAIL", m)
  );

  // ── LinkedIn profile URLs ────────────────────────────────────────────────────
  text = text.replace(
    /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[^\s,|<>()\[\]"']+/gi,
    m => ph("LINKEDIN", m.replace(/\/$/, ""))
  );

  // ── GitHub profile URLs ──────────────────────────────────────────────────────
  text = text.replace(
    /(?:https?:\/\/)?(?:www\.)?github\.com\/[^\s,|<>()\[\]"']+/gi,
    m => ph("GITHUB", m.replace(/\/$/, ""))
  );

  // ── Other URLs (portfolio, personal site) ───────────────────────────────────
  text = text.replace(
    /https?:\/\/[^\s,|<>()\[\]"']+/gi,
    m => ph("URL", m.replace(/\/$/, ""))
  );

  // ── Phone numbers ────────────────────────────────────────────────────────────
  // Matches: +1 (555) 123-4567  |  555.123.4567  |  +44 7911 123456  etc.
  text = text.replace(
    /(?:\+?\d{1,3}[\s\-.]?)?\(?\d{3}\)?[\s\-.]?\d{3}[\s\-.]?\d{4,6}/g,
    m => {
      const digits = m.replace(/\D/g, "");
      return digits.length >= 10 && digits.length <= 15 ? ph("PHONE", m) : m;
    }
  );

  // ── Street addresses (e.g. "123 Main Street", "45 Rue de la Paix") ───────────
  text = text.replace(
    /\b\d{1,5}\s+[A-Za-z][A-Za-z0-9\s,.\-]{5,60}(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Lane|Ln|Court|Ct|Way|Place|Pl|Rue|Avenue)\b\.?/gi,
    m => ph("ADDRESS", m)
  );

  // ── Candidate name (first non-empty line that looks like a personal name) ────
  const lines = text.split("\n");
  const firstIdx = lines.findIndex(l => l.trim().length > 1);
  if (firstIdx !== -1) {
    const candidate = lines[firstIdx].trim();
    const words = candidate.split(/\s+/);
    const looksLikeName =
      words.length >= 2 &&
      words.length <= 5 &&
      /^[A-Za-zÀ-ÖØ-öø-ÿ'\-\s]{2,60}$/.test(candidate) &&
      // not an ALL-CAPS section header like "WORK EXPERIENCE"
      !(candidate === candidate.toUpperCase() && words.length > 2);

    if (looksLikeName) {
      const key = ph("NAME", candidate);
      lines[firstIdx] = lines[firstIdx].replace(candidate, key);
      text = lines.join("\n");
    }
  }

  const restore = (output: string): string =>
    Object.entries(map).reduce((s, [token, value]) => s.split(token).join(value), output);

  return { text, restore };
}
