import { Metadata } from "next";
import { RewriteClient } from "@/components/resume/rewrite-client";

export const metadata: Metadata = { title: "AI Resume Rewriter" };

export default function RewritePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">AI Resume Rewriter</h1>
        <p className="text-muted-foreground mt-1">
          Rewrite your resume bullets with AI — stronger language, better keywords, quantified impact
        </p>
      </div>
      <RewriteClient />
    </div>
  );
}
