import { Metadata } from "next";
import { AnalyzeClient } from "@/components/resume/analyze-client";

export const metadata: Metadata = { title: "ATS Score Analyzer" };

export default function AnalyzePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">ATS Score Analyzer</h1>
        <p className="text-muted-foreground mt-1">
          Match your resume against a job description and get your ATS compatibility score
        </p>
      </div>
      <AnalyzeClient />
    </div>
  );
}
