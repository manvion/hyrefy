"use client";

import { createPortal } from "react-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { X, Check } from "lucide-react";

export type TemplateId = "modern" | "classic" | "clean" | "executive" | "minimal" | "bold";

export const TEMPLATES: {
  id: TemplateId;
  name: string;
  country: string;
  flag: string;
  desc: string;
  accentColor: string;
  fontFamily: string;
  preview: string;
}[] = [
  { id: "modern",    name: "Modern",    country: "USA / Canada",   flag: "🇺🇸", desc: "Clean sidebar, ATS-friendly",   accentColor: "#0A66C2", fontFamily: "'Calibri', 'Arial', sans-serif",           preview: "bg-blue-600"    },
  { id: "classic",   name: "Classic",   country: "UK / Ireland",   flag: "🇬🇧", desc: "Formal, two-column header",     accentColor: "#1a1a2e", fontFamily: "'Georgia', 'Times New Roman', serif",      preview: "bg-slate-800"  },
  { id: "clean",     name: "Clean",     country: "Australia / NZ", flag: "🇦🇺", desc: "Spacious, modern sans-serif",   accentColor: "#0d7377", fontFamily: "'Trebuchet MS', 'Helvetica Neue', sans-serif", preview: "bg-teal-700"   },
  { id: "executive", name: "Executive", country: "Germany / EU",   flag: "🇩🇪", desc: "Structured, detail-oriented",  accentColor: "#2d3436", fontFamily: "'Arial', sans-serif",                      preview: "bg-gray-800"   },
  { id: "minimal",   name: "Minimal",   country: "France / BE",    flag: "🇫🇷", desc: "Elegant, whitespace-forward",  accentColor: "#6c5ce7", fontFamily: "'Helvetica Neue', 'Arial', sans-serif",    preview: "bg-violet-700" },
  { id: "bold",      name: "Bold",      country: "India / UAE",    flag: "🇮🇳", desc: "Strong header, impact-first",  accentColor: "#d63031", fontFamily: "'Arial', 'Helvetica', sans-serif",         preview: "bg-red-700"    },
];

function buildTemplateHtml(text: string, templateId: TemplateId, title: string): string {
  const lines = text.split("\n");
  const firstContent = lines.find(l => l.trim()) ?? "";
  const contactLines: string[] = [];
  const bodyLines: string[] = [];
  let passedName = false;

  for (const line of lines) {
    const t = line.trim();
    if (!t) { if (passedName) bodyLines.push(""); continue; }
    if (line === firstContent) { passedName = true; continue; }
    if (!passedName) continue;
    if ((t.includes("|") || t.includes("@") || t.includes("+")) && contactLines.length < 3) {
      contactLines.push(t);
    } else {
      bodyLines.push(line);
    }
  }

  function renderBody(lines: string[]): string {
    return lines.map(line => {
      const t = line.trim();
      if (!t) return `<div class="spacer"></div>`;
      if (t === t.toUpperCase() && t.length > 2 && t.length < 60 && !t.match(/^[•\-–—*]/)) {
        return `<div class="section-header">${t}</div>`;
      }
      if (t.match(/^[•\-–—*]\s/)) {
        return `<div class="bullet"><span class="dot">•</span><span>${t.replace(/^[•\-–—*]\s/, "")}</span></div>`;
      }
      return `<p class="body-line">${t}</p>`;
    }).join("\n");
  }

  const body = renderBody(bodyLines);
  const contactHtml = contactLines.map(c => `<span>${c}</span>`).join(" &nbsp;|&nbsp; ");

  const templates: Record<TemplateId, string> = {
    modern: `
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: 'Calibri', 'Arial', sans-serif; font-size: 10.5pt; color: #222; background: #fff; }
  .page { max-width: 760px; margin: 0 auto; padding: 36px 44px; }
  .name { font-size: 26pt; font-weight: 700; color: #0A66C2; letter-spacing: -0.5px; }
  .contact { font-size: 9pt; color: #555; margin-top: 4px; border-bottom: 2.5px solid #0A66C2; padding-bottom: 8px; margin-bottom: 14px; }
  .section-header { font-size: 10pt; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #0A66C2; margin: 16px 0 5px; border-bottom: 1px solid #d0e4f7; padding-bottom: 3px; }
  .bullet { display: flex; gap: 8px; margin: 2px 0 2px 6px; font-size: 10pt; line-height: 1.5; }
  .dot { color: #0A66C2; flex-shrink: 0; }
  .body-line { font-size: 10.5pt; margin: 2px 0; line-height: 1.55; }
  .spacer { height: 4px; }
  @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } @page { size: A4; margin: 0; } }
</style>
<div class="page">
  <div class="name">${firstContent.trim()}</div>
  <div class="contact">${contactHtml}</div>
  ${body}
</div>`,

    classic: `
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: 'Georgia', 'Times New Roman', serif; font-size: 10.5pt; color: #111; background: #fff; }
  .page { max-width: 760px; margin: 0 auto; padding: 40px 48px; }
  .header { border-bottom: 3px double #1a1a2e; padding-bottom: 12px; margin-bottom: 14px; text-align: center; }
  .name { font-size: 22pt; font-weight: 700; color: #1a1a2e; letter-spacing: 2px; text-transform: uppercase; }
  .contact { font-size: 9pt; color: #444; margin-top: 6px; }
  .section-header { font-size: 10pt; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #1a1a2e; margin: 16px 0 5px; border-left: 4px solid #1a1a2e; padding-left: 8px; }
  .bullet { display: flex; gap: 10px; margin: 2px 0 2px 8px; font-size: 10pt; line-height: 1.55; }
  .dot { color: #1a1a2e; flex-shrink: 0; }
  .body-line { font-size: 10.5pt; margin: 2px 0; line-height: 1.6; }
  .spacer { height: 4px; }
  @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } @page { size: A4; margin: 0; } }
</style>
<div class="page">
  <div class="header">
    <div class="name">${firstContent.trim()}</div>
    <div class="contact">${contactHtml}</div>
  </div>
  ${body}
</div>`,

    clean: `
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: 'Trebuchet MS', 'Helvetica Neue', sans-serif; font-size: 10.5pt; color: #2d3436; background: #fff; }
  .page { max-width: 760px; margin: 0 auto; padding: 36px 44px; }
  .header { background: #0d7377; color: #fff; padding: 20px 24px; border-radius: 6px; margin-bottom: 18px; }
  .name { font-size: 22pt; font-weight: 700; letter-spacing: -0.3px; }
  .contact { font-size: 9pt; opacity: 0.85; margin-top: 4px; }
  .section-header { font-size: 10pt; font-weight: 700; text-transform: uppercase; letter-spacing: 1.2px; color: #0d7377; margin: 16px 0 5px; padding-bottom: 3px; border-bottom: 2px solid #0d7377; }
  .bullet { display: flex; gap: 8px; margin: 2px 0 2px 4px; font-size: 10pt; line-height: 1.5; }
  .dot { color: #0d7377; flex-shrink: 0; }
  .body-line { font-size: 10.5pt; margin: 2px 0; line-height: 1.55; }
  .spacer { height: 4px; }
  @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } @page { size: A4; margin: 0; } }
</style>
<div class="page">
  <div class="header">
    <div class="name">${firstContent.trim()}</div>
    <div class="contact">${contactHtml}</div>
  </div>
  ${body}
</div>`,

    executive: `
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: 'Arial', sans-serif; font-size: 10pt; color: #1a1a1a; background: #fff; }
  .page { max-width: 760px; margin: 0 auto; padding: 36px 44px; }
  .header { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 2px solid #2d3436; padding-bottom: 10px; margin-bottom: 14px; }
  .name { font-size: 20pt; font-weight: 700; color: #2d3436; }
  .contact { font-size: 8.5pt; color: #555; text-align: right; line-height: 1.7; }
  .section-header { font-size: 9.5pt; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #fff; background: #2d3436; padding: 3px 8px; margin: 16px 0 5px; }
  .bullet { display: flex; gap: 8px; margin: 2px 0 2px 6px; font-size: 10pt; line-height: 1.5; }
  .dot { color: #2d3436; flex-shrink: 0; font-weight: bold; }
  .body-line { font-size: 10pt; margin: 2px 0; line-height: 1.55; }
  .spacer { height: 4px; }
  @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } @page { size: A4; margin: 0; } }
</style>
<div class="page">
  <div class="header">
    <div class="name">${firstContent.trim()}</div>
    <div class="contact">${contactLines.join("<br/>")}</div>
  </div>
  ${body}
</div>`,

    minimal: `
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: 'Helvetica Neue', 'Arial', sans-serif; font-size: 10.5pt; color: #333; background: #fff; }
  .page { max-width: 720px; margin: 0 auto; padding: 48px 52px; }
  .name { font-size: 28pt; font-weight: 300; color: #111; letter-spacing: -1px; margin-bottom: 4px; }
  .accent { display: inline-block; width: 40px; height: 3px; background: #6c5ce7; margin-bottom: 8px; }
  .contact { font-size: 9pt; color: #777; margin-bottom: 20px; }
  .section-header { font-size: 8.5pt; font-weight: 700; text-transform: uppercase; letter-spacing: 3px; color: #6c5ce7; margin: 18px 0 6px; }
  .bullet { display: flex; gap: 10px; margin: 3px 0; font-size: 10pt; line-height: 1.6; color: #444; }
  .dot { color: #6c5ce7; flex-shrink: 0; }
  .body-line { font-size: 10.5pt; margin: 2px 0; line-height: 1.65; color: #333; }
  .spacer { height: 6px; }
  @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } @page { size: A4; margin: 0; } }
</style>
<div class="page">
  <div class="name">${firstContent.trim()}</div>
  <div class="accent"></div>
  <div class="contact">${contactHtml}</div>
  ${body}
</div>`,

    bold: `
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: 'Arial', 'Helvetica', sans-serif; font-size: 10.5pt; color: #1a1a1a; background: #fff; }
  .page { max-width: 760px; margin: 0 auto; padding: 0; }
  .header { background: linear-gradient(135deg, #d63031 0%, #b71c1c 100%); color: #fff; padding: 28px 40px 22px; }
  .name { font-size: 24pt; font-weight: 900; letter-spacing: -0.5px; text-transform: uppercase; }
  .contact { font-size: 9pt; opacity: 0.9; margin-top: 6px; }
  .body { padding: 20px 40px 36px; }
  .section-header { font-size: 10pt; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #d63031; margin: 16px 0 5px; border-bottom: 2px solid #d63031; padding-bottom: 3px; }
  .bullet { display: flex; gap: 8px; margin: 2px 0 2px 4px; font-size: 10pt; line-height: 1.5; }
  .dot { color: #d63031; flex-shrink: 0; font-weight: bold; }
  .body-line { font-size: 10.5pt; margin: 2px 0; line-height: 1.55; }
  .spacer { height: 4px; }
  @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } @page { margin: 0; } }
</style>
<div class="page">
  <div class="header">
    <div class="name">${firstContent.trim()}</div>
    <div class="contact">${contactHtml}</div>
  </div>
  <div class="body">${body}</div>
</div>`,
  };

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title>${templates[templateId]}</head><body></body></html>`
    .replace("<body></body>", `<body>${templates[templateId].split("</style>")[1] ?? ""}</body>`)
    .replace(/\n\s*\n/g, "\n");
}

// Properly build the full HTML document
function buildFullHtml(text: string, templateId: TemplateId, title: string): string {
  const lines = text.split("\n");
  const firstContent = lines.find(l => l.trim()) ?? "";
  const contactLines: string[] = [];
  const bodyLines: string[] = [];
  let passedName = false;
  let contactDone = false;

  for (const line of lines) {
    const t = line.trim();
    if (!t) {
      if (passedName) { contactDone = true; bodyLines.push(""); }
      continue;
    }
    if (line === firstContent) { passedName = true; continue; }
    if (!passedName) continue;
    if (!contactDone && (t.includes("|") || t.includes("@") || t.includes("+1") || t.includes("+")) && contactLines.length < 4) {
      contactLines.push(t);
    } else {
      contactDone = true;
      bodyLines.push(line);
    }
  }

  function renderBody(lines: string[]): string {
    return lines.map(line => {
      const t = line.trim();
      if (!t) return `<div class="spacer"></div>`;
      if (t === t.toUpperCase() && t.length > 2 && t.length < 60 && !t.match(/^[•\-–—*]/)) {
        return `<div class="section-header">${t}</div>`;
      }
      if (t.match(/^[•\-–—*]\s/)) {
        return `<div class="bullet"><span class="dot">•</span><span>${t.replace(/^[•\-–—*]\s/, "").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</span></div>`;
      }
      return `<p class="body-line">${t.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>`;
    }).join("\n");
  }

  const body = renderBody(bodyLines);
  const contactHtml = contactLines.map(c => c.replace(/</g, "&lt;").replace(/>/g, "&gt;")).join(" &nbsp;|&nbsp; ");
  const nameHtml = firstContent.trim().replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const contactLinesHtml = contactLines.map(c => c.replace(/</g, "&lt;").replace(/>/g, "&gt;")).join("<br/>");

  const styles: Record<TemplateId, string> = {
    modern: `* { margin:0; padding:0; box-sizing:border-box; }
body { font-family: 'Calibri', 'Arial', sans-serif; font-size: 10.5pt; color: #222; background: #fff; }
.page { max-width: 760px; margin: 0 auto; padding: 36px 44px; }
.name { font-size: 26pt; font-weight: 700; color: #0A66C2; letter-spacing: -0.5px; }
.contact { font-size: 9pt; color: #555; margin-top: 4px; border-bottom: 2.5px solid #0A66C2; padding-bottom: 8px; margin-bottom: 14px; }
.section-header { font-size: 10pt; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #0A66C2; margin: 16px 0 5px; border-bottom: 1px solid #d0e4f7; padding-bottom: 3px; }
.bullet { display: flex; gap: 8px; margin: 2px 0 2px 6px; font-size: 10pt; line-height: 1.5; }
.dot { color: #0A66C2; flex-shrink: 0; }
.body-line { font-size: 10.5pt; margin: 2px 0; line-height: 1.55; }
.spacer { height: 4px; }
@media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } @page { size: A4; margin: 0; } }`,

    classic: `* { margin:0; padding:0; box-sizing:border-box; }
body { font-family: 'Georgia', 'Times New Roman', serif; font-size: 10.5pt; color: #111; background: #fff; }
.page { max-width: 760px; margin: 0 auto; padding: 40px 48px; }
.header { border-bottom: 3px double #1a1a2e; padding-bottom: 12px; margin-bottom: 14px; text-align: center; }
.name { font-size: 22pt; font-weight: 700; color: #1a1a2e; letter-spacing: 2px; text-transform: uppercase; }
.contact { font-size: 9pt; color: #444; margin-top: 6px; }
.section-header { font-size: 10pt; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #1a1a2e; margin: 16px 0 5px; border-left: 4px solid #1a1a2e; padding-left: 8px; }
.bullet { display: flex; gap: 10px; margin: 2px 0 2px 8px; font-size: 10pt; line-height: 1.55; }
.dot { color: #1a1a2e; flex-shrink: 0; }
.body-line { font-size: 10.5pt; margin: 2px 0; line-height: 1.6; }
.spacer { height: 4px; }
@media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } @page { size: A4; margin: 0; } }`,

    clean: `* { margin:0; padding:0; box-sizing:border-box; }
body { font-family: 'Trebuchet MS', 'Helvetica Neue', sans-serif; font-size: 10.5pt; color: #2d3436; background: #fff; }
.page { max-width: 760px; margin: 0 auto; padding: 36px 44px; }
.header { background: #0d7377; color: #fff; padding: 20px 24px; border-radius: 6px; margin-bottom: 18px; }
.name { font-size: 22pt; font-weight: 700; letter-spacing: -0.3px; }
.contact { font-size: 9pt; opacity: 0.85; margin-top: 4px; }
.section-header { font-size: 10pt; font-weight: 700; text-transform: uppercase; letter-spacing: 1.2px; color: #0d7377; margin: 16px 0 5px; padding-bottom: 3px; border-bottom: 2px solid #0d7377; }
.bullet { display: flex; gap: 8px; margin: 2px 0 2px 4px; font-size: 10pt; line-height: 1.5; }
.dot { color: #0d7377; flex-shrink: 0; }
.body-line { font-size: 10.5pt; margin: 2px 0; line-height: 1.55; }
.spacer { height: 4px; }
@media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } @page { size: A4; margin: 0; } }`,

    executive: `* { margin:0; padding:0; box-sizing:border-box; }
body { font-family: 'Arial', sans-serif; font-size: 10pt; color: #1a1a1a; background: #fff; }
.page { max-width: 760px; margin: 0 auto; padding: 36px 44px; }
.header { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 2px solid #2d3436; padding-bottom: 10px; margin-bottom: 14px; }
.name { font-size: 20pt; font-weight: 700; color: #2d3436; }
.contact { font-size: 8.5pt; color: #555; text-align: right; line-height: 1.7; }
.section-header { font-size: 9.5pt; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #fff; background: #2d3436; padding: 3px 8px; margin: 16px 0 5px; }
.bullet { display: flex; gap: 8px; margin: 2px 0 2px 6px; font-size: 10pt; line-height: 1.5; }
.dot { color: #2d3436; flex-shrink: 0; font-weight: bold; }
.body-line { font-size: 10pt; margin: 2px 0; line-height: 1.55; }
.spacer { height: 4px; }
@media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } @page { size: A4; margin: 0; } }`,

    minimal: `* { margin:0; padding:0; box-sizing:border-box; }
body { font-family: 'Helvetica Neue', 'Arial', sans-serif; font-size: 10.5pt; color: #333; background: #fff; }
.page { max-width: 720px; margin: 0 auto; padding: 48px 52px; }
.name { font-size: 28pt; font-weight: 300; color: #111; letter-spacing: -1px; margin-bottom: 4px; }
.accent { display: inline-block; width: 40px; height: 3px; background: #6c5ce7; margin-bottom: 8px; }
.contact { font-size: 9pt; color: #777; margin-bottom: 20px; }
.section-header { font-size: 8.5pt; font-weight: 700; text-transform: uppercase; letter-spacing: 3px; color: #6c5ce7; margin: 18px 0 6px; }
.bullet { display: flex; gap: 10px; margin: 3px 0; font-size: 10pt; line-height: 1.6; color: #444; }
.dot { color: #6c5ce7; flex-shrink: 0; }
.body-line { font-size: 10.5pt; margin: 2px 0; line-height: 1.65; color: #333; }
.spacer { height: 6px; }
@media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } @page { size: A4; margin: 0; } }`,

    bold: `* { margin:0; padding:0; box-sizing:border-box; }
body { font-family: 'Arial', 'Helvetica', sans-serif; font-size: 10.5pt; color: #1a1a1a; background: #fff; }
.page { max-width: 760px; margin: 0 auto; }
.header { background: #d63031; color: #fff; padding: 28px 40px 22px; }
.name { font-size: 24pt; font-weight: 900; letter-spacing: -0.5px; text-transform: uppercase; }
.contact { font-size: 9pt; opacity: 0.9; margin-top: 6px; }
.inner { padding: 20px 40px 36px; }
.section-header { font-size: 10pt; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #d63031; margin: 16px 0 5px; border-bottom: 2px solid #d63031; padding-bottom: 3px; }
.bullet { display: flex; gap: 8px; margin: 2px 0 2px 4px; font-size: 10pt; line-height: 1.5; }
.dot { color: #d63031; flex-shrink: 0; font-weight: bold; }
.body-line { font-size: 10.5pt; margin: 2px 0; line-height: 1.55; }
.spacer { height: 4px; }
@media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } @page { size: A4; margin: 0; } }`,
  };

  const bodyHtml: Record<TemplateId, string> = {
    modern: `<div class="page"><div class="name">${nameHtml}</div><div class="contact">${contactHtml}</div>${body}</div>`,
    classic: `<div class="page"><div class="header"><div class="name">${nameHtml}</div><div class="contact">${contactHtml}</div></div>${body}</div>`,
    clean: `<div class="page"><div class="header"><div class="name">${nameHtml}</div><div class="contact">${contactHtml}</div></div>${body}</div>`,
    executive: `<div class="page"><div class="header"><div class="name">${nameHtml}</div><div class="contact">${contactLinesHtml}</div></div>${body}</div>`,
    minimal: `<div class="page"><div class="name">${nameHtml}</div><div class="accent"></div><div class="contact">${contactHtml}</div>${body}</div>`,
    bold: `<div class="page"><div class="header"><div class="name">${nameHtml}</div><div class="contact">${contactHtml}</div></div><div class="inner">${body}</div></div>`,
  };

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title><style>${styles[templateId]}</style></head><body>${bodyHtml[templateId]}<script>window.onload=()=>window.print();<\/script></body></html>`;
}

// ─── Cover letter print / DOCX ────────────────────────────────────────────────

export function openPrintCoverLetter(text: string, title: string) {
  const paragraphs = text.split("\n").map(line => {
    const t = line.trim();
    if (!t) return `<div style="height:10pt"></div>`;
    return `<p>${t.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>`;
  }).join("\n");

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title><style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Georgia','Times New Roman',serif;font-size:11pt;line-height:1.75;color:#111;background:#fff}
.page{max-width:680px;margin:0 auto;padding:52px 56px}
p{margin-bottom:14pt}
@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}@page{size:A4;margin:0}}
</style></head><body><div class="page">${paragraphs}</div><script>window.onload=()=>window.print();<\/script></body></html>`;

  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.target = "_blank";
  a.click();
  URL.revokeObjectURL(url);
}

export async function downloadDocxCoverLetter(text: string, filename: string) {
  const { Document, Paragraph, TextRun, Packer } = await import("docx");

  const children: InstanceType<typeof Paragraph>[] = text.split("\n").map(line => {
    const t = line.trim();
    if (!t) return new Paragraph({ text: "" });
    return new Paragraph({
      children: [new TextRun({ text: t, size: 22, font: "Georgia" })],
      spacing: { after: 160 },
    });
  });

  const doc = new Document({ sections: [{ properties: {}, children }] });
  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function openPrintWithTemplate(text: string, templateId: TemplateId, title: string) {
  const html = buildFullHtml(text, templateId, title);
  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.target = "_blank";
  a.click();
  URL.revokeObjectURL(url);
}

export async function downloadDocxWithTemplate(text: string, templateId: TemplateId, filename: string) {
  const { Document, Paragraph, TextRun, AlignmentType, Packer, BorderStyle, ShadingType } = await import("docx");
  const tpl = TEMPLATES.find(t => t.id === templateId)!;
  const accent = tpl.accentColor;

  const lines = text.split("\n");
  const firstContent = lines.find(l => l.trim()) ?? "";
  const children: InstanceType<typeof Paragraph>[] = [];

  // Name
  children.push(new Paragraph({
    children: [new TextRun({ text: firstContent.trim(), bold: true, size: 52, color: accent.replace("#", "") })],
    alignment: AlignmentType.CENTER,
    spacing: { after: 120 },
  }));

  let passedName = false;
  let contactDone = false;

  for (const line of lines) {
    const t = line.trim();
    if (line === firstContent) { passedName = true; continue; }
    if (!passedName) continue;

    if (!t) {
      if (passedName) { contactDone = true; children.push(new Paragraph({ text: "" })); }
      continue;
    }

    if (!contactDone && (t.includes("|") || t.includes("@") || t.includes("+"))) {
      children.push(new Paragraph({
        children: [new TextRun({ text: t, size: 18, color: "666666" })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 60 },
      }));
      continue;
    }
    contactDone = true;

    if (t === t.toUpperCase() && t.length > 2 && t.length < 60 && !t.match(/^[•\-–—*]/)) {
      children.push(new Paragraph({
        children: [new TextRun({ text: t, bold: true, size: 22, color: accent.replace("#", "") })],
        spacing: { before: 240, after: 80 },
        border: { bottom: { color: accent.replace("#", ""), size: 6, style: BorderStyle.SINGLE, space: 4 } },
      }));
      continue;
    }

    if (t.match(/^[•\-–—*]\s/)) {
      children.push(new Paragraph({
        children: [new TextRun({ text: t.replace(/^[•\-–—*]\s/, ""), size: 20 })],
        bullet: { level: 0 },
        spacing: { after: 40 },
      }));
      continue;
    }

    children.push(new Paragraph({
      children: [new TextRun({ text: t, size: 20 })],
      spacing: { after: 40 },
    }));
  }

  const doc = new Document({ sections: [{ properties: {}, children }] });
  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Template Selector Modal ──────────────────────────────────────────────────

interface TemplateSelectorProps {
  text: string;
  filename: string;
  onClose: () => void;
  onApply: (templateId: TemplateId) => void;
  initialTemplate?: TemplateId;
}

export function TemplateSelectorModal({ text, filename, onClose, onApply, initialTemplate = "modern" }: TemplateSelectorProps) {
  const [selected, setSelected] = useState<TemplateId>(initialTemplate);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm overflow-y-auto" onClick={onClose}>
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="relative w-full max-w-2xl rounded-2xl border border-border/50 bg-card shadow-2xl my-2"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-border/30">
            <div>
              <h2 className="text-lg font-bold text-foreground">Choose a Template</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Country-optimised designs — select one to apply to your preview</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="h-8 w-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Template grid */}
          <div className="p-6 grid grid-cols-2 sm:grid-cols-3 gap-3">
            {TEMPLATES.map(tpl => (
              <button
                key={tpl.id}
                type="button"
                onClick={() => setSelected(tpl.id)}
                className={cn(
                  "relative rounded-xl border-2 overflow-hidden text-left transition-all duration-150 active:scale-[0.97]",
                  selected === tpl.id ? "border-primary shadow-md shadow-primary/20 scale-[1.02]" : "border-border/40 hover:border-border"
                )}
              >
                {/* Mini preview */}
                <div className={cn("h-20 w-full flex flex-col gap-1 p-2", tpl.preview)}>
                  <div className="h-2.5 w-16 bg-white/90 rounded-sm" />
                  <div className="h-1.5 w-24 bg-white/50 rounded-sm" />
                  <div className="mt-1 space-y-1">
                    <div className="h-1 w-20 bg-white/40 rounded-sm" />
                    <div className="h-1 w-16 bg-white/30 rounded-sm" />
                    <div className="h-1 w-18 bg-white/30 rounded-sm" />
                  </div>
                </div>
                <div className="px-3 py-2 bg-card">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-foreground">{tpl.name}</span>
                    <span className="text-base">{tpl.flag}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{tpl.country}</p>
                  <p className="text-[10px] text-muted-foreground/70 mt-0.5">{tpl.desc}</p>
                </div>
                {selected === tpl.id && (
                  <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                    <Check className="h-3 w-3 text-primary-foreground" />
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="px-6 pb-6 flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="gradient"
              className="gap-2"
              onClick={() => { onApply(selected); onClose(); }}
            >
              <Check className="h-4 w-4" />
              Apply Template
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
