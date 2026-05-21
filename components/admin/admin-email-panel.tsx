"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Send, CheckCircle, AlertTriangle } from "lucide-react";

type EmailFilter = "all" | "premium" | "free" | "active_30d";

export function AdminEmailPanel() {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [filter, setFilter] = useState<EmailFilter>("all");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ sent?: number; failed?: number; total?: number; error?: string } | null>(null);

  const FILTER_LABELS: Record<EmailFilter, string> = {
    all: "All users",
    premium: "Premium users only",
    free: "Free users only",
    active_30d: "Active in last 30 days",
  };

  const handleSend = async () => {
    if (!subject.trim() || !body.trim()) return;
    if (!confirm(`Send email to ${FILTER_LABELS[filter]}?`)) return;

    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/admin/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, htmlBody: body.replace(/\n/g, "<br/>"), filter }),
      });
      const json = await res.json();
      setResult(json);
      if (res.ok) { setSubject(""); setBody(""); }
    } catch {
      setResult({ error: "Network error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-border/50 bg-card/30">
      <CardHeader>
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Mail className="h-4 w-4 text-primary" />
          Bulk Email Blast
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filter */}
        <div>
          <label className="text-xs text-muted-foreground mb-1.5 block">Recipients</label>
          <div className="flex flex-wrap gap-2">
            {(Object.entries(FILTER_LABELS) as [EmailFilter, string][]).map(([val, label]) => (
              <button
                key={val}
                onClick={() => setFilter(val)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  filter === val
                    ? "bg-primary/15 text-primary border border-primary/30"
                    : "border border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Subject */}
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Subject *</label>
          <input
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="Email subject line..."
            value={subject}
            onChange={e => setSubject(e.target.value)}
          />
        </div>

        {/* Body */}
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Message body (plain text / HTML) *</label>
          <textarea
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none font-mono"
            rows={8}
            placeholder={`Hi there,\n\nWe have exciting news for you...\n\nBest regards,\nThe Hyrefy Team`}
            value={body}
            onChange={e => setBody(e.target.value)}
          />
        </div>

        {/* Result */}
        {result && (
          <div className={`rounded-xl border px-4 py-3 text-sm flex items-start gap-2 ${
            result.error
              ? "border-destructive/30 bg-destructive/5 text-destructive"
              : "border-emerald-500/30 bg-emerald-500/5 text-emerald-400"
          }`}>
            {result.error
              ? <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              : <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" />
            }
            <div>
              {result.error
                ? result.error
                : `Sent to ${result.sent}/${result.total} recipients${result.failed ? ` (${result.failed} failed)` : ""}`
              }
            </div>
          </div>
        )}

        <Button
          onClick={handleSend}
          disabled={!subject.trim() || !body.trim() || loading}
          variant="gradient"
          className="w-full"
        >
          {loading ? (
            <><div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />Sending...</>
          ) : (
            <><Send className="h-4 w-4 mr-2" />Send Email</>
          )}
        </Button>
        <p className="text-[11px] text-muted-foreground text-center">
          Blocked users are always excluded. Emails sent via Resend in batches of 50.
        </p>
      </CardContent>
    </Card>
  );
}
