"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { X, Loader2, CheckCircle2, Bug, Lightbulb, Zap, Palette, HelpCircle } from "lucide-react";

const TYPES = [
  { value: "bug",         label: "Bug Report",         icon: Bug,         color: "text-red-400 bg-red-500/10 border-red-500/20" },
  { value: "feature",     label: "Feature Request",    icon: Lightbulb,   color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
  { value: "performance", label: "Performance",        icon: Zap,         color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
  { value: "ux",          label: "UI / Design",        icon: Palette,     color: "text-purple-400 bg-purple-500/10 border-purple-500/20" },
  { value: "other",       label: "Other",              icon: HelpCircle,  color: "text-muted-foreground bg-muted/40 border-border/50" },
] as const;

type ReportType = typeof TYPES[number]["value"];

interface Props {
  userName: string;
  userEmail: string;
  userId: string;
  onClose: () => void;
}

const fieldCls = "w-full rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition";

export function ReportModal({ userName, userEmail, userId, onClose }: Props) {
  const [type, setType] = useState<ReportType>("bug");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, title, description, contactPhone, userName, userEmail, userId }),
      });
      if (!res.ok) throw new Error("Failed to send");
      setDone(true);
    } catch {
      setError("Could not send your report. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="relative w-full max-w-lg rounded-2xl border border-border/50 bg-card shadow-2xl pointer-events-auto overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border/40">
            <div>
              <h2 className="text-base font-bold text-foreground">Report an Issue or Idea</h2>
              <p className="text-xs text-muted-foreground mt-0.5">We review every report and usually respond within 24 hours</p>
            </div>
            <button
              onClick={onClose}
              className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {done ? (
            <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
              <div className="h-14 w-14 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mb-4">
                <CheckCircle2 className="h-7 w-7 text-emerald-400" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">Report sent!</h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                Thank you for your feedback. We&apos;ve received your report and will look into it.
              </p>
              <Button onClick={onClose} variant="outline" className="mt-6" size="sm">Close</Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">

              {/* Type selector */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Type</p>
                <div className="grid grid-cols-5 gap-1.5">
                  {TYPES.map(({ value, label, icon: Icon, color }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setType(value)}
                      className={cn(
                        "flex flex-col items-center gap-1.5 p-2 rounded-xl border text-[11px] font-medium transition-all duration-150 active:scale-[0.97]",
                        type === value
                          ? `${color} ring-1 ring-current/30`
                          : "border-border/40 text-muted-foreground hover:border-border hover:text-foreground"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="text-center leading-tight">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">
                  Summary <span className="text-muted-foreground font-normal normal-case">(optional)</span>
                </label>
                <input
                  className={fieldCls}
                  placeholder="Brief one-line description (auto-filled from type if left blank)"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">
                  Details <span className="text-primary">*</span>
                </label>
                <textarea
                  className={cn(fieldCls, "resize-none")}
                  rows={5}
                  placeholder="Describe what happened, what you expected, and steps to reproduce..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  required
                />
              </div>

              {/* Contact */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">
                  Phone / Alternative Contact <span className="text-muted-foreground font-normal normal-case">(optional)</span>
                </label>
                <input
                  className={fieldCls}
                  placeholder="+1 514 000 0000"
                  value={contactPhone}
                  onChange={e => setContactPhone(e.target.value)}
                  type="tel"
                />
                <p className="text-[11px] text-muted-foreground mt-1">We&apos;ll use your account email by default</p>
              </div>

              {error && (
                <div className="rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
                <Button
                  type="submit"
                  variant="gradient"
                  className="flex-1"
                  disabled={submitting || !description.trim()}
                >
                  {submitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Sending…</> : "Submit Report"}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
