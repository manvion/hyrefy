"use client";

import { useState, useCallback } from "react";
import { useDropzone, type FileRejection } from "react-dropzone";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/toaster";
import { Upload, FileText, X, CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type UploadState = "idle" | "uploading" | "parsing" | "done" | "error";

export function ResumeUpload() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [state, setState] = useState<UploadState>("idle");
  const [error, setError] = useState<string>("");
  const [_resumeId, setResumeId] = useState<string>("");

  const onDrop = useCallback((accepted: File[], rejected: FileRejection[]) => {
    setError("");
    if (rejected.length > 0) {
      setError(rejected[0].errors[0].message);
      return;
    }
    if (accepted.length > 0) {
      setFile(accepted[0]);
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

      setState("parsing");
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
      setState("done");

      toast({ title: "Resume uploaded!", description: "Your resume has been parsed and is ready to analyze.", variant: "success" });

      setTimeout(() => router.push(`/analyze?resumeId=${data.resumeId}`), 1200);
    } catch (err) {
      setState("error");
      setError(err instanceof Error ? err.message : "Upload failed");
      toast({ title: "Upload failed", description: error, variant: "destructive" });
    }
  };

  const removeFile = () => {
    setFile(null);
    setState("idle");
    setError("");
  };

  return (
    <div className="space-y-6">
      <AnimatePresence mode="wait">
        {state === "done" ? (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-10 text-center"
          >
            <CheckCircle className="h-12 w-12 text-emerald-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-1">Resume uploaded!</h3>
            <p className="text-muted-foreground text-sm">Redirecting to analysis...</p>
          </motion.div>
        ) : (
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
                disabled={!file || state === "uploading" || state === "parsing"}
                variant="gradient"
                size="lg"
                className="w-full"
              >
                {state === "uploading" || state === "parsing" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {state === "parsing" ? "Parsing resume with AI..." : "Uploading..."}
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload & Parse Resume
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
