"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, ExternalLink, Loader2, AlertTriangle, Users } from "lucide-react";

type EmailFilter = "all" | "premium" | "free" | "active_30d";

const FILTER_LABELS: Record<EmailFilter, string> = {
  all: "All users",
  premium: "Premium users only",
  free: "Free users only",
  active_30d: "Active in last 30 days",
};

export function AdminEmailPanel() {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [filter, setFilter] = useState<EmailFilter>("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recipientCount, setRecipientCount] = useState<number | null>(null);

  const openMailto = async () => {
    setLoading(true);
    setError(null);
    setRecipientCount(null);

    try {
      // Fetch matching user emails
      const params = new URLSearchParams({ filter, page: "1" });
      // Get all users for the filter (no search, large limit via multiple pages if needed)
      const emails: string[] = [];
      let page = 1;
      let pages = 1;
      do {
        params.set("page", String(page));
        const res = await fetch(`/api/admin/users?${params}`);
        if (!res.ok) throw new Error("Failed to fetch recipients");
        const data = await res.json();
        pages = data.pages;
        for (const u of data.users) {
          if (u.email && !u.isBlocked) emails.push(u.email);
        }
        page++;
      } while (page <= pages && page <= 10); // cap at 250 emails (10 pages × 25)

      if (emails.length === 0) {
        setError("No recipients found for this filter.");
        return;
      }

      setRecipientCount(emails.length);

      // Build mailto with BCC
      const bcc = emails.join(",");
      const mailtoUrl = `mailto:?bcc=${encodeURIComponent(bcc)}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

      // Open default email client
      window.location.href = mailtoUrl;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-border/50 bg-card/30">
      <CardHeader>
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Mail className="h-4 w-4 text-primary" />
          Bulk Email via Your Email Client
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 px-4 py-3 text-xs text-blue-400">
          Recipients are loaded as BCC in your default email client (Outlook, Gmail, Apple Mail, etc.) so you can review and edit before sending.
        </div>

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
          <label className="text-xs text-muted-foreground mb-1 block">Subject (optional — editable in your email client)</label>
          <input
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="Subject line..."
            value={subject}
            onChange={e => setSubject(e.target.value)}
          />
        </div>

        {/* Body */}
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Body (optional — editable in your email client)</label>
          <textarea
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
            rows={6}
            placeholder={`Hi,\n\nWe have exciting news...\n\nBest,\nThe Hyrefy Team`}
            value={body}
            onChange={e => setBody(e.target.value)}
          />
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Recipient count feedback */}
        {recipientCount !== null && !error && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-400 flex items-center gap-2">
            <Users className="h-4 w-4 shrink-0" />
            Opened email client with {recipientCount} recipient{recipientCount !== 1 ? "s" : ""} in BCC.
          </div>
        )}

        <Button
          onClick={openMailto}
          disabled={loading}
          variant="gradient"
          className="w-full"
        >
          {loading ? (
            <><Loader2 className="h-4 w-4 animate-spin mr-2" />Loading recipients...</>
          ) : (
            <><ExternalLink className="h-4 w-4 mr-2" />Open in Email Client</>
          )}
        </Button>
        <p className="text-[11px] text-muted-foreground text-center">
          Blocked users are always excluded. Your email client opens with all recipients pre-filled in BCC.
        </p>
      </CardContent>
    </Card>
  );
}
