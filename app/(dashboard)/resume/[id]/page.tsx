import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAuthUserId } from "@/lib/utils/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, ArrowLeft, BarChart3, Clock } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = { title: "Resume Details" };

export default async function ResumeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = await getAuthUserId();
  if (!userId) redirect("/sign-in");

  const user = await db.user.findUnique({ where: { clerkId: userId } });
  if (!user) redirect("/dashboard");

  const resume = await db.resume.findFirst({
    where: { id, userId: user.id },
    include: { scans: { orderBy: { createdAt: "desc" }, take: 10 } },
  });

  if (!resume) redirect("/resume/history");

  const parsedData = resume.parsedData as Record<string, unknown> | null;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="sm">
          <Link href="/resume/history">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-bold truncate">{resume.fileName}</h1>
          <p className="text-sm text-muted-foreground flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            Uploaded {new Date(resume.createdAt).toLocaleDateString()}
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href={`/analyze?resumeId=${resume.id}`}>
            <BarChart3 className="mr-2 h-4 w-4" />
            Analyze
          </Link>
        </Button>
      </div>

      {parsedData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Skills */}
          {Array.isArray(parsedData.skills) && parsedData.skills.length > 0 && (
            <Card className="border-border/50 bg-card/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Skills ({(parsedData.skills as string[]).length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1.5">
                  {(parsedData.skills as string[]).slice(0, 30).map((skill) => (
                    <Badge key={skill} variant="secondary" className="text-xs">{skill}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Experience */}
          {Array.isArray(parsedData.experience) && (parsedData.experience as { company: string; title: string; duration: string }[]).length > 0 && (
            <Card className="border-border/50 bg-card/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Experience</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {(parsedData.experience as { company: string; title: string; duration: string }[]).map((exp, i) => (
                  <div key={i} className="text-sm">
                    <p className="font-medium">{exp.title}</p>
                    <p className="text-muted-foreground text-xs">{exp.company} · {exp.duration}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Scan history */}
      {resume.scans.length > 0 && (
        <div>
          <h2 className="text-base font-semibold mb-3">Scan History</h2>
          <div className="space-y-3">
            {resume.scans.map((scan) => (
              <Card key={scan.id} className="border-border/50 bg-card/30">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{scan.jobTitle || "Resume Analysis"}</p>
                    <p className="text-xs text-muted-foreground">{new Date(scan.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-lg font-bold">{scan.atsScore}%</p>
                    <Badge variant={scan.atsScore >= 80 ? "success" : scan.atsScore >= 60 ? "warning" : "destructive"}>
                      {scan.atsScore >= 80 ? "Great" : scan.atsScore >= 60 ? "Good" : "Low"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
