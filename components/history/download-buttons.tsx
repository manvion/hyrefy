"use client";

import { Download, FileText, Mail, FileType2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { openPrintWithTemplate, openPrintCoverLetter, downloadDocxWithTemplate, downloadDocxCoverLetter } from "@/components/resume/resume-templates";

interface Props {
  jobTitle: string;
  company: string | null;
  tailoredResume: string | null;
  coverLetter: string | null;
  lang: string;
}

export function HistoryDownloadButtons({ jobTitle, company, tailoredResume, coverLetter, lang }: Props) {
  const slug = jobTitle.toLowerCase().replace(/\s+/g, "-");
  const suffix = `${jobTitle}${company ? ` at ${company}` : ""} (${lang})`;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {tailoredResume && (
        <Button
          size="sm"
          variant="outline"
          className="h-7 text-xs gap-1.5"
          onClick={() => openPrintWithTemplate(tailoredResume, "modern", `Resume — ${suffix}`)}
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
          onClick={() => openPrintCoverLetter(coverLetter, `Cover Letter — ${suffix}`)}
        >
          <Mail className="h-3 w-3" />
          Cover PDF
        </Button>
      )}
      {tailoredResume && (
        <Button
          size="sm"
          variant="ghost"
          className="h-7 text-xs gap-1.5 text-muted-foreground"
          onClick={() => downloadDocxWithTemplate(tailoredResume, "modern", `resume-${slug}.docx`)}
        >
          <FileType2 className="h-3 w-3" />
          Resume .docx
        </Button>
      )}
      {coverLetter && (
        <Button
          size="sm"
          variant="ghost"
          className="h-7 text-xs gap-1.5 text-muted-foreground"
          onClick={() => downloadDocxCoverLetter(coverLetter, `cover-letter-${slug}.docx`)}
        >
          <FileType2 className="h-3 w-3" />
          Cover .docx
        </Button>
      )}
    </div>
  );
}
