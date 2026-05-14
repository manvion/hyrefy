"use client";

import { useState, useCallback } from "react";
import { useDropzone, type FileRejection } from "react-dropzone";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/toaster";
import { Upload, FileText, X, CheckCircle, Loader2, AlertCircle, Sparkles, Search, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import Link from "next/link";

type UploadState = "idle" | "uploading" | "done" | "error";

export function ResumeUpload() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [state, setState] = useState<UploadState>("idle");
  const [error, setError] = useState<string>("");
  const [resumeId, setResumeId] = useState<string>("");
  const [rawTextPreview, setRawTextPreview] = useState<string>("");
  const [showFullPreview, setShowFullPreview] = useState(false);

  const onDrop = useCallback((accepted: File[], rejected: FileRejection[]) => {
    setError("");
    if (rejected.length > 0) {
      setError(rejected[0].errors[0].message);
      return;
    }
    if (accepted.length > 0) {
      setFile(accepted[0]);
      setState("idle");
    }
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
    setState("uploading");
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/resume/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Upload failed");
      }

      const data = await res.json();
      setResumeId(data.resumeId);
      setRawTextPreview(data.rawTextPreview || "");
      setState("done");

      toast({ title: "Resume saved!", description: "Your resume text has been extracted and stored.", variant: "success" });
    } catch (err) {
      setState("error");
      const msg = err instanceof Error ? err.message : "Upload failed";
      setError(msg);
      toast({ title: "Upload failed", description: msg, variant: "destructive" });
    }
  };

  const removeFile = () => {
    setFile(null);
    setState("idle");
    setError("");
    setRawTextPreview("");
    setResumeId("");
  };

  if (state === "done") {
    return (
      <motion.div
        key="done"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-5"
      >
        {/* Success header */}
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-5 flex items-center gap-4">
          <CheckCircle className="h-8 w-8 text-emerald-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm">Resume uploaded successfully</p>
            <p className="text-xs text-muted-foreground mt-0.5 truncate">{file?.name}</p>
          </div>
          <Button variant="outline" size="sm" onClick={removeFile}>
            Upload Another
          </Button>
        </div>

        {/* Extracted text preview */}
        {rawTextPreview && (
          <div className="rounded-2xl border border-border/50 bg-card/30 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/30 bg-card/50">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Extracted Resume Text</span>
              </div>
              <button
                onClick={() => setShowFullPreview(!showFullPreview)}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {showFullPreview ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                {showFullPreview ? "Collapse" : "Show full text"}
              </button>
            </div>
            <div className={cn("p-4 overflow-y-auto transition-all", showFullPreview ? "max-h-[500px]" : "max-h-[220px]")}>
              <pre className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap font-sans">
                {rawTextPreview}
                {rawTextPreview.length >= 2000 && !showFullPreview && (
                  <span className="text-primary cursor-pointer" onClick={() => setShowFullPreview(true)}> … (truncated)</span>
                )}
              </pre>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button asChild variant="gradient" size="lg" className="w-full">
            <Link href={`/generate`}>
              <Sparkles className="mr-2 h-4 w-4" />
              Improve My Resume
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full">
            <Link href={`/analyze?resumeId=${resumeId}`}>
              <Search className="mr-2 h-4 w-4" />
              Analyze ATS Score
            </Link>
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      <AnimatePresence mode="wait">
        <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {/* Drop zone */}
          <div
            {...getRootProps()}
            className={cn(
              "relative rounded-2xl border-2 border-dashed transition-all duration-200 cursor-pointer",
              isDragActive
                ? "border-primary bg-primary/5 scale-[1.01]"
                : file
                ? "border-primary/50 bg-primary/5"
                : "border-border hover:border-primary/50 hover:bg-accent/30",
              "p-12 text-center"
            )}
          >
            <input {...getInputProps()} />

            <div className="flex flex-col items-center gap-4">
              <div className={cn(
                "flex h-16 w-16 items-center justify-center rounded-2xl transition-colors",
                file ? "bg-primary/20" : "bg-muted"
              )}>
                {file ? (
                  <FileText className="h-8 w-8 text-primary" />
                ) : (
                  <Upload className={cn("h-8 w-8 transition-colors", isDragActive ? "text-primary" : "text-muted-foreground")} />
                )}
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
                  <p className="text-xs text-muted-foreground mt-2">
                    PDF or DOCX · Max 10MB
                  </p>
                </div>
              )}
            </div>

            {file && (
              <button
                onClick={(e) => { e.stopPropagation(); removeFile(); }}
                className="absolute top-3 right-3 rounded-full p-1.5 bg-muted hover:bg-muted/80 transition-colors"
              >
                <X className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            )}
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 flex items-center gap-2 text-sm text-destructive"
            >
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </motion.div>
          )}

          {/* Supported formats */}
          <div className="mt-4 flex items-center gap-2 flex-wrap">
            <span className="text-xs text-muted-foreground">Supported:</span>
            <Badge variant="outline" className="text-xs">PDF</Badge>
            <Badge variant="outline" className="text-xs">DOCX</Badge>
            <Badge variant="outline" className="text-xs">DOC</Badge>
          </div>

          {/* Upload button */}
          <div className="mt-6">
            <Button
              onClick={handleUpload}
              disabled={!file || state === "uploading"}
              variant="gradient"
              size="lg"
              className="w-full"
            >
              {state === "uploading" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading & extracting text...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Resume
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
