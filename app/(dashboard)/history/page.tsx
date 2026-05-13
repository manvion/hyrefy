import { redirect } from "next/navigation";
import Link from "next/link";
import { getAuthUserId } from "@/lib/utils/auth";
import { db } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, Clock, Globe, FileText, TrendingUp } from "lucide-react";
import { SUPPORTED_COUNTRIES } from "@/lib/ai/countries";
import { HistoryDownloadButtons } from "@/components/history/download-buttons";

const SIX_MONTHS_AGO = new Date();
SIX_MONTHS_AGO.setMonth(SIX_MONTHS_AGO.getMonth() - 6);

export default async function HistoryPage() {
  const userId = await getAuthUserId();
  if (!userId) redirect("/sign-in");

  let scans: any[] = [];

  try {
    const user = await db.user.findUnique({ where: { clerkId: userId } });
    if (user) {
      scans = await db.resumeScan.findMany({
        where: {
          userId: user.id,
          createdAt: { gte: SIX_MONTHS_AGO },
        },
        orderBy: { createdAt: "desc" },
      });
    }
  } catch {
    // DB not available
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Generation History</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {scans.length} resume{scans.length !== 1 ? "s" : ""} generated in the last 6 months — download anytime
          </p>
        </div>
        <Button asChild variant="gradient">
          <Link href="/generate">
            <Sparkles className="mr-2 h-4 w-4" />
            New Generation
          </Link>
        </Button>
      </div>

      {scans.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-5">
          <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center">
            <FileText className="h-7 w-7 text-muted-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-semibold mb-1">No generations yet</h2>
            <p className="text-muted-foreground text-sm max-w-sm">
              Generate your first tailored resume and cover letter to get started.
            </p>
          </div>
          <Button asChild variant="gradient">
            <Link href="/generate">
              <Sparkles className="mr-2 h-4 w-4" />
              Generate Now
            </Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {scans.map((scan) => {
            const country = SUPPORTED_COUNTRIES[scan.jobCountry as keyof typeof SUPPORTED_COUNTRIES];
            const aiResults = scan.aiResults as any;
            const lang = aiResults?.outputLanguage === "fr" ? "FR" : "EN";
            const scoreBefore = aiResults?.atsScoreBefore ?? null;
            const scoreAfter = scan.atsScore ?? aiResults?.atsScoreAfter ?? null;
            const hasCoverLetter = !!(aiResults?.coverLetter);

            return (
              <Card key={scan.id} className="border-border/50 bg-card/30 hover:bg-card/50 transition-all">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 text-lg">
                        {country?.flag ?? "🌍"}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold truncate">{scan.jobTitle}</p>
                        {scan.company && (
                          <p className="text-sm text-muted-foreground truncate">{scan.company}</p>
                        )}
                        <div className="flex items-center gap-3 mt-2 flex-wrap">
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {new Date(scan.createdAt).toLocaleDateString("en-CA", { year: "numeric", month: "short", day: "numeric" })}
                          </span>
                          {country && (
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Globe className="h-3 w-3" />
                              {country.name}
                            </span>
                          )}
                          <Badge variant="secondary" className="text-[10px] px-2 py-0.5 h-auto">{lang}</Badge>
                          {hasCoverLetter && (
                            <Badge variant="outline" className="text-[10px] px-2 py-0.5 h-auto text-primary border-primary/30">
                              + Cover Letter
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0 flex-wrap">
                      {scoreBefore !== null && scoreAfter !== null && (
                        <div className="text-right hidden sm:block">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-0.5">
                            <span>{scoreBefore}%</span>
                            <TrendingUp className="h-3 w-3 text-primary" />
                            <span className="font-bold text-emerald-400">{scoreAfter}%</span>
                          </div>
                          <p className="text-[10px] text-muted-foreground">ATS Score</p>
                        </div>
                      )}
                      <HistoryDownloadButtons
                        jobTitle={scan.jobTitle}
                        company={scan.company}
                        tailoredResume={aiResults?.tailoredResume ?? null}
                        coverLetter={aiResults?.coverLetter ?? null}
                        lang={lang}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
