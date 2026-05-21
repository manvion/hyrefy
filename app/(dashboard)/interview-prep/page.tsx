export const dynamic = "force-dynamic";

import { InterviewPrepClient } from "@/components/interview/interview-prep-client";
import { Mic } from "lucide-react";
import { getAuthUserId } from "@/lib/utils/auth";
import { db } from "@/lib/db";

export const metadata = { title: "Interview Prep | Hyrefy" };

export default async function InterviewPrepPage() {
  const clerkId = await getAuthUserId();
  const dbc = db as any;

  let isPremium = false;
  let prepsUsed = 0;
  let prepsLimit = 1;
  let masterResumeText = "";

  if (clerkId) {
    try {
      const user = await db.user.findUnique({
        where: { clerkId },
        include: { subscription: true },
      });
      if (user) {
        isPremium = user.subscription?.status === "PREMIUM";
        prepsLimit = user.subscription?.interviewPrepsLimit ?? 1;
        if (!isPremium) {
          const now = new Date();
          const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
          prepsUsed = await dbc.interviewPrep.count({
            where: { userId: user.id, createdAt: { gte: monthStart } },
          });
        }

        const resume = await db.resume.findFirst({
          where: { userId: user.id },
          orderBy: [{ isMaster: "desc" }, { updatedAt: "desc" }],
          select: { rawText: true },
        });
        if (resume?.rawText) masterResumeText = resume.rawText;
      }
    } catch {
      // non-fatal
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Mic className="h-4 w-4 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">AI Interview Prep</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Get 10 personalized interview questions with model answers based on your resume and target role.
        </p>
      </div>
      <InterviewPrepClient
        isPremium={isPremium}
        prepsUsed={prepsUsed}
        prepsLimit={prepsLimit}
        masterResumeText={masterResumeText}
      />
    </div>
  );
}
