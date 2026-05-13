"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/toaster";
import {
  Loader2, Search, Target, AlertTriangle,
  CheckCircle, ChevronRight, Wand2, ArrowRight, TrendingUp, Mail
} from "lucide-react";
import Link from "next/link";
import type { ATSScore, JobAnalysis } from "@/types";
import { CoverLetterClient } from "@/components/resume/cover-letter-client";

interface ScanResult {
  scanId: string;
  atsScore: ATSScore;
  jobAnalysis: JobAnalysis;
}

function ScoreRing({ score, size = 120 }: { score: number; size?: number }) {
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const dash = (score / 100) * circumference;

  const color =
    score >= 80 ? "hsl(143, 71%, 45%)" : score >= 60 ? "hsl(43, 96%, 56%)" : "hsl(0, 72%, 51%)";

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="hsl(var(--muted))" strokeWidth="8"
        />
        <motion.circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={color} strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference}`}
          initial={{ strokeDasharray: `0 ${circumference}` }}
          animate={{ strokeDasharray: `${dash} ${circumference}` }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="text-3xl font-bold"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          {score}
        </motion.span>
        <span className="text-xs text-muted-foreground">/ 100</span>
      </div>
    </div>
  );
}

function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{value}%</span>
      </div>
      <Progress value={value} className="h-2" indicatorClassName={color} />
    </div>
  );
}

export function AnalyzeClient() {
  const searchParams = useSearchParams();
  const initialResumeId = searchParams.get("resumeId") || "";

  const [resumeId, setResumeId] = useState(initialResumeId);
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [resumes, setResumes] = useState<{ id: string; fileName: string }[]>([]);

  useEffect(() => {
    fetch("/api/resume/list")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setResumes(data); })
      .catch(() => {});
  }, []);

  const handleAnalyze = async () => {
    if (!resumeId || !jobDescription.trim()) {
      toast({ title: "Missing fields", description: "Please select a resume and enter a job description", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeId, jobTitle, jobDescription }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Analysis failed");

      setResult(data);
      toast({ title: "Analysis complete!", description: `Your ATS score: ${data.atsScore.overall}/100`, variant: "success" });
    } catch (err) {
      toast({ title: "Analysis failed", description: err instanceof Error ? err.message : "Try again", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Input panel */}
      <div className="space-y-5">
        <Card className="border-border/50 bg-card/30">
          <CardHeader>
            <CardTitle className="text-base">Resume & Job Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Resume selector */}
            <div className="space-y-2">
              <Label>Select Resume</Label>
              {resumes.length > 0 ? (
                <div className="space-y-2">
                  {resumes.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => setResumeId(r.id)}
                      className={`w-full text-left px-3 py-2.5 rounded-lg border text-sm transition-all duration-150 ${
                        resumeId === r.id
                          ? "border-primary/50 bg-primary/5 text-foreground"
                          : "border-border hover:border-border/80 hover:bg-accent text-muted-foreground"
                      }`}
                    >
                      {r.fileName}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-border p-4 text-center">
                  <p className="text-sm text-muted-foreground mb-2">No resumes uploaded yet</p>
                  <Button asChild variant="outline" size="sm">
                    <Link href="/resume/upload">Upload Resume</Link>
                  </Button>
                </div>
              )}
              {!resumeId && (
                <Input
                  placeholder="Or enter resume ID directly..."
                  value={resumeId}
                  onChange={(e) => setResumeId(e.target.value)}
                  className="mt-2"
                />
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="jobTitle">Job Title (optional)</Label>
              <Input
                id="jobTitle"
                placeholder="e.g. Senior Software Engineer"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="jobDesc">Job Description *</Label>
              <Textarea
                id="jobDesc"
                placeholder="Paste the full job description here..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="min-h-[200px] resize-none"
              />
              <p className="text-xs text-muted-foreground">
                {jobDescription.length} characters · Include full JD for best results
              </p>
            </div>

            <Button
              onClick={handleAnalyze}
              disabled={loading || !resumeId || !jobDescription.trim()}
              variant="gradient"
              size="lg"
              className="w-full"
            >
              {loading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Analyzing with AI...</>
              ) : (
                <><Search className="mr-2 h-4 w-4" />Analyze ATS Compatibility</>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Results panel */}
      <AnimatePresence mode="wait">
        {result ? (
          <motion.div
            key="results"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-4"
          >
            {/* Before/After Score */}
            {(() => {
              const potential = Math.min(100, result.atsScore.overall + Math.round((100 - result.atsScore.overall) * 0.65));
              const gain = potential - result.atsScore.overall;
              return (
                <Card className="border-border/50 bg-card/30">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-4 mb-4">
                      <TrendingUp className="h-4 w-4 text-emerald-400" />
                      <span className="text-sm font-semibold">ATS Score Potential</span>
                      {gain > 0 && <Badge variant="success" className="ml-auto text-xs">+{gain} points available</Badge>}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center rounded-xl border border-border/40 bg-background/30 p-4">
                        <p className="text-xs text-muted-foreground mb-2">Current Score</p>
                        <ScoreRing score={result.atsScore.overall} size={80} />
                        <p className="text-xs text-muted-foreground mt-2">Before optimization</p>
                      </div>
                      <div className="text-center rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 relative">
                        <div className="absolute -top-2 left-1/2 -translate-x-1/2">
                          <span className="text-[10px] bg-emerald-500 text-white px-2 py-0.5 rounded-full font-bold">POTENTIAL</span>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">After AI Rewrite</p>
                        <ScoreRing score={potential} size={80} />
                        <p className="text-xs text-emerald-400 mt-2 font-medium">With all suggestions</p>
                      </div>
                    </div>
                    <div className="mt-4 space-y-2">
                      <ScoreBar label="Keyword Match" value={result.atsScore.keyword} color="bg-emerald-500" />
                      <ScoreBar label="Formatting" value={result.atsScore.formatting} color="bg-blue-500" />
                      <ScoreBar label="Experience" value={result.atsScore.experience} color="bg-purple-500" />
                    </div>
                  </CardContent>
                </Card>
              );
            })()}

            <Tabs defaultValue="keywords">
              <TabsList className="w-full">
                <TabsTrigger value="keywords" className="flex-1">Keywords</TabsTrigger>
                <TabsTrigger value="suggestions" className="flex-1">Suggestions</TabsTrigger>
                <TabsTrigger value="missing" className="flex-1">Missing</TabsTrigger>
                <TabsTrigger value="cover-letter" className="flex-1 flex items-center gap-1">
                  <Mail className="h-3 w-3" />Cover Letter
                </TabsTrigger>
              </TabsList>

              <TabsContent value="keywords" className="mt-3">
                <Card className="border-border/50 bg-card/30">
                  <CardContent className="p-4 space-y-3">
                    <div>
                      <p className="text-xs font-semibold text-emerald-400 mb-2 flex items-center gap-1.5">
                        <CheckCircle className="h-3.5 w-3.5" /> Matched ({result.atsScore.matchedKeywords.length})
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {result.atsScore.matchedKeywords.map((kw) => (
                          <Badge key={kw} variant="success" className="text-xs">{kw}</Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="suggestions" className="mt-3">
                <Card className="border-border/50 bg-card/30">
                  <CardContent className="p-4">
                    <ul className="space-y-3">
                      {result.atsScore.suggestions.map((s, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-sm">
                          <ChevronRight className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">{s}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="missing" className="mt-3">
                <Card className="border-border/50 bg-card/30">
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground mb-3">
                      Add these keywords to improve your ATS score:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {result.atsScore.missingKeywords.map((kw) => (
                        <Badge key={kw} variant="warning" className="text-xs">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          {kw}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="cover-letter" className="mt-3">
                <CoverLetterClient resumeId={resumeId} />
              </TabsContent>
            </Tabs>

            <Button asChild variant="gradient" className="w-full">
              <Link href={`/rewrite?scanId=${result.scanId}&resumeId=${resumeId}`}>
                <Wand2 className="mr-2 h-4 w-4" />
                AI Rewrite to Optimize
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-2xl border border-dashed border-border/50 flex flex-col items-center justify-center p-12 text-center"
          >
            <Target className="h-10 w-10 text-muted-foreground mb-4" />
            <h3 className="text-base font-semibold mb-1">Your ATS score appears here</h3>
            <p className="text-sm text-muted-foreground">
              Select a resume and paste a job description to get your compatibility score
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
