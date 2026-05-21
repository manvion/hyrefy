"use client";

import { useState, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Search, Ban, CheckCircle, Trash2, Gift, ChevronLeft, ChevronRight,
  FileText, BarChart3, Mic, RefreshCw, AlertTriangle, Crown, Mail, X,
  StickyNote, Shield, ShieldOff,
} from "lucide-react";

interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  clerkId: string;
  country: string | null;
  isBlocked: boolean;
  adminNote: string | null;
  createdAt: string;
  subscription: {
    status: string;
    scansUsed: number;
    scansLimit: number;
    currentPeriodEnd: string | null;
  } | null;
  _count: {
    resumes: number;
    resumeScans: number;
    interviewPreps: number;
  };
}

interface UsersResponse {
  users: AdminUser[];
  total: number;
  page: number;
  pages: number;
}

type FilterType = "all" | "premium" | "free" | "blocked";

export function AdminUsersPanel() {
  const [data, setData] = useState<UsersResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [page, setPage] = useState(1);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<{ id: string; msg: string; error?: boolean } | null>(null);
  const [trialModal, setTrialModal] = useState<AdminUser | null>(null);
  const [trialDays, setTrialDays] = useState(7);
  const [noteModal, setNoteModal] = useState<AdminUser | null>(null);
  const [noteText, setNoteText] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<AdminUser | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search, filter, page: String(page),
      });
      const res = await fetch(`/api/admin/users?${params}`);
      const json = await res.json();
      setData(json);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [search, filter, page]);

  useEffect(() => {
    const t = setTimeout(fetchUsers, search ? 400 : 0);
    return () => clearTimeout(t);
  }, [fetchUsers, search]);

  const doAction = async (userId: string, action: string, extra?: Record<string, unknown>) => {
    setActionLoading(userId + action);
    setActionMsg(null);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...extra }),
      });
      const json = await res.json();
      if (res.ok) {
        setActionMsg({ id: userId, msg: json.message || "Done" });
        fetchUsers();
      } else {
        setActionMsg({ id: userId, msg: json.error || "Error", error: true });
      }
    } catch {
      setActionMsg({ id: userId, msg: "Network error", error: true });
    } finally {
      setActionLoading(null);
    }
  };

  const doDelete = async (user: AdminUser) => {
    setActionLoading(user.id + "delete");
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, { method: "DELETE" });
      if (res.ok) { setDeleteConfirm(null); fetchUsers(); }
    } finally {
      setActionLoading(null);
    }
  };

  const isPremium = (u: AdminUser) => u.subscription?.status === "PREMIUM";
  const daysLeft = (u: AdminUser) => {
    if (!u.subscription?.currentPeriodEnd) return null;
    const diff = new Date(u.subscription.currentPeriodEnd).getTime() - Date.now();
    return Math.ceil(diff / 86400000);
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            className="w-full rounded-lg border border-border bg-background pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="Search by name or email..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <div className="flex gap-2">
          {(["all", "premium", "free", "blocked"] as FilterType[]).map(f => (
            <button
              key={f}
              onClick={() => { setFilter(f); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${
                filter === f
                  ? "bg-primary/15 text-primary border border-primary/30"
                  : "text-muted-foreground hover:text-foreground border border-transparent hover:border-border"
              }`}
            >
              {f}
            </button>
          ))}
          <button
            onClick={fetchUsers}
            className="px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground transition-all"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Count */}
      {data && (
        <p className="text-xs text-muted-foreground">
          {data.total} user{data.total !== 1 ? "s" : ""} {search && `matching "${search}"`}
        </p>
      )}

      {/* Table */}
      <Card className="border-border/50 bg-card/30">
        <CardContent className="p-0">
          {loading && !data ? (
            <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
              <RefreshCw className="h-4 w-4 animate-spin mr-2" /> Loading users...
            </div>
          ) : !data?.users.length ? (
            <div className="text-center py-16 text-sm text-muted-foreground">
              No users found{filter !== "all" ? ` for filter "${filter}"` : ""}.
            </div>
          ) : (
            <div className="divide-y divide-border/20">
              {data.users.map((user) => {
                const premium = isPremium(user);
                const days = daysLeft(user);
                const msg = actionMsg?.id === user.id ? actionMsg : null;
                return (
                  <div
                    key={user.id}
                    className={`p-4 ${user.isBlocked ? "opacity-60 bg-destructive/3" : ""}`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                      {/* Avatar + info */}
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className={`h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                          user.isBlocked ? "bg-destructive/10 text-destructive border border-destructive/20"
                          : premium ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          : "bg-primary/10 text-primary border border-primary/20"
                        }`}>
                          {((user.name || user.email || "?")[0] ?? "?").toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-medium truncate">
                              {user.name || user.email}
                            </p>
                            {user.isBlocked && (
                              <Badge variant="destructive" className="text-[10px] shrink-0">BLOCKED</Badge>
                            )}
                            {premium && !user.isBlocked && (
                              <Badge variant="success" className="text-[10px] shrink-0">PREMIUM</Badge>
                            )}
                          </div>
                          {user.name && (
                            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                          )}
                          <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground flex-wrap">
                            <span className="flex items-center gap-1">
                              <FileText className="h-3 w-3" /> {user._count.resumes} resumes
                            </span>
                            <span className="flex items-center gap-1">
                              <BarChart3 className="h-3 w-3" /> {user._count.resumeScans} scans
                            </span>
                            <span className="flex items-center gap-1">
                              <Mic className="h-3 w-3" /> {user._count.interviewPreps} preps
                            </span>
                            {user.country && <span>{user.country}</span>}
                            <span>Joined {new Date(user.createdAt).toLocaleDateString("en-CA", { year: "numeric", month: "short", day: "numeric" })}</span>
                            {days !== null && (
                              <span className={`font-medium ${days <= 3 ? "text-destructive" : days <= 7 ? "text-amber-400" : "text-emerald-400"}`}>
                                {days > 0 ? `${days}d left` : "Expired"}
                              </span>
                            )}
                          </div>
                          {user.adminNote && (
                            <p className="text-[11px] text-amber-400 mt-1 flex items-center gap-1">
                              <StickyNote className="h-3 w-3 shrink-0" />
                              {user.adminNote}
                            </p>
                          )}
                          {msg && (
                            <p className={`text-[11px] mt-1 ${msg.error ? "text-destructive" : "text-emerald-400"}`}>
                              {msg.error ? "✗" : "✓"} {msg.msg}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1.5 flex-wrap sm:flex-nowrap shrink-0">
                        {/* Block / Unblock */}
                        <button
                          onClick={() => doAction(user.id, user.isBlocked ? "unblock" : "block")}
                          disabled={!!actionLoading}
                          title={user.isBlocked ? "Unblock user" : "Block user"}
                          className={`h-8 w-8 rounded-lg flex items-center justify-center border transition-all ${
                            user.isBlocked
                              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                              : "border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/20"
                          }`}
                        >
                          {user.isBlocked ? <ShieldOff className="h-3.5 w-3.5" /> : <Ban className="h-3.5 w-3.5" />}
                        </button>

                        {/* Grant trial */}
                        <button
                          onClick={() => { setTrialModal(user); setTrialDays(7); }}
                          disabled={!!actionLoading}
                          title="Grant free trial"
                          className="h-8 w-8 rounded-lg flex items-center justify-center border border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-all"
                        >
                          <Gift className="h-3.5 w-3.5" />
                        </button>

                        {/* Revoke premium */}
                        {premium && (
                          <button
                            onClick={() => doAction(user.id, "revoke_premium")}
                            disabled={!!actionLoading}
                            title="Revoke premium"
                            className="h-8 w-8 rounded-lg flex items-center justify-center border border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-all"
                          >
                            <Crown className="h-3.5 w-3.5" />
                          </button>
                        )}

                        {/* Note */}
                        <button
                          onClick={() => { setNoteModal(user); setNoteText(user.adminNote || ""); }}
                          title="Add admin note"
                          className="h-8 w-8 rounded-lg flex items-center justify-center border border-border bg-background text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all"
                        >
                          <StickyNote className="h-3.5 w-3.5" />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => setDeleteConfirm(user)}
                          disabled={!!actionLoading}
                          title="Delete user"
                          className="h-8 w-8 rounded-lg flex items-center justify-center border border-destructive/30 bg-destructive/5 text-destructive hover:bg-destructive/15 transition-all"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {data && data.pages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page <= 1 || loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground disabled:opacity-40 transition-all"
          >
            <ChevronLeft className="h-4 w-4" /> Prev
          </button>
          <span className="text-muted-foreground text-xs">Page {data.page} of {data.pages}</span>
          <button
            onClick={() => setPage(p => Math.min(data.pages, p + 1))}
            disabled={page >= data.pages || loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground disabled:opacity-40 transition-all"
          >
            Next <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Trial modal */}
      {trialModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setTrialModal(null)} />
          <div className="relative z-10 w-full max-w-sm bg-background rounded-2xl border border-border/50 shadow-2xl p-6">
            <button onClick={() => setTrialModal(null)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <Gift className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <p className="font-semibold">Grant Free Trial</p>
                <p className="text-xs text-muted-foreground truncate max-w-[180px]">{trialModal.email}</p>
              </div>
            </div>
            <label className="text-xs text-muted-foreground mb-1 block">Trial duration (days)</label>
            <input
              type="number"
              min={1}
              max={90}
              value={trialDays}
              onChange={e => setTrialDays(Math.max(1, Math.min(90, parseInt(e.target.value) || 7)))}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <Button
              onClick={() => {
                doAction(trialModal.id, "grant_trial", { trialDays });
                setTrialModal(null);
              }}
              variant="gradient"
              className="w-full"
            >
              <Gift className="h-4 w-4 mr-2" />
              Grant {trialDays}-Day Trial
            </Button>
          </div>
        </div>
      )}

      {/* Note modal */}
      {noteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setNoteModal(null)} />
          <div className="relative z-10 w-full max-w-sm bg-background rounded-2xl border border-border/50 shadow-2xl p-6">
            <button onClick={() => setNoteModal(null)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
            <p className="font-semibold mb-1">Admin Note</p>
            <p className="text-xs text-muted-foreground mb-3 truncate">{noteModal.email}</p>
            <textarea
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              rows={3}
              placeholder="Internal note (not visible to user)..."
              value={noteText}
              onChange={e => setNoteText(e.target.value)}
            />
            <Button
              onClick={() => {
                doAction(noteModal.id, "add_note", { adminNote: noteText });
                setNoteModal(null);
              }}
              variant="outline"
              className="w-full"
            >
              Save Note
            </Button>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setDeleteConfirm(null)} />
          <div className="relative z-10 w-full max-w-sm bg-background rounded-2xl border border-destructive/30 shadow-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="font-semibold">Delete User?</p>
                <p className="text-xs text-muted-foreground">This is permanent and cannot be undone.</p>
              </div>
            </div>
            <p className="text-sm mb-4 break-all text-muted-foreground">{deleteConfirm.email}</p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={() => doDelete(deleteConfirm)}
                disabled={!!actionLoading}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
