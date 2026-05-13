"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Building2, MapPin, DollarSign, ExternalLink, Trash2, ChevronDown, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";

type AppStatus =
  | "WISHLIST" | "APPLIED" | "PHONE_SCREEN" | "INTERVIEW"
  | "TECHNICAL" | "FINAL_ROUND" | "OFFER" | "REJECTED" | "WITHDRAWN" | "GHOSTED";

interface Application {
  id: string;
  company: string;
  jobTitle: string;
  jobUrl?: string | null;
  location?: string | null;
  salary?: string | null;
  currency?: string | null;
  status: AppStatus;
  notes?: string | null;
  appliedAt?: string | null;
  createdAt: string;
}

const COLUMNS: { status: AppStatus; label: string; color: string; bg: string; dot: string }[] = [
  { status: "WISHLIST",     label: "Wishlist",      color: "text-slate-400",   bg: "bg-slate-500/10",   dot: "bg-slate-400" },
  { status: "APPLIED",      label: "Applied",       color: "text-blue-400",    bg: "bg-blue-500/10",    dot: "bg-blue-400" },
  { status: "PHONE_SCREEN", label: "Phone Screen",  color: "text-cyan-400",    bg: "bg-cyan-500/10",    dot: "bg-cyan-400" },
  { status: "INTERVIEW",    label: "Interview",     color: "text-violet-400",  bg: "bg-violet-500/10",  dot: "bg-violet-400" },
  { status: "TECHNICAL",    label: "Technical",     color: "text-amber-400",   bg: "bg-amber-500/10",   dot: "bg-amber-400" },
  { status: "FINAL_ROUND",  label: "Final Round",   color: "text-orange-400",  bg: "bg-orange-500/10",  dot: "bg-orange-400" },
  { status: "OFFER",        label: "Offer",         color: "text-emerald-400", bg: "bg-emerald-500/10", dot: "bg-emerald-400" },
  { status: "REJECTED",     label: "Rejected",      color: "text-red-400",     bg: "bg-red-500/10",     dot: "bg-red-400" },
];

const ALL_STATUSES = [...COLUMNS,
  { status: "WITHDRAWN" as AppStatus, label: "Withdrawn", color: "text-slate-400", bg: "bg-slate-500/10", dot: "bg-slate-400" },
  { status: "GHOSTED" as AppStatus,   label: "Ghosted",   color: "text-slate-400", bg: "bg-slate-500/10", dot: "bg-slate-400" },
];

interface KanbanBoardProps {
  initialApplications: Application[];
}

export function KanbanBoard({ initialApplications }: KanbanBoardProps) {
  const [applications, setApplications] = useState<Application[]>(initialApplications);
  const [showAddModal, setShowAddModal] = useState(false);
  const [defaultStatus, setDefaultStatus] = useState<AppStatus>("WISHLIST");
  const [editingApp, setEditingApp] = useState<Application | null>(null);
  const [movingId, setMovingId] = useState<string | null>(null);

  const openAdd = (status: AppStatus) => {
    setDefaultStatus(status);
    setEditingApp(null);
    setShowAddModal(true);
  };

  const handleSave = async (data: Partial<Application>) => {
    if (editingApp) {
      const res = await fetch(`/api/applications/${editingApp.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const { application } = await res.json();
        setApplications(prev => prev.map(a => a.id === editingApp.id ? application : a));
      }
    } else {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, status: defaultStatus }),
      });
      if (res.ok) {
        const { application } = await res.json();
        setApplications(prev => [application, ...prev]);
      }
    }
    setShowAddModal(false);
    setEditingApp(null);
  };

  const handleMove = useCallback(async (id: string, newStatus: AppStatus) => {
    setMovingId(id);
    setApplications(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
    await fetch(`/api/applications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    setMovingId(null);
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    setApplications(prev => prev.filter(a => a.id !== id));
    await fetch(`/api/applications/${id}`, { method: "DELETE" });
  }, []);

  return (
    <div className="h-full flex flex-col">
      {/* Stats row */}
      <div className="flex items-center gap-6 mb-6 flex-shrink-0">
        <div className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{applications.length}</span> applications tracked
        </div>
        {COLUMNS.filter(c => c.status === "OFFER" || c.status === "INTERVIEW" || c.status === "APPLIED").map(col => {
          const count = applications.filter(a => a.status === col.status).length;
          return (
            <div key={col.status} className="flex items-center gap-1.5 text-sm">
              <div className={`h-2 w-2 rounded-full ${col.dot}`} />
              <span className={col.color}>{col.label}</span>
              <span className="font-semibold">{count}</span>
            </div>
          );
        })}
        <Button size="sm" onClick={() => openAdd("WISHLIST")} className="ml-auto">
          <Plus className="h-4 w-4 mr-1.5" /> Add Application
        </Button>
      </div>

      {/* Kanban board */}
      <div className="flex gap-4 overflow-x-auto pb-4 flex-1">
        {COLUMNS.map((col) => {
          const colApps = applications.filter(a => a.status === col.status);
          return (
            <div key={col.status} className="flex flex-col w-64 shrink-0">
              {/* Column header */}
              <div className={`flex items-center justify-between px-3 py-2 rounded-t-lg ${col.bg} border border-border/30 border-b-0`}>
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${col.dot}`} />
                  <span className={`text-xs font-semibold uppercase tracking-wider ${col.color}`}>{col.label}</span>
                </div>
                <span className="text-xs font-bold text-muted-foreground">{colApps.length}</span>
              </div>

              {/* Cards */}
              <div className="flex-1 min-h-[200px] rounded-b-lg border border-border/30 border-t-0 bg-card/20 p-2 space-y-2">
                <AnimatePresence mode="popLayout">
                  {colApps.map((app) => (
                    <ApplicationCard
                      key={app.id}
                      application={app}
                      isMoving={movingId === app.id}
                      onEdit={() => { setEditingApp(app); setShowAddModal(true); }}
                      onMove={handleMove}
                      onDelete={handleDelete}
                      allStatuses={ALL_STATUSES}
                    />
                  ))}
                </AnimatePresence>
                <button
                  onClick={() => openAdd(col.status)}
                  className="w-full py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-md transition-colors flex items-center justify-center gap-1"
                >
                  <Plus className="h-3 w-3" /> Add
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {showAddModal && (
        <ApplicationModal
          initial={editingApp || { status: defaultStatus } as Application}
          isEdit={!!editingApp}
          onSave={handleSave}
          onClose={() => { setShowAddModal(false); setEditingApp(null); }}
        />
      )}
    </div>
  );
}

function ApplicationCard({
  application, isMoving, onEdit, onMove, onDelete, allStatuses
}: {
  application: Application;
  isMoving: boolean;
  onEdit: () => void;
  onMove: (id: string, status: AppStatus) => void;
  onDelete: (id: string) => void;
  allStatuses: typeof ALL_STATUSES;
}) {
  const [showMoveMenu, setShowMoveMenu] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: isMoving ? 0.5 : 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-card border border-border/40 rounded-lg p-3 cursor-pointer hover:border-border/80 transition-all group"
      onClick={onEdit}
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate">{application.jobTitle}</p>
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
            <Building2 className="h-3 w-3 shrink-0" />
            <span className="truncate">{application.company}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
          <button
            onClick={(e) => { e.stopPropagation(); setShowMoveMenu(!showMoveMenu); }}
            className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
            title="Move to column"
          >
            <ChevronDown className="h-3 w-3" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(application.id); }}
            className="p-1 rounded hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>

      {application.location && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
          <MapPin className="h-3 w-3 shrink-0" />
          <span className="truncate">{application.location}</span>
        </div>
      )}
      {application.salary && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
          <DollarSign className="h-3 w-3 shrink-0" />
          <span>{application.salary} {application.currency}</span>
        </div>
      )}

      <div className="flex items-center justify-between mt-2">
        <span className="text-[10px] text-muted-foreground">
          {new Date(application.createdAt).toLocaleDateString()}
        </span>
        {application.jobUrl && (
          <a
            href={application.jobUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>

      {/* Move dropdown */}
      <AnimatePresence>
        {showMoveMenu && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="absolute z-50 mt-1 w-44 rounded-lg border border-border bg-card shadow-xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-1">
              <p className="text-[10px] uppercase text-muted-foreground px-2 py-1 font-semibold">Move to</p>
              {allStatuses.map(s => (
                <button
                  key={s.status}
                  onClick={() => { onMove(application.id, s.status); setShowMoveMenu(false); }}
                  className={cn(
                    "w-full text-left px-2 py-1.5 text-xs rounded-md hover:bg-accent transition-colors flex items-center gap-2",
                    application.status === s.status && "opacity-40 cursor-default"
                  )}
                  disabled={application.status === s.status}
                >
                  <div className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
                  {s.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function ApplicationModal({
  initial, isEdit, onSave, onClose
}: {
  initial: Application;
  isEdit: boolean;
  onSave: (data: Partial<Application>) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    company: initial.company || "",
    jobTitle: initial.jobTitle || "",
    jobUrl: initial.jobUrl || "",
    location: initial.location || "",
    salary: initial.salary || "",
    currency: initial.currency || "USD",
    notes: initial.notes || "",
    appliedAt: initial.appliedAt ? initial.appliedAt.split("T")[0] : "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.company || !form.jobTitle) return;
    setLoading(true);
    await onSave({
      company: form.company,
      jobTitle: form.jobTitle,
      jobUrl: form.jobUrl || null,
      location: form.location || null,
      salary: form.salary || null,
      currency: form.currency,
      notes: form.notes || null,
      appliedAt: form.appliedAt || null,
    });
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl"
      >
        <div className="p-6">
          <h2 className="text-lg font-bold mb-5">{isEdit ? "Edit Application" : "Add Application"}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="text-xs text-muted-foreground mb-1 block">Company *</label>
                <input
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  value={form.company}
                  onChange={e => setForm(p => ({ ...p, company: e.target.value }))}
                  placeholder="Google, Meta, Stripe..."
                  required
                />
              </div>
              <div className="col-span-2">
                <label className="text-xs text-muted-foreground mb-1 block">Job Title *</label>
                <input
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  value={form.jobTitle}
                  onChange={e => setForm(p => ({ ...p, jobTitle: e.target.value }))}
                  placeholder="Senior Software Engineer"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Location</label>
                <input
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  value={form.location}
                  onChange={e => setForm(p => ({ ...p, location: e.target.value }))}
                  placeholder="Toronto, CA"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Applied Date</label>
                <input
                  type="date"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  value={form.appliedAt}
                  onChange={e => setForm(p => ({ ...p, appliedAt: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Salary</label>
                <input
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  value={form.salary}
                  onChange={e => setForm(p => ({ ...p, salary: e.target.value }))}
                  placeholder="120,000"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Currency</label>
                <select
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  value={form.currency}
                  onChange={e => setForm(p => ({ ...p, currency: e.target.value }))}
                >
                  {["USD","CAD","EUR","GBP","INR","AED","AUD","SGD"].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="col-span-2">
                <label className="text-xs text-muted-foreground mb-1 block">Job URL</label>
                <input
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  value={form.jobUrl}
                  onChange={e => setForm(p => ({ ...p, jobUrl: e.target.value }))}
                  placeholder="https://..."
                />
              </div>
              <div className="col-span-2">
                <label className="text-xs text-muted-foreground mb-1 block">Notes</label>
                <textarea
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                  rows={3}
                  value={form.notes}
                  onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                  placeholder="Recruiter contact, prep notes..."
                />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? "Saving..." : isEdit ? "Save Changes" : "Add Application"}
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
