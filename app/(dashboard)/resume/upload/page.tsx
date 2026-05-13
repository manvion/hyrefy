import { Metadata } from "next";
import { ResumeUpload } from "@/components/resume/resume-upload";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Shield, Zap } from "lucide-react";

export const metadata: Metadata = { title: "My Resume" };

export default function UploadPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Master Resume</h1>
        <p className="text-muted-foreground mt-1">
          Upload once — we tailor it for every job you apply to
        </p>
      </div>

      <Card className="border-border/50 bg-card/30">
        <CardHeader>
          <CardTitle className="text-lg">Upload Master Resume</CardTitle>
          <CardDescription>
            Your master resume is the source of truth. Upload a comprehensive version with all your experience, skills, and achievements. We&apos;ll use it to generate perfectly tailored resumes and cover letters for each job.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResumeUpload />
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: Sparkles, label: "AI-powered parsing", desc: "Hyrefy AI extracts all key information" },
          { icon: Shield, label: "Secure & private", desc: "Your data is encrypted and never shared" },
          { icon: Zap, label: "Instant results", desc: "Parsed and ready in under 10 seconds" },
        ].map((item) => (
          <div key={item.label} className="rounded-xl border border-border/50 bg-card/20 p-4 text-center">
            <item.icon className="h-5 w-5 text-primary mx-auto mb-2" />
            <p className="text-xs font-medium">{item.label}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
