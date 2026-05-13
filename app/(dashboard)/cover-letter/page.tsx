import { Metadata } from "next";
import { CoverLetterClient } from "@/components/resume/cover-letter-client";

export const metadata: Metadata = { title: "Cover Letter Generator" };

export default function CoverLetterPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Cover Letter Generator</h1>
        <p className="text-muted-foreground mt-1">
          AI-crafted cover letters tailored to each job — in English or French
        </p>
      </div>
      <CoverLetterClient />
    </div>
  );
}
