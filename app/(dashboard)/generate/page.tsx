export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import Link from "next/link";
import { getAuthUserId } from "@/lib/utils/auth";
import { db } from "@/lib/db";
import { GenerateClient } from "@/components/generate/generate-client";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { isDemoMode } from "@/lib/utils/demo-mode";

const DEMO_RESUME = `JANE SMITH
jane.smith@email.com | LinkedIn: linkedin.com/in/janesmith | Toronto, ON

SUMMARY
Results-driven software engineer with 5+ years of experience building scalable web applications. Proficient in React, Node.js, TypeScript, and cloud infrastructure. Passionate about delivering high-quality user experiences and collaborating with cross-functional teams.

EXPERIENCE

Senior Software Engineer — Acme Corp, Toronto (2021–Present)
• Led development of customer-facing dashboard serving 50,000+ monthly active users
• Reduced page load time by 40% through code splitting and lazy loading optimizations
• Mentored 3 junior developers and conducted bi-weekly code reviews
• Architected microservices migration from monolith, improving deployment frequency by 3x

Software Engineer — TechStartup Inc, Toronto (2019–2021)
• Built RESTful APIs handling 1M+ daily requests using Node.js and PostgreSQL
• Implemented automated testing suite increasing code coverage from 45% to 87%
• Collaborated with product team to ship 12 features on schedule

EDUCATION
B.Sc. Computer Science — University of Toronto, 2019

SKILLS
Languages: TypeScript, JavaScript, Python, SQL
Frontend: React, Next.js, Tailwind CSS
Backend: Node.js, Express, PostgreSQL, Redis
Cloud: AWS (EC2, S3, Lambda), Docker, CI/CD`;

export default async function GeneratePage() {
  const userId = await getAuthUserId();
  if (!userId) redirect("/sign-in");

  let masterResumeText = isDemoMode ? DEMO_RESUME : "";
  let masterResumeId: string | undefined;
  let scansUsed = 0;
  let scansLimit = 2;
  let isPremium = false;

  if (!isDemoMode) {
    try {
      const user = await db.user.findUnique({
        where: { clerkId: userId },
        include: { subscription: true },
      });
      if (user) {
        const master = await (db as any).resume.findFirst({
          where: { userId: user.id, isMaster: true },
          orderBy: { createdAt: "desc" },
        });
        if (!master) {
          const any = await (db as any).resume.findFirst({
            where: { userId: user.id },
            orderBy: { createdAt: "desc" },
          });
          if (any) { masterResumeText = any.rawText || ""; masterResumeId = any.id; }
        } else {
          masterResumeText = master.rawText || "";
          masterResumeId = master.id;
        }

        if (user.subscription) {
          isPremium = user.subscription.status === "PREMIUM";
          scansUsed = user.subscription.scansUsed;
          scansLimit = isPremium ? 9999 : 2;
        }
      }
    } catch { /* DB not configured */ }
  }

  if (!masterResumeText) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 max-w-md mx-auto">
        <div className="h-16 w-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
          <Upload className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold mb-2">Upload your resume first</h1>
          <p className="text-muted-foreground">
            Upload your resume once — we&apos;ll tailor it to every job you apply for.
          </p>
        </div>
        <Button asChild variant="gradient" size="lg">
          <Link href="/resume/upload">
            <Upload className="mr-2 h-4 w-4" />
            Upload Master Resume
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <GenerateClient
      masterResumeText={masterResumeText}
      masterResumeId={masterResumeId}
      defaultCountry="CA"
      scansUsed={scansUsed}
      scansLimit={scansLimit}
      isPremium={isPremium}
    />
  );
}
