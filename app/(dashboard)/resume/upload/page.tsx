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

  if (userId) {
    try {
      const user = await db.user.findUnique({ where: { clerkId: userId } });
      if (user) {
        const master = await (db as any).resume.findFirst({
          where: { userId: user.id, isMaster: true },
          orderBy: { updatedAt: "desc" },
          select: { id: true, fileName: true, rawText: true, createdAt: true, updatedAt: true },
        });
        if (master) {
          existingResume = master;
        } else {
          const any = await (db as any).resume.findFirst({
            where: { userId: user.id },
            orderBy: { updatedAt: "desc" },
            select: { id: true, fileName: true, rawText: true, createdAt: true, updatedAt: true },
          });
          if (any) existingResume = any;
        }
      }
    } catch {
      // DB not configured
    }
  }

  return <MyResumePage existingResume={existingResume} />;
}
