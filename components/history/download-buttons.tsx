"use client";

import { Download, FileText, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  jobTitle: string;
  company: string | null;
  tailoredResume: string | null;
  coverLetter: string | null;
  lang: string;
}

function openPrintWindow(content: string, title: string) {
  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>${title}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Georgia', serif; font-size: 11pt; line-height: 1.6; color: #111; padding: 40px; max-width: 800px; margin: 0 auto; }
  pre { white-space: pre-wrap; font-family: inherit; font-size: 11pt; }
  @media print { body { padding: 0; } @page { margin: 2cm; } }
</style>
</head>
<body>
<pre>${content.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</pre>
<script>window.onload = () => { window.print(); }<\/script>
</body>
</html>`;
  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.target = "_blank";
  a.click();
  URL.revokeObjectURL(url);
}

function downloadTxt(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function HistoryDownloadButtons({ jobTitle, company, tailoredResume, coverLetter, lang }: Props) {
  const suffix = `${jobTitle}${company ? ` at ${company}` : ""} (${lang})`;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {tailoredResume && (
        <Button
          size="sm"
          variant="outline"
          className="h-7 text-xs gap-1.5"
          onClick={() => openPrintWindow(tailoredResume, `Resume — ${suffix}`)}
        >
          <FileText className="h-3 w-3" />
          Resume PDF
        </Button>
      )}
      {coverLetter && (
        <Button
          size="sm"
          variant="outline"
          className="h-7 text-xs gap-1.5"
          onClick={() => openPrintWindow(coverLetter, `Cover Letter — ${suffix}`)}
        >
          <Mail className="h-3 w-3" />
          Cover PDF
        </Button>
      )}
      {(tailoredResume || coverLetter) && (
        <Button
          size="sm"
          variant="ghost"
          className="h-7 text-xs gap-1.5 text-muted-foreground"
          onClick={() => {
            if (tailoredResume) downloadTxt(tailoredResume, `resume-${jobTitle.toLowerCase().replace(/\s+/g, "-")}.txt`);
            if (coverLetter) downloadTxt(coverLetter, `cover-letter-${jobTitle.toLowerCase().replace(/\s+/g, "-")}.txt`);
          }}
        >
          <Download className="h-3 w-3" />
          .txt
        </Button>
      )}
    </div>
  );
}
