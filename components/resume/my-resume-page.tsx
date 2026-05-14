"use client";

import { useState, useCallback } from "react";
import { useDropzone, type FileRejection } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/toaster";
import {
  Upload, FileText, X, CheckCircle, Loader2, AlertCircle,
  Sparkles, Search, Trash2, RefreshCw, Calendar, Eye, EyeOff,
  Shield, Zap, FileCheck,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import Link from "next/link";

interface ExistingResume {
  id: string;
  fileName: string;
  rawText: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Props {
  existingResume: ExistingResume | null;
}

// ─── Document preview (PDF-like rendering) ────────────────────────────────────

function ResumeDocumentPreview({ text }: { text: string }) {
  const lines = text.split("\n");

  return (
    <div className="bg-white text-gray-900 shadow-2xl rounded-sm mx-auto font-serif text-[11pt] leading-[1.55] min-h-[1100px] w-full max-w-[680px] print:shadow-none">
      <div className="px-12 py-10">
        {lines.map((line, i) => {
          const trimmed = line.trim();

          // Blank line
          if (!trimmed) return <div key={i} className="h-2" />;

          // ALL-CAPS section header (e.g. EXPERIENCE, EDUCATION)
          if (
            trimmed === trimmed.toUpperCase() &&
            trimmed.length > 2 &&
            trimmed.length < 60 &&
            !trimmed.match(/^[•\-–—*]/)
          ) {
            return (
              <div key={i} className="mt-5 mb-1.5">
                <p className="text-[10pt] font-bold uppercase tracking-[0.12em] text-gray-700 border-b border-gray-300 pb-0.5">
                  {trimmed}
                </p>
              </div>
            );
          }

          // Bullet point
          if (trimmed.match(/^[•\-–—*]\s/)) {
            return (
              <div key={i} className="flex gap-2.5 ml-2 my-0.5">
                <span className="text-gray-500 shrink-0 mt-0.5">•</span>
                <p className="text-[10.5pt] text-gray-800">{trimmed.replace(/^[•\-–—*]\s/, "")}</p>
              </div>
            );
          }

          // First non-empty line = name (large, centered)
          const firstContentLine = lines.find(l => l.trim());
          if (line === firstContentLine && i < 3) {
            return (
              <h1 key={i} className="text-[22pt] font-bold text-center text-gray-900 tracking-tight mb-1">
                {trimmed}
              </h1>
            );
          }

          // Lines with | separators = contact row
          if (trimmed.includes("|") || (trimmed.includes("@") && i < 8)) {
            return (
              <p key={i} className="text-center text-[9.5pt] text-gray-600 mb-0.5">
                {trimmed}
              </p>
            );
          }

          // Lines with em dash or at-sign with year range = job header
          if (trimmed.match(/—|–|\d{4}/) && trimmed.match(/[A-Z]/) && !trimmed.startsWith("•")) {
            return (
              <p key={i} className="font-semibold text-[11pt] text-gray-900 mt-3">
                {trimmed}
              </p>
            );
          }

          // Default paragraph
          return (
            <p key={i} className="text-[10.5pt] text-gray-800 my-0.5">
              {trimmed}
            </p>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function MyResumePage({ existingResume: initialResume }: Props) {
  const [existingResume, setExistingResume] = useState(initialResume);
  const [mode, setMode] = useState<"preview" | "upload">(initialResume ? "preview" : "upload");
  const [showFullText, setShowFullText] = useState(false);

  // Upload state
  const [file, setFile] = useState<File | null>(null);
  const [uploadState, setUploadState] = useState<"idle" | "uploading" | "done" | "error">("idle");
  const [uploadError, setUploadError] = useState("");
  const [deleting, setDeleting] = useState(false);

  const onDrop = useCallback((accepted: File[], rejected: FileRejection[]) => {
    setUploadError("");
    if (rejected.length > 0) { setUploadError(rejected[0].errors[0].message); return; }
    if (accepted.length > 0) { setFile(accepted[0]); setUploadState("idle"); }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "application/msword": [".doc"],
    },
    maxSize: 10 * 1024 * 1024,
    maxFiles: 1,
  });

  const handleUpload = async () => {
    if (!file) return;
    setUploadState("uploading");
    setUploadError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/resume/upload", { method: "POST", body: formData });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Upload failed"); }
      const data = await res.json();
      // Simulate immediate preview with new data
      setExistingResume({
        id: data.resumeId,
        fileName: file.name,
        rawText: data.rawTextPreview || "",
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      setMode("preview");
      setFile(null);
      setUploadState("idle");
      toast({ title: "Resume saved!", description: "Your master resume has been updated.", variant: "success" });
    } catch (err) {
      setUploadState("error");
      const msg = err instanceof Error ? err.message : "Upload failed";
      setUploadError(msg);
      toast({ title: "Upload failed", description: msg, variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    if (!existingResume) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/resume/${existingResume.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setExistingResume(null);
      setMode("upload");
      toast({ title: "Resume deleted", description: "Your master resume has been removed.", variant: "success" });
    } catch {
      toast({ title: "Delete failed", description: "Could not delete resume. Please try again.", variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  };

  // ── Preview Mode ──────────────────────────────────────────────────────────
  if (mode === "preview" && existingResume) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6 max-w-3xl mx-auto"
      >
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">My Resume</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Your master resume — used to generate tailored applications
          </p>
        </div>

        {/* Status bar */}
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-emerald-500/25 bg-emerald-500/5 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center shrink-0">
              <FileCheck className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <p className="font-semibold text-sm">{existingResume.fileName}</p>
              <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
                <Calendar className="h-3 w-3" />
                Last updated {new Date(existingResume.updatedAt).toLocaleDateString("en-CA", {
                  year: "numeric", month: "short", day: "numeric",
                })}
                <Badge variant="secondary" className="text-[10px] px-2 h-4">Master Resume</Badge>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMode("upload")}
              className="h-8 text-xs gap-1.5"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Replace
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              disabled={deleting}
              className="h-8 text-xs gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10"
            >
              {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
              Delete
            </Button>
          </div>
        </div>

        {/* Action CTAs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button asChild variant="gradient" size="lg" className="w-full h-12">
            <Link href="/generate">
              <Sparkles className="mr-2 h-4 w-4" />
              Improve My Resume
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full h-12">
            <Link href="/analyze">
              <Search className="mr-2 h-4 w-4" />
              Analyze ATS Score
            </Link>
          </Button>
        </div>

        {/* Document preview */}
        {existingResume.rawText && (
          <div className="rounded-2xl border border-border/50 overflow-hidden">
            {/* Toolbar */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/30 bg-card/50">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-red-500/40" />
                  <div className="h-2.5 w-2.5 rounded-full bg-amber-500/40" />
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/40" />
                </div>
                <span className="text-xs text-muted-foreground ml-1">{existingResume.fileName}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {existingResume.rawText.split(/\s+/).filter(Boolean).length} words
                </span>
                <button
                  onClick={() => setShowFullText(!showFullText)}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showFullText ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  {showFullText ? "Collapse" : "Expand"}
                </button>
              </div>
            </div>

            {/* Document render */}
            <div
              className={cn(
                "overflow-y-auto bg-gray-100/80 dark:bg-gray-200/10 transition-all",
                showFullText ? "max-h-[1200px]" : "max-h-[600px]"
              )}
            >
              <div className="py-8 px-4">
                <ResumeDocumentPreview text={existingResume.rawText} />
              </div>
            </div>
          </div>
        )}
      </motion.div>
    );
  }

  // ── Upload Mode ───────────────────────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          {existingResume ? "Replace Master Resume" : "Upload Master Resume"}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          {existingResume
            ? "Upload a new version — your existing resume will be replaced"
            : "Upload once, tailor for every job you apply to"}
        </p>
      </div>

      {existingResume && (
        <button
          onClick={() => setMode("preview")}
          className="flex items-center gap-2 text-sm text-primary hover:underline"
        >
          <FileText className="h-3.5 w-3.5" />
          ← Back to resume preview
        </button>
      )}

      {/* Drop zone */}
      <div
        {...getRootProps()}
        className={cn(
          "relative rounded-2xl border-2 border-dashed transition-all duration-200 cursor-pointer p-12 text-center",
          isDragActive
            ? "border-primary bg-primary/5 scale-[1.01]"
            : file
            ? "border-primary/50 bg-primary/5"
            : "border-border hover:border-primary/50 hover:bg-accent/30"
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-4">
          <div className={cn(
            "flex h-16 w-16 items-center justify-center rounded-2xl transition-colors",
            file ? "bg-primary/20" : "bg-muted"
          )}>
            {file
              ? <FileText className="h-8 w-8 text-primary" />
              : <Upload className={cn("h-8 w-8 transition-colors", isDragActive ? "text-primary" : "text-muted-foreground")} />
            }
          </div>
          {file ? (
            <div>
              <p className="text-base font-semibold">{file.name}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {(file.size / 1024).toFixed(1)} KB · {file.type.includes("pdf") ? "PDF" : "DOCX"}
              </p>
            </div>
          ) : (
            <div>
              <p className="text-base font-semibold">
                {isDragActive ? "Drop your resume here" : "Drag & drop your resume"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                or <span className="text-primary underline">browse files</span>
              </p>
              <p className="text-xs text-muted-foreground mt-2">PDF or DOCX · Max 10MB</p>
            </div>
          )}
        </div>
        {file && (
          <button
            onClick={(e) => { e.stopPropagation(); setFile(null); setUploadState("idle"); }}
            className="absolute top-3 right-3 rounded-full p-1.5 bg-muted hover:bg-muted/80 transition-colors"
          >
            <X className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        )}
      </div>

      {uploadError && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-sm text-destructive"
        >
          <AlertCircle className="h-4 w-4 shrink-0" />
          {uploadError}
        </motion.div>
      )}

      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-muted-foreground">Supported:</span>
        <Badge variant="outline" className="text-xs">PDF</Badge>
        <Badge variant="outline" className="text-xs">DOCX</Badge>
        <Badge variant="outline" className="text-xs">DOC</Badge>
      </div>

      <Button
        onClick={handleUpload}
        disabled={!file || uploadState === "uploading"}
        variant="gradient"
        size="lg"
        className="w-full h-12"
      >
        {uploadState === "uploading" ? (
          <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Uploading & extracting text...</>
        ) : (
          <><Upload className="mr-2 h-4 w-4" />Upload Resume</>
        )}
      </Button>

      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: Sparkles, label: "AI-powered", desc: "Tailored for every job" },
          { icon: Shield,   label: "Secure & private", desc: "Encrypted, never shared" },
          { icon: Zap,      label: "Instant results", desc: "Ready in under 10s" },
        ].map((item) => (
          <div key={item.label} className="rounded-xl border border-border/50 bg-card/20 p-4 text-center">
            <item.icon className="h-5 w-5 text-primary mx-auto mb-2" />
            <p className="text-xs font-medium">{item.label}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
          </div>
        ))}
      </div>

      {uploadState === "done" && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4"
          >
            <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold">Resume uploaded successfully</p>
            </div>
            <Button asChild variant="gradient" size="sm">
              <Link href="/generate"><Sparkles className="mr-1.5 h-3.5 w-3.5" />Improve Now</Link>
            </Button>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
