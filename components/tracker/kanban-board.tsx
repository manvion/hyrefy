"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Building2, MapPin, DollarSign, ExternalLink, Trash2, ChevronDown, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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

const COLUMNS: { status: AppStatus; label: string; accent: string; dot: string; header: string }[] = [
  { status: "WISHLIST",     label: "Wishlist",      accent: "border-slate-400/30",   dot: "bg-slate-400",    header: "text-slate-500 dark:text-slate-400" },
  { status: "APPLIED",      label: "Applied",       accent: "border-blue-400/30",    dot: "bg-blue-500",     header: "text-blue-600 dark:text-blue-400" },
  { status: "PHONE_SCREEN", label: "Phone Screen",  accent: "border-cyan-400/30",    dot: "bg-cyan-500",     header: "text-cyan-600 dark:text-cyan-400" },
  { status: "INTERVIEW",    label: "Interview",     accent: "border-violet-400/30",  dot: "bg-violet-500",   header: "text-violet-600 dark:text-violet-400" },
  { status: "TECHNICAL",    label: "Technical",     accent: "border-amber-400/30",   dot: "bg-amber-500",    header: "text-amber-600 dark:text-amber-400" },
  { status: "FINAL_ROUND",  label: "Final Round",   accent: "border-orange-400/30",  dot: "bg-orange-500",   header: "text-orange-600 dark:text-orange-400" },
  { status: "OFFER",        label: "Offer",         accent: "border-emerald-400/30", dot: "bg-emerald-500",  header: "text-emerald-600 dark:text-emerald-400" },
  { status: "REJECTED",     label: "Rejected",      accent: "border-red-400/30",     dot: "bg-red-500",      header: "text-red-600 dark:text-red-400" },
];

const ALL_STATUSES: { status: AppStatus; label: string; dot: string }[] = [
  ...COLUMNS,
  { status: "WITHDRAWN", label: "Withdrawn", dot: "bg-slate-400" },
  { status: "GHOSTED",   label: "Ghosted",   dot: "bg-slate-400" },
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

  // Summary stats
  const stats = [
    { label: "Total",      count: applications.length,                                        color: "text-foreground" },
    { label: "Applied",    count: applications.filter(a => a.status === "APPLIED").length,    color: "text-blue-600 dark:text-blue-400" },
    { label: "Interview",  count: applications.filter(a => a.status === "INTERVIEW").length,  color: "text-violet-600 dark:text-violet-400" },
    { label: "Offer",      count: applications.filter(a => a.status === "OFFER").length,      color: "text-emerald-600 dark:text-emerald-400" },
  ];

  return (
    <div className="space-y-5">
      {/* Stats + action bar */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-4 flex-1 flex-wrap">
          {stats.map(s => (
            <div key={s.label} className="flex items-baseline gap-1.5">
              <span className={cn("text-xl font-bold", s.color)}>{s.count}</span>
              <span className="text-xs text-muted-foreground">{s.label}</span>
            </div>
          ))}
        </div>
        <Button size="sm" onClick={() => openAdd("WISHLIST")} variant="gradient">
          <Plus className="h-3.5 w-3.5 mr-1.5" />Add Application
        </Button>
      </div>

      {/* Kanban columns — horizontal scroll */}
      <div className="w-full overflow-x-auto pb-4 -mx-0">
        <div className="flex gap-3 min-w-max">
          {COLUMNS.map((col) => {
            const colApps = applications.filter(a => a.status === col.status);
            return (
              <div key={col.status} className="flex flex-col w-[220px] shrink-0">
                {/* Column header */}
                <div className={cn(
                  "flex items-center justify-between px-3 py-2.5 rounded-t-xl border-b-0",
                  "bg-card border border-border/50",
                  "border-t-2",
                  col.accent.replace("border-", "border-t-")
                )}>
                  <div className="flex items-center gap-2">
                    <div className={cn("h-2 w-2 rounded-full shrink-0", col.dot)} />
                    <span className={cn("text-xs font-semibold uppercase tracking-wider", col.header)}>
                      {col.label}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-muted-foreground bg-muted/50 rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
                    {colApps.length}
                  </span>
                </div>

                {/* Cards */}
                <div className="flex-1 min-h-[300px] rounded-b-xl border border-border/50 border-t-0 bg-muted/20 p-2 space-y-2">
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

                  {colApps.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-6 text-muted-foreground/40">
                      <div className={cn("h-6 w-6 rounded-full border-2 border-dashed mb-2", col.dot.replace("bg-", "border-").replace("500", "300"))} />
                      <p className="text-[10px]">No applications</p>
                    </div>
                  )}

                  <button
                    onClick={() => openAdd(col.status)}
                    className="w-full py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-accent active:bg-accent/80 active:scale-[0.98] rounded-lg transition-all flex items-center justify-center gap-1.5"
                  >
                    <Plus className="h-3 w-3" />Add
                  </button>
                </div>
              </div>
            );
          })}
        </div>
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
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: isMoving ? 0.5 : 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="relative bg-card border border-border/50 rounded-xl p-3 cursor-pointer hover:border-border hover:shadow-sm transition-all group active:scale-[0.98]"
      onClick={onEdit}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate text-foreground">{application.jobTitle}</p>
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
            <Building2 className="h-3 w-3 shrink-0" />
            <span className="truncate">{application.company}</span>
          </div>
        </div>

        {/* Action buttons — visible on hover */}
        <div
          className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={e => e.stopPropagation()}
        >
          <button
            onClick={(e) => { e.stopPropagation(); setShowMoveMenu(!showMoveMenu); }}
            className="p-1.5 rounded-lg hover:bg-accent active:bg-accent/80 active:scale-[0.97] text-muted-foreground hover:text-foreground transition-all"
            title="Move to column"
          >
            <ChevronDown className="h-3 w-3" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(application.id); }}
            className="p-1.5 rounded-lg hover:bg-red-500/10 active:bg-red-500/20 active:scale-[0.97] text-muted-foreground hover:text-red-500 transition-all"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>

      {application.location && (
        <div className="flex items-center gap-1 text-[11px] text-muted-foreground mb-1">
          <MapPin className="h-2.5 w-2.5 shrink-0" />
          <span className="truncate">{application.location}</span>
        </div>
      )}
      {application.salary && (
        <div className="flex items-center gap-1 text-[11px] text-muted-foreground mb-1">
          <DollarSign className="h-2.5 w-2.5 shrink-0" />
          <span>{application.salary} {application.currency}</span>
        </div>
      )}

      <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/30">
        <span className="text-[10px] text-muted-foreground">
          {new Date(application.createdAt).toLocaleDateString("en-CA", { month: "short", day: "numeric" })}
        </span>
        {application.jobUrl && (
          <a
            href={application.jobUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="text-muted-foreground hover:text-primary active:text-primary/70 transition-colors"
          >
            <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>

      {/* Move dropdown */}
      <AnimatePresence>
        {showMoveMenu && (
          <>
            <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setShowMoveMenu(false); }} />
            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.97 }}
              transition={{ duration: 0.1 }}
              className="absolute right-0 top-8 z-50 w-44 rounded-xl border border-border bg-popover shadow-xl overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-1">
                <p className="text-[10px] uppercase text-muted-foreground px-2 py-1.5 font-semibold tracking-wide">Move to</p>
                {allStatuses.map(s => (
                  <button
                    key={s.status}
                    onClick={() => { onMove(application.id, s.status); setShowMoveMenu(false); }}
                    className={cn(
                      "w-full text-left px-2.5 py-1.5 text-xs rounded-lg hover:bg-accent active:bg-accent/80 active:scale-[0.98] transition-all flex items-center gap-2 text-foreground",
                      application.status === s.status && "opacity-40 pointer-events-none"
                    )}
                    disabled={application.status === s.status}
                  >
                    <div className={cn("h-1.5 w-1.5 rounded-full shrink-0", s.dot)} />
                    {s.label}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

const fieldCls = "w-full rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition";

function ApplicationModal({
  initial, isEdit, onSave, onClose
}: {
  initial: Application;
  isEdit: boolean;
  onSave: (data: Partial<Application>) => Promise<void>;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    company:   initial.company  || "",
    jobTitle:  initial.jobTitle || "",
    jobUrl:    initial.jobUrl   || "",
    location:  initial.location || "",
    salary:    initial.salary   || "",
    currency:  initial.currency || "USD",
    notes:     initial.notes    || "",
    appliedAt: initial.appliedAt ? initial.appliedAt.split("T")[0] : "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.company || !form.jobTitle) return;
    setLoading(true);
    await onSave({
      company:   form.company,
      jobTitle:  form.jobTitle,
      jobUrl:    form.jobUrl    || null,
      location:  form.location  || null,
      salary:    form.salary    || null,
      currency:  form.currency,
      notes:     form.notes     || null,
      appliedAt: form.appliedAt || null,
    });
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="relative w-full max-w-md rounded-2xl border border-border/50 bg-card shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/40">
          <h2 className="text-base font-bold text-foreground">{isEdit ? "Edit Application" : "Add Application"}</h2>
          <button
            onClick={onClose}
            className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent active:bg-accent/80 active:scale-[0.97] transition-all"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Company <span className="text-primary">*</span></label>
              <input className={fieldCls} value={form.company} onChange={e => setForm(p => ({ ...p, company: e.target.value }))} placeholder="Google, Meta, Stripe..." required />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Job Title <span className="text-primary">*</span></label>
              <input className={fieldCls} value={form.jobTitle} onChange={e => setForm(p => ({ ...p, jobTitle: e.target.value }))} placeholder="Senior Software Engineer" required />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Location</label>
              <input className={fieldCls} value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} placeholder="Toronto, CA" />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Applied Date</label>
              <input type="date" className={fieldCls} value={form.appliedAt} onChange={e => setForm(p => ({ ...p, appliedAt: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Salary</label>
              <input className={fieldCls} value={form.salary} onChange={e => setForm(p => ({ ...p, salary: e.target.value }))} placeholder="120,000" />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Currency</label>
              <select className={fieldCls} value={form.currency} onChange={e => setForm(p => ({ ...p, currency: e.target.value }))}>
                {["USD","CAD","EUR","GBP","INR","AED","AUD","SGD"].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Job URL</label>
              <input className={fieldCls} value={form.jobUrl} onChange={e => setForm(p => ({ ...p, jobUrl: e.target.value }))} placeholder="https://..." />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Notes</label>
              <textarea className={cn(fieldCls, "resize-none")} rows={3} value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="Recruiter contact, prep notes..." />
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : isEdit ? "Save Changes" : "Add Application"}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
