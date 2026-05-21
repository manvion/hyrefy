import { NextRequest } from "next/server";
import { getAuthUserId } from "@/lib/utils/auth";
import { streamInterviewPrep } from "@/lib/ai/interview-prep";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const maxDuration = 60;

const dbc = db as any;

export async function POST(req: NextRequest) {
  const clerkId = await getAuthUserId();
  if (!clerkId) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

  const body = await req.json();
  const { jobTitle, company, jobDescription, industry, level, resumeText } = body;

  if (!jobTitle) return new Response(JSON.stringify({ error: "Job title required" }), { status: 400 });

  const user = await db.user.findUnique({ where: { clerkId }, include: { subscription: true } });
  if (!user) return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });

  const isPremium = user.subscription?.status === "PREMIUM";
  if (!isPremium) {
    const limit = user.subscription?.interviewPrepsLimit ?? 1;
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonthCount = await dbc.interviewPrep.count({
      where: { userId: user.id, createdAt: { gte: monthStart } },
    });
    if (thisMonthCount >= limit) {
      return new Response(
        JSON.stringify({ error: "Monthly limit reached. Upgrade to Premium for unlimited access.", used: thisMonthCount, limit }),
        { status: 403 }
      );
    }
  }

  const enc = new TextEncoder();
  const questions: object[] = [];

  const stream = new ReadableStream({
    async start(controller) {
      function send(event: object) {
        controller.enqueue(enc.encode(`data: ${JSON.stringify(event)}\n\n`));
      }

      try {
        for await (const event of streamInterviewPrep({ jobTitle, company, jobDescription, industry, level, resumeText })) {
          send(event);
          if (event.type === "question") questions.push(event.question);
        }

        // Save to DB (fire-and-forget)
        if (questions.length > 0) {
          dbc.interviewPrep.create({
            data: {
              userId: user.id,
              jobTitle,
              company: company || null,
              jobDescription: jobDescription || null,
              industry: industry || null,
              level: level || null,
              questions: JSON.parse(JSON.stringify(questions)),
            },
          }).catch(() => {});
        }
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
      "X-Accel-Buffering": "no",
    },
  });
}
