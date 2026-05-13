import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAuthUserId } from "@/lib/utils/auth";
import Link from "next/link";
import { db } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Clock, BarChart3, Upload, ArrowRight } from "lucide-react";

export const metadata: Metadata = { title: "My Resumes" };

export default async function ResumeHistoryPage() {
  const userId = await getAuthUserId();
  if (!userId) redirect("/sign-in");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let resumes: any[] = [];
  try {
    const user = await db.user.findUnique({ where: { clerkId: userId } });
    if (!user) return redirect("/dashboard");
    resumes = await db.resume.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: { scans: { orderBy: { createdAt: "desc" }, take: 1 } },
    });
  } catch {
    // DB not configured — show empty state
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Resumes</h1>
          <p className="text-muted-foreground mt-1">{resumes.length} resume{resumes.length !== 1 ? "s" : ""} uploaded</p>
        </div>
        <Button asChild variant="gradient">
          <Link href="/resume/upload">
            <Upload className="mr-2 h-4 w-4" /> Upload New
          </Link>
        </Button>
      </div>

      {resumes.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border border-dashed border-border/50">
          <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No resumes yet</h3>
          <p className="text-muted-foreground text-sm mb-6">Upload your first resume to get started</p>
          <Button asChild variant="gradient">
            <Link href="/resume/upload"><Upload className="mr-2 h-4 w-4" />Upload Resume</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {resumes.map((resume) => {
            const latestScan = resume.scans[0];
            return (
              <Link key={resume.id} href={`/resume/${resume.id}`}>
                <Card className="border-border/50 bg-card/30 hover:bg-card/60 transition-all duration-200 cursor-pointer group">
                  <CardContent className="p-5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{resume.fileName}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                          <Clock className="h-3 w-3" />
                          {new Date(resume.createdAt).toLocaleDateString()} ·{" "}
                          {resume.fileType.includes("pdf") ? "PDF" : "DOCX"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {latestScan ? (
                        <div className="text-right hidden sm:block">
                          <p className="text-sm font-bold">{latestScan.atsScore}%</p>
                          <p className="text-xs text-muted-foreground">Last ATS score</p>
                        </div>
                      ) : (
                        <Badge variant="secondary" className="hidden sm:flex">Not analyzed</Badge>
                      )}
                      <Button asChild variant="outline" size="sm" onClick={(e) => e.preventDefault()}>
                        <Link href={`/analyze?resumeId=${resume.id}`}>
                          <BarChart3 className="mr-1.5 h-3.5 w-3.5" />Analyze
                        </Link>
                      </Button>
                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
