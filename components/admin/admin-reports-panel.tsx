"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Flag, Clock, CheckCircle, AlertCircle, MessageSquare, Trash2,
  Plus, X, ChevronDown, ChevronUp,
} from "lucide-react";

interface Report {
  id: string;
  type: string;
  title: string;
  description: string;
  contactPhone: string | null;
  userName: string | null;
  userEmail: string | null;
  status: string;
  adminNote: string | null;
  createdAt: string;
}

const TYPE_COLORS: Record<string, string> = {
  bug:         "text-red-400 bg-red-500/10 border-red-500/20",
  feature:     "text-amber-400 bg-amber-500/10 border-amber-500/20",
  performance: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  ux:          "text-purple-400 bg-purple-500/10 border-purple-500/20",
  other:       "text-muted-foreground bg-muted/30 border-border/40",
};

const TYPE_NAMES: Record<string, string> = {
  bug: "Bug", feature: "Feature", performance: "Performance", ux: "UI/UX", other: "Other",
};

const STATUS_STYLES: Record<string, string> = {
  new:         "text-red-400 bg-red-500/10 border-red-500/20",
  in_progress: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  resolved:    "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
};

const STATUS_LABELS: Record<string, string> = {
  new: "New", in_progress: "In Progress", resolved: "Resolved",
};

export function AdminReportsPanel({ initialReports }: { initialReports: Report[] }) {
  const [reports, setReports] = useState<Report[]>(initialReports);
  const [noteEdit, setNoteEdit] = useState<Record<string, string>>({});
  const [noteOpen, setNoteOpen] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newReport, setNewReport] = useState({ type: "other", title: "", description: "", adminNote: "" });
  const [creating, setCreating] = useState(false);

  const updateReport = async (id: string, patch: Record<string, unknown>) => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/reports/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (res.ok) {
        const { report } = await res.json();
        setReports(prev => prev.map(r => r.id === id ? { ...r, ...report } : r));
      }
    } finally {
      setActionLoading(null);
    }
  };

  const deleteReport = async (id: string) => {
    if (!confirm("Delete this report?")) return;
    setActionLoading(id + "del");
    try {
      const res = await fetch(`/api/admin/reports/${id}`, { method: "DELETE" });
      if (res.ok) setReports(prev => prev.filter(r => r.id !== id));
    } finally {
      setActionLoading(null);
    }
  };

  const createReport = async () => {
    if (!newReport.title || !newReport.description) return;
    setCreating(true);
    try {
      const res = await fetch("/api/admin/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newReport),
      });
      if (res.ok) {
        const { report } = await res.json();
        setReports(prev => [{ ...report, createdAt: report.createdAt ?? new Date().toISOString() }, ...prev]);
        setNewReport({ type: "other", title: "", description: "", adminNote: "" });
        setShowNewForm(false);
      }
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* New report button */}
      <div className="flex justify-end">
        <Button
          variant={showNewForm ? "outline" : "gradient"}
          size="sm"
          onClick={() => setShowNewForm(v => !v)}
        >
          {showNewForm ? <X className="h-3.5 w-3.5 mr-1.5" /> : <Plus className="h-3.5 w-3.5 mr-1.5" />}
          {showNewForm ? "Cancel" : "Add Issue"}
        </Button>
      </div>

      {/* New report form */}
      {showNewForm && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-5 space-y-3">
            <p className="text-sm font-semibold">Add New Issue / Note</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Type</label>
                <select
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  value={newReport.type}
                  onChange={e => setNewReport(p => ({ ...p, type: e.target.value }))}
                >
                  {Object.entries(TYPE_NAMES).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Title *</label>
                <input
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Short issue title..."
                  value={newReport.title}
                  onChange={e => setNewReport(p => ({ ...p, title: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Description *</label>
              <textarea
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                rows={3}
                placeholder="Describe the issue or note..."
                value={newReport.description}
                onChange={e => setNewReport(p => ({ ...p, description: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Admin note (optional)</label>
              <input
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="Internal note..."
                value={newReport.adminNote}
                onChange={e => setNewReport(p => ({ ...p, adminNote: e.target.value }))}
              />
            </div>
            <Button
              onClick={createReport}
              disabled={!newReport.title || !newReport.description || creating}
              variant="gradient"
              size="sm"
            >
              {creating ? "Creating..." : "Create Issue"}
            </Button>
          </CardContent>
        </Card>
      )}

      {reports.length === 0 && !showNewForm && (
        <Card className="border-border/50 bg-card/30">
          <CardContent className="py-14 text-center">
            <Flag className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No reports yet.</p>
            <p className="text-xs text-muted-foreground/60 mt-1">User-submitted reports and admin issues appear here.</p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {reports.map((report) => (
          <Card
            key={report.id}
            className={`border-border/50 bg-card/30 ${report.status === "new" ? "border-l-4 border-l-red-400" : report.status === "in_progress" ? "border-l-4 border-l-amber-400" : ""}`}
          >
            <CardContent className="p-5">
              {/* Header row */}
              <div className="flex items-start justify-between gap-4 mb-3 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${TYPE_COLORS[report.type] ?? TYPE_COLORS.other}`}>
                    {TYPE_NAMES[report.type] ?? report.type}
                  </span>
                  <h3 className="text-sm font-semibold text-foreground">{report.title}</h3>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(report.createdAt).toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                  <button
                    onClick={() => deleteReport(report.id)}
                    disabled={actionLoading === report.id + "del"}
                    className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed mb-3">{report.description}</p>

              {/* User info */}
              {(report.userName || report.userEmail || report.contactPhone) && (
                <div className="flex items-center gap-4 text-xs text-muted-foreground border-t border-border/20 pt-3 mb-3 flex-wrap">
                  {report.userName && <span><strong>Name:</strong> {report.userName}</span>}
                  {report.userEmail && <span><strong>Email:</strong> {report.userEmail}</span>}
                  {report.contactPhone && <span><strong>Phone:</strong> {report.contactPhone}</span>}
                </div>
              )}

              {/* Admin note (display) */}
              {report.adminNote && noteOpen !== report.id && (
                <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2 mb-3">
                  <p className="text-xs text-amber-400 font-medium mb-0.5">Admin note:</p>
                  <p className="text-xs text-muted-foreground">{report.adminNote}</p>
                </div>
              )}

              {/* Admin note edit */}
              {noteOpen === report.id && (
                <div className="mb-3 space-y-2">
                  <textarea
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                    rows={2}
                    placeholder="Add admin note..."
                    value={noteEdit[report.id] ?? report.adminNote ?? ""}
                    onChange={e => setNoteEdit(p => ({ ...p, [report.id]: e.target.value }))}
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs"
                      onClick={() => {
                        updateReport(report.id, { adminNote: noteEdit[report.id] ?? "" });
                        setNoteOpen(null);
                      }}
                      disabled={!!actionLoading}
                    >
                      Save Note
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setNoteOpen(null)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* Actions row */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Status buttons */}
                {(["new", "in_progress", "resolved"] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => updateReport(report.id, { status: s })}
                    disabled={report.status === s || !!actionLoading}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all disabled:opacity-40 ${
                      report.status === s
                        ? STATUS_STYLES[s]
                        : "border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {s === "new" && <AlertCircle className="h-3 w-3" />}
                    {s === "in_progress" && <Clock className="h-3 w-3" />}
                    {s === "resolved" && <CheckCircle className="h-3 w-3" />}
                    {STATUS_LABELS[s]}
                  </button>
                ))}

                <button
                  onClick={() => {
                    setNoteEdit(p => ({ ...p, [report.id]: report.adminNote ?? "" }));
                    setNoteOpen(noteOpen === report.id ? null : report.id);
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border border-border text-muted-foreground hover:text-foreground transition-all ml-auto"
                >
                  <MessageSquare className="h-3 w-3" />
                  {report.adminNote ? "Edit Note" : "Add Note"}
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
