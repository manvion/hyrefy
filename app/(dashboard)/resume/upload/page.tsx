export const dynamic = "force-dynamic";

import { Metadata } from "next";
import { getAuthUserId } from "@/lib/utils/auth";
import { db } from "@/lib/db";
import { MyResumePage } from "@/components/resume/my-resume-page";

export const metadata: Metadata = { title: "My Master Resume | Hyrefy" };

export default async function UploadPage() {
  const userId = await getAuthUserId();

  let existingResume: {
    id: string;
    fileName: string;
    rawText: string;
    createdAt: Date;
    updatedAt: Date;
  } | null = null;
  let isPremium = false;

  if (userId) {
    try {
      const user = await db.user.findUnique({
        where: { clerkId: userId },
        include: { subscription: true },
      });
      if (user) {
        isPremium = user.subscription?.status === "PREMIUM";
        const resume = await db.resume.findFirst({
          where: { userId: user.id },
          orderBy: [{ isMaster: "desc" }, { updatedAt: "desc" }],
          select: { id: true, fileName: true, rawText: true, createdAt: true, updatedAt: true },
        });
        if (resume && resume.rawText && resume.rawText.trim().length > 0) {
          existingResume = { ...resume, rawText: resume.rawText };
        }
      }
    } catch (e) {
      console.error("[UploadPage] resume fetch error:", e);
    }
  }

  return <MyResumePage existingResume={existingResume} isPremium={isPremium} />;
}
