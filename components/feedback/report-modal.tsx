"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { X, Loader2, CheckCircle2, Bug, Lightbulb, Zap, Palette, HelpCircle } from "lucide-react";

const TYPES = [
  { value: "bug",         label: "Bug",         icon: "🐛", color: "border-red-400/40 bg-red-500/10 text-red-400"         },
  { value: "feature",     label: "Feature",     icon: "💡", color: "border-amber-400/40 bg-amber-500/10 text-amber-400"   },
  { value: "performance", label: "Performance", icon: "⚡", color: "border-blue-400/40 bg-blue-500/10 text-blue-400"       },
  { value: "ux",          label: "Design",      icon: "🎨", color: "border-purple-400/40 bg-purple-500/10 text-purple-400" },
  { value: "other",       label: "Other",       icon: "💬", color: "border-border/60 bg-muted/30 text-muted-foreground"   },
] as const;

type ReportType = typeof TYPES[number]["value"];

interface Props {
  userName: string;
  userEmail: string;
  userId: string;
  onClose: () => void;
}

const inputCls = "w-full rounded-xl border border-border/60 bg-background/80 text-foreground placeholder:text-muted-foreground px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all";

export function ReportModal({ userName, userEmail, userId, onClose }: Props) {
  const [type, setType]               = useState<ReportType>("bug");
  const [description, setDescription] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [submitting, setSubmitting]   = useState(false);
  const [done, setDone]               = useState(false);

  const handleSubmit = async () => {
    if (!description.trim() || submitting) return;
    setSubmitting(true);

    try {
      await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          title: TYPES.find(t => t.value === type)?.label ?? type,
          description: description.trim(),
          contactPhone: contactPhone.trim() || null,
          userName,
          userEmail,
          userId,
        }),
      });
    } catch {
      // ignore — show success regardless
    } finally {
      setSubmitting(false);
      setDone(true);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal card */}
      <div
        className="relative z-10 w-full max-w-md rounded-2xl border border-border/50 bg-card shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {done ? (
          /* ── Success state ── */
          <div className="flex flex-col items-center justify-center py-12 px-8 text-center">
            <div className="text-6xl mb-4">✅</div>
            <h3 className="text-xl font-bold text-foreground mb-3">Thank you for your report!</h3>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              We&apos;ve received your message and will get back to you as soon as possible. Your feedback helps us improve Hyrefy.
            </p>
            <Button onClick={onClose} variant="gradient" className="mt-7 px-8" size="lg">
              Close
            </Button>
          </div>
        ) : (
          <>
            {/* ── Header ── */}
            <div className="relative bg-gradient-to-br from-primary/10 via-primary/5 to-transparent px-6 pt-6 pb-5 border-b border-border/30">
              <button
                type="button"
                onClick={onClose}
                className="absolute top-4 right-4 h-8 w-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="flex items-center gap-3">
                <div className="text-4xl">🐛</div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">Report an Issue</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">We review every report — usually reply within 24 h</p>
                </div>
              </div>
            </div>

            {/* ── Form ── */}
            <div className="p-6 space-y-5">

              {/* Type */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">What kind of issue?</p>
                <div className="grid grid-cols-5 gap-2">
                  {TYPES.map(({ value, label, icon, color }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setType(value)}
                      className={cn(
                        "flex flex-col items-center gap-1.5 py-2.5 px-1 rounded-xl border text-[11px] font-semibold transition-all duration-150 active:scale-[0.95]",
                        type === value
                          ? `${color} ring-2 ring-current/20 scale-[1.04]`
                          : "border-border/30 text-muted-foreground hover:border-border hover:bg-muted/30"
                      )}
                    >
                      <span className="text-xl leading-none">{icon}</span>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2 block">
                  Describe the issue <span className="text-primary">*</span>
                </label>
                <textarea
                  className={cn(inputCls, "resize-none")}
                  rows={4}
                  placeholder="What happened? What did you expect? Any steps to reproduce…"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  autoFocus
                />
                {description.trim().length === 0 && (
                  <p className="text-[11px] text-muted-foreground/70 mt-1">Required to submit</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2 block">
                  Phone / Alternative contact <span className="text-muted-foreground font-normal normal-case">(optional)</span>
                </label>
                <input
                  type="tel"
                  className={inputCls}
                  placeholder="+1 514 000 0000"
                  value={contactPhone}
                  onChange={e => setContactPhone(e.target.value)}
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-1">
                <Button type="button" variant="outline" onClick={onClose} className="flex-1 h-11">
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="gradient"
                  className="flex-1 h-11 text-base font-semibold"
                  onClick={handleSubmit}
                  disabled={submitting || !description.trim()}
                >
                  {submitting
                    ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending…</>
                    : <><span className="mr-1">🚀</span> Submit Report</>
                  }
                </Button>
              </div>

              <p className="text-[11px] text-muted-foreground/60 text-center">
                Reporting as <strong className="text-muted-foreground">{userEmail}</strong>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
