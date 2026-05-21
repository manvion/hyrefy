"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, ExternalLink, Loader2, AlertTriangle, Users, Sparkles, ChevronDown, ChevronUp } from "lucide-react";

type EmailFilter = "all" | "premium" | "free" | "active_30d";

const FILTER_LABELS: Record<EmailFilter, string> = {
  all: "All users",
  premium: "Premium users only",
  free: "Free users only",
  active_30d: "Active in last 30 days",
};

interface EmailTemplate {
  id: string;
  label: string;
  emoji: string;
  category: string;
  subject: string;
  body: string;
}

const EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: "promo_limited",
    label: "Limited-Time Offer",
    emoji: "🎉",
    category: "Promotion",
    subject: "Exclusive offer: Upgrade to Hyrefy Premium today",
    body: `Hi there,

We're offering an exclusive limited-time deal for Hyrefy users — upgrade to Premium and unlock unlimited resume improvements, cover letters, and interview prep.

✅ Unlimited AI resume tailoring (all 9 countries)
✅ Unlimited cover letter generation
✅ Unlimited interview prep with personalized answers
✅ ATS score analysis & keyword matching

This offer won't last long. Click below to upgrade now:
👉 https://hyrefy.com/billing

Questions? Just reply to this email.

Best,
The Hyrefy Team`,
  },
  {
    id: "feature_announcement",
    label: "New Feature",
    emoji: "✨",
    category: "Announcement",
    subject: "New on Hyrefy: [Feature Name]",
    body: `Hi there,

We just launched something we think you'll love.

🚀 [Feature Name]
[Short description of what it does and why it's useful]

How to try it:
1. Go to your Hyrefy dashboard
2. [Step 2]
3. [Step 3]

Try it now: https://hyrefy.com/dashboard

As always, we'd love your feedback — just reply to this email.

Best,
The Hyrefy Team`,
  },
  {
    id: "maintenance",
    label: "Scheduled Maintenance",
    emoji: "🔧",
    category: "Downtime",
    subject: "Hyrefy maintenance scheduled for [Date] — [Time]",
    body: `Hi there,

We're performing scheduled maintenance to improve Hyrefy's performance and reliability.

🔧 Maintenance Window
Date: [Date]
Time: [Start Time] – [End Time] [Timezone]
Expected downtime: [Duration]

During this time, the app may be temporarily unavailable. We recommend completing any active sessions before then.

We apologize for any inconvenience and appreciate your patience.

If you have questions, reply to this email.

Best,
The Hyrefy Team`,
  },
  {
    id: "downtime_resolved",
    label: "Service Restored",
    emoji: "✅",
    category: "Downtime",
    subject: "Hyrefy is back online — all systems operational",
    body: `Hi there,

We're happy to let you know that Hyrefy is fully back online after our maintenance window.

✅ All services restored
✅ Faster performance improvements deployed
✅ No data was affected

If you experience any issues, please don't hesitate to reach out.

Thank you for your patience!

Best,
The Hyrefy Team`,
  },
  {
    id: "security_alert",
    label: "Security Notice",
    emoji: "🔐",
    category: "Alert",
    subject: "Important security notice from Hyrefy",
    body: `Hi there,

We're writing to inform you of an important security update regarding your Hyrefy account.

[Describe the security matter clearly and factually]

What you should do:
• [Action 1 — e.g., change your password]
• [Action 2]
• [Action 3 if needed]

Your data security is our top priority. If you have any questions or concerns, please reply to this email immediately.

Best,
The Hyrefy Security Team`,
  },
  {
    id: "welcome_back",
    label: "Win-Back",
    emoji: "👋",
    category: "Re-engagement",
    subject: "We miss you at Hyrefy — here's what's new",
    body: `Hi there,

It's been a while! We wanted to check in and share what's been happening at Hyrefy since you last visited.

Here's what's new:
🆕 Country-specific resume formatting (9 countries supported)
🆕 AI Interview Prep with personalized answers based on YOUR resume
🆕 Resume Roast — brutal honest feedback on your resume
🆕 Improved ATS scoring and keyword matching

Your resume is waiting. Come back and give your job search a boost:
👉 https://hyrefy.com/dashboard

See you soon,
The Hyrefy Team`,
  },
  {
    id: "survey",
    label: "Feedback Survey",
    emoji: "📋",
    category: "Survey",
    subject: "Quick question: how is Hyrefy working for you?",
    body: `Hi there,

We're constantly working to improve Hyrefy, and your feedback means everything to us.

Could you spare 2 minutes to answer a quick question?

👉 What's the #1 thing we could do to make Hyrefy better for you?

Just reply directly to this email with your thoughts. We read every response.

Thank you for being part of Hyrefy!

Best,
The Hyrefy Team`,
  },
  {
    id: "monthly_newsletter",
    label: "Monthly Update",
    emoji: "📰",
    category: "Newsletter",
    subject: "Hyrefy Monthly Update — [Month Year]",
    body: `Hi there,

Here's your monthly roundup of what's new at Hyrefy.

📊 This Month's Highlights
• [Highlight 1]
• [Highlight 2]
• [Highlight 3]

🚀 Coming Soon
• [Upcoming feature 1]
• [Upcoming feature 2]

💡 Job Search Tip of the Month
[One actionable tip for job seekers]

As always, your feedback shapes what we build next. Reply to this email with your thoughts.

Best,
The Hyrefy Team`,
  },
];

const CATEGORIES = [...new Set(EMAIL_TEMPLATES.map(t => t.category))];

export function AdminEmailPanel() {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [filter, setFilter] = useState<EmailFilter>("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recipientCount, setRecipientCount] = useState<number | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [showTemplates, setShowTemplates] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const applyTemplate = (t: EmailTemplate) => {
    setSubject(t.subject);
    setBody(t.body);
    setSelectedTemplate(t.id);
    setShowTemplates(false);
    setRecipientCount(null);
    setError(null);
  };

  const openMailto = async () => {
    setLoading(true);
    setError(null);
    setRecipientCount(null);

    try {
      const emails: string[] = [];
      let page = 1;
      let pages = 1;
      do {
        const params = new URLSearchParams({ filter, page: String(page) });
        const res = await fetch(`/api/admin/users?${params}`);
        if (!res.ok) throw new Error("Failed to fetch recipients");
        const data = await res.json();
        pages = data.pages;
        for (const u of data.users) {
          if (u.email && !u.isBlocked) emails.push(u.email);
        }
        page++;
      } while (page <= pages && page <= 10);

      if (emails.length === 0) {
        setError("No recipients found for this filter.");
        return;
      }

      setRecipientCount(emails.length);
      const bcc = emails.join(",");
      const mailtoUrl = `mailto:?bcc=${encodeURIComponent(bcc)}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.location.href = mailtoUrl;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const visibleTemplates = activeCategory
    ? EMAIL_TEMPLATES.filter(t => t.category === activeCategory)
    : EMAIL_TEMPLATES;

  const activeTemplateObj = selectedTemplate ? EMAIL_TEMPLATES.find(t => t.id === selectedTemplate) : null;

  return (
    <div className="space-y-5">
      {/* Template picker */}
      <Card className="border-border/50 bg-card/30">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-violet-400" />
              Email Templates
            </CardTitle>
            <button
              onClick={() => setShowTemplates(v => !v)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {showTemplates ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              {showTemplates ? "Hide" : "Show"}
            </button>
          </div>
        </CardHeader>
        {showTemplates && (
          <CardContent className="pt-0 space-y-3">
            {/* Category filters */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveCategory(null)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  !activeCategory
                    ? "bg-primary/15 text-primary border border-primary/30"
                    : "border border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                All
              </button>
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                    activeCategory === cat
                      ? "bg-primary/15 text-primary border border-primary/30"
                      : "border border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Template grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {visibleTemplates.map(t => (
                <button
                  key={t.id}
                  onClick={() => applyTemplate(t)}
                  className={`flex flex-col items-start gap-1 p-3 rounded-xl border text-left transition-all hover:border-primary/40 hover:bg-primary/5 ${
                    selectedTemplate === t.id
                      ? "border-primary/40 bg-primary/8 ring-1 ring-primary/20"
                      : "border-border/50 bg-background/50"
                  }`}
                >
                  <span className="text-xl leading-none">{t.emoji}</span>
                  <span className="text-xs font-medium text-foreground">{t.label}</span>
                  <span className="text-[10px] text-muted-foreground">{t.category}</span>
                </button>
              ))}
            </div>

            {activeTemplateObj && (
              <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-3 py-2 text-xs text-emerald-400">
                <span>{activeTemplateObj.emoji}</span>
                <span className="font-medium">{activeTemplateObj.label}</span> template loaded — edit below as needed.
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Compose */}
      <Card className="border-border/50 bg-card/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Mail className="h-4 w-4 text-primary" />
            Compose & Send
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 px-4 py-3 text-xs text-blue-400">
            Recipients are loaded as BCC in your default email client so you can review and edit before sending.
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
            <label className="text-xs text-muted-foreground mb-1 block">Subject</label>
            <input
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="Subject line..."
              value={subject}
              onChange={e => setSubject(e.target.value)}
            />
          </div>

          {/* Body */}
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Body</label>
            <textarea
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              rows={10}
              placeholder={`Hi,\n\nWe have exciting news...\n\nBest,\nThe Hyrefy Team`}
              value={body}
              onChange={e => setBody(e.target.value)}
            />
          </div>

          {error && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {recipientCount !== null && !error && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-400 flex items-center gap-2">
              <Users className="h-4 w-4 shrink-0" />
              Opened email client with {recipientCount} recipient{recipientCount !== 1 ? "s" : ""} in BCC.
            </div>
          )}

          <Button
            onClick={openMailto}
            disabled={loading || !subject.trim()}
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
            Blocked users are always excluded. Your email client opens with recipients pre-filled in BCC.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
