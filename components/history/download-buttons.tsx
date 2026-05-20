"use client";

import { Download, FileText, Mail, FileType2 } from "lucide-react";
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

async function downloadDocx(content: string, filename: string) {
  const { Document, Paragraph, TextRun, HeadingLevel, AlignmentType, Packer, BorderStyle } = await import("docx");

  const lines = content.split("\n");
  const children: InstanceType<typeof Paragraph>[] = [];

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed) {
      children.push(new Paragraph({ text: "" }));
      continue;
    }

    // ALL-CAPS section header
    if (
      trimmed === trimmed.toUpperCase() &&
      trimmed.length > 2 &&
      trimmed.length < 60 &&
      !trimmed.match(/^[•\-–—*]/)
    ) {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: trimmed, bold: true, size: 22 })],
          spacing: { before: 200, after: 80 },
          border: { bottom: { color: "999999", size: 6, style: BorderStyle.SINGLE, space: 4 } },
        })
      );
      continue;
    }

    // Bullet point
    if (trimmed.match(/^[•\-–—*]\s/)) {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: trimmed.replace(/^[•\-–—*]\s/, ""), size: 20 })],
          bullet: { level: 0 },
        })
      );
      continue;
    }

    // First non-empty line = name
    const firstContent = lines.find(l => l.trim());
    if (line === firstContent) {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: trimmed, bold: true, size: 36 })],
          alignment: AlignmentType.CENTER,
          spacing: { after: 120 },
        })
      );
      continue;
    }

    // Contact row (contains | or @ near top)
    if (trimmed.includes("|") || (trimmed.includes("@") && children.length < 5)) {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: trimmed, size: 18, color: "555555" })],
          alignment: AlignmentType.CENTER,
          spacing: { after: 60 },
        })
      );
      continue;
    }

    // Default line
    children.push(
      new Paragraph({
        children: [new TextRun({ text: trimmed, size: 20 })],
        spacing: { after: 40 },
      })
    );
  }

  const doc = new Document({
    sections: [{ properties: {}, children }],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
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
            if (tailoredResume) downloadDocx(tailoredResume, `resume-${slug}.docx`);
            if (coverLetter) downloadDocx(coverLetter, `cover-letter-${slug}.docx`);
          }}
        >
          <FileType2 className="h-3 w-3" />
          .docx
        </Button>
      )}
    </div>
  );
}
