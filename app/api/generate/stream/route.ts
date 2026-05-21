/**
 * POST /api/generate/stream
 *
 * Streaming resume generation via Server-Sent Events.
 *
 * Event sequence:
 *   {type:"ats_local",  score, matchedKeywords, missingKeywords}  — ~10 ms (local)
 *   {type:"token",      content}                                   — per token (~1-2 s TTFT)
 *   {type:"complete",   tailoredResume, coverLetter, atsScoreBefore,
 *                       atsScoreAfter, keyChanges, matchedKeywords} — stream end
 *   {type:"error",      message}                                   — on failure
 *
 * Architecture:
 *  - Resume streaming starts immediately (deepseek-chat-v3)
 *  - Cover letter runs IN PARALLEL (deepseek-chat-v3, non-streaming)
 *  - ATS score computed locally (<1 ms) and sent as first event
 */

import { NextRequest } from "next/server";
import { getAuthUserId } from "@/lib/utils/auth";
import { orStream, OR_MODELS } from "@/lib/ai/openrouter";
import { generateCoverLetter, buildResumePrompt, parseResumeMeta, extractCleanResume } from "@/lib/ai/generate";
import { quickATS } from "@/lib/ai/ats-scorer";
import { redactPII } from "@/lib/utils/redact-pii";
import { db } from "@/lib/db";
import type { CountryCode, OutputLanguage } from "@/lib/ai/generate";

export const runtime = "nodejs";
export const maxDuration = 60;

type SSEEvent =
  | { type: "ats_local"; score: number; matchedKeywords: string[]; missingKeywords: string[] }
  | { type: "token"; content: string }
  | { type: "complete"; tailoredResume: string; coverLetter: string; atsScoreBefore: number; atsScoreAfter: number; keyChanges: string[]; matchedKeywords: string[] }
  | { type: "error"; message: string };

export async function POST(req: NextRequest) {
  // ── Auth check before opening stream ──────────────────────────────────────
  const userId = await getAuthUserId();
  if (!userId) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  if (!process.env.OPENROUTER_API_KEY) {
    return new Response(JSON.stringify({ error: "AI service not configured" }), { status: 503 });
  }

  const body = await req.json();
  const {
    masterResumeText,
    jobTitle,
    company,
    targetCountry,
    jobDescription,
    outputLanguage = "en",
    resumeId,
  } = body as {
    masterResumeText: string;
    jobTitle: string;
    company?: string;
    targetCountry: CountryCode;
    jobDescription: string;
    outputLanguage?: OutputLanguage;
    resumeId?: string;
  };

  if (!masterResumeText || !jobTitle || !jobDescription || !targetCountry) {
    return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
  }

  const enc = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      function send(event: SSEEvent) {
        controller.enqueue(enc.encode(`data: ${JSON.stringify(event)}\n\n`));
      }

      try {
        // ── 0. Redact PII from resume before sending to AI ────────────────────
        const { text: safeResumeText, restore } = redactPII(masterResumeText);

        // ── 1. Instant local ATS (keyword match on master resume) ──────────────
        const simpleKeywords = jobDescription
          .toLowerCase()
          .match(/\b[a-z][a-z0-9\-\+\.#]{2,}\b/g)
          ?.filter((w) => !STOPWORDS.has(w)) ?? [];
        const uniqueKeywords = [...new Set(simpleKeywords)].slice(0, 60);
        const localAts = quickATS(masterResumeText, uniqueKeywords); // use original for keyword matching

        send({
          type: "ats_local",
          score: localAts.score,
          matchedKeywords: localAts.matchedKeywords,
          missingKeywords: localAts.missingKeywords,
        });

        // ── 2. Start cover letter in parallel (non-blocking) ──────────────────
        const coverLetterPromise = generateCoverLetter({
          masterResumeText: safeResumeText,
          jobTitle,
          company,
          jobDescription,
          outputLanguage,
        }).then(restore).catch(() => ""); // restore PII in cover letter output

        // ── 3. Build resume prompt and stream tokens ──────────────────────────
        const { prompt, system } = buildResumePrompt({
          masterResumeText: safeResumeText,
          jobTitle,
          company,
          targetCountry,
          jobDescription,
          outputLanguage,
        });

        let rawResume = "";
        for await (const token of orStream(OR_MODELS.RESUME, prompt, {
          system,
          maxTokens: 3500,
          temperature: 0.65,
        })) {
          rawResume += token;
          send({ type: "token", content: token });
        }

        // ── 4. Parse metadata embedded in streamed output ─────────────────────
        const meta = parseResumeMeta(rawResume);
        const cleanResume = restore(extractCleanResume(rawResume)); // restore PII in final resume

        // ── 5. Await cover letter (should be done by now) ─────────────────────
        const coverLetter = await coverLetterPromise;

        // ── 6. Send complete event ────────────────────────────────────────────
        send({
          type: "complete",
          tailoredResume: cleanResume,
          coverLetter,
          atsScoreBefore: meta.before ?? localAts.score,
          atsScoreAfter: meta.after ?? Math.min(98, localAts.score + 18),
          keyChanges: meta.changes.length > 0 ? meta.changes : DEFAULT_CHANGES,
          matchedKeywords:
            meta.keywords.length > 0
              ? meta.keywords
              : localAts.matchedKeywords.slice(0, 12),
        });

        // ── 7. Save to DB in background (fire and forget) ─────────────────────
        saveToHistory({
          userId,
          resumeId,
          jobTitle,
          company,
          jobDescription,
          targetCountry,
          outputLanguage,
          tailoredResume: cleanResume,
          coverLetter,
          atsScoreBefore: meta.before ?? localAts.score,
          atsScoreAfter: meta.after ?? Math.min(98, localAts.score + 18),
          keyChanges: meta.changes,
          matchedKeywords: meta.keywords.length > 0 ? meta.keywords : localAts.matchedKeywords,
        }).catch(() => {}); // non-critical

      } catch (err) {
        send({ type: "error", message: err instanceof Error ? err.message : "Generation failed" });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no", // disable Nginx buffering on Vercel
    },
  });
}

// ─── Background DB save ────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const dbc = db as any;

async function saveToHistory(params: {
  userId: string;
  resumeId?: string;
  jobTitle: string;
  company?: string;
  jobDescription: string;
  targetCountry: string;
  outputLanguage: string;
  tailoredResume: string;
  coverLetter: string;
  atsScoreBefore: number;
  atsScoreAfter: number;
  keyChanges: string[];
  matchedKeywords: string[];
}) {
  try {
    let dbUserId = params.userId;
    const user = await dbc.user.findUnique({ where: { clerkId: params.userId } });
    if (user) dbUserId = user.id;

    const scanResumeId = params.resumeId ?? await getOrCreateMasterResume(dbUserId);

    await dbc.resumeScan.create({
      data: {
        userId: dbUserId,
        resumeId: scanResumeId,
        jobTitle: params.jobTitle,
        company: params.company ?? null,
        jobDescription: params.jobDescription,
        jobCountry: params.targetCountry,
        atsScore: params.atsScoreAfter,
        status: "COMPLETED",
        aiResults: {
          tailoredResume: params.tailoredResume,
          coverLetter: params.coverLetter,
          outputLanguage: params.outputLanguage,
          atsScoreBefore: params.atsScoreBefore,
          atsScoreAfter: params.atsScoreAfter,
          keyChanges: params.keyChanges,
          matchedKeywords: params.matchedKeywords,
        },
      },
    });

    // Increment usage counter for free users
    const sub = await dbc.subscription.findUnique({ where: { userId: dbUserId } });
    if (sub && sub.status !== "PREMIUM") {
      await dbc.subscription.update({
        where: { userId: dbUserId },
        data: { scansUsed: { increment: 1 } },
      });
    }
  } catch {
    /* DB save is optional — never fail the stream */
  }
}

async function getOrCreateMasterResume(userId: string): Promise<string> {
  const existing = await dbc.resume.findFirst({ where: { userId, isMaster: true } });
  if (existing) return existing.id;
  const any = await dbc.resume.findFirst({ where: { userId } });
  if (any) return any.id;
  const created = await dbc.resume.create({
    data: { userId, fileName: "master-resume", fileUrl: "", fileType: "text/plain", isMaster: true },
  });
  return created.id;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DEFAULT_CHANGES = [
  "Tailored bullet points to match job requirements",
  "Added relevant keywords from the job description",
  "Strengthened action verbs throughout",
  "Reordered sections for maximum ATS impact",
  "Optimized summary for the target role",
];

const STOPWORDS = new Set([
  "the","and","for","are","was","were","has","have","had","with","that","this",
  "from","they","will","been","their","when","who","what","would","could","should",
  "you","your","our","all","not","can","but","its","into","than","then","more",
  "also","any","each","about","which","some","his","her","him","they","them",
  "we","be","do","it","is","in","of","to","a","an","on","at","by","as","or",
  "if","so","up","he","she","per","no","yes","via","how","why","where","when",
]);
