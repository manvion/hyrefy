"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils/cn";
import { HyreLogo } from "@/components/shared/hyrefy-logo";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard, Upload, Sparkles, FileText, FileSearch,
  KanbanSquare, History, BrainCircuit, Crown, Menu, X,
  CreditCard, Settings, Sun, Moon,
} from "lucide-react";
import { useTheme } from "next-themes";

const ClerkUserMenu = dynamic(
  () => import("@/components/dashboard/top-nav-user-menu").then((m) => m.TopNavUserMenu),
  { ssr: false, loading: () => <div className="h-8 w-8 rounded-full bg-muted animate-pulse" /> }
);

function stripUserId(path: string): string {
  return path.replace(/\/(user_\w+|demo_user)$/, "");
}

const navItems = [
  { href: "/dashboard",      label: "Dashboard",        icon: LayoutDashboard },
  { href: "/resume/upload",  label: "My Master Resume", icon: Upload           },
  { href: "/generate",       label: "Improve Resume",   icon: Sparkles         },
  { href: "/build",          label: "Build Resume",     icon: FileText         },
  { href: "/analyze",        label: "ATS Analyzer",     icon: FileSearch       },
  { href: "/tracker",        label: "Job Tracker",      icon: KanbanSquare     },
  { href: "/history",        label: "History",          icon: History          },
  { href: "/interview-prep", label: "Interview AI",     icon: BrainCircuit     },
];

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="h-8 w-8" />;
  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
      title="Toggle theme"
    >
      {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}

interface Props {
  userId: string;
  isPremium?: boolean;
}

export function TopNav({ userId, isPremium }: Props) {
  const pathname = usePathname();
  const cleanPath = stripUserId(pathname);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  return (
    <>
      {/* ── Desktop nav ──────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/98 backdrop-blur-md shrink-0">
        <div className="flex h-[52px] items-stretch px-4 sm:px-6">

          {/* Left: Logo (vertically centered) */}
          <div className="flex items-center shrink-0 pr-6 border-r border-border/30 mr-2">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 group"
            >
              <HyreLogo size={26} />
              <span className="font-bold text-[15px] tracking-tight hidden sm:inline">Hyrefy</span>
            </Link>
          </div>

          {/* Center: Nav tabs – sit at bottom with underline indicator */}
          <nav className="hidden lg:flex flex-1 items-end justify-center overflow-x-auto no-scrollbar gap-0 -mb-px">
            {navItems.map((item) => {
              const isActive =
                cleanPath === item.href ||
                (item.href !== "/dashboard" && cleanPath.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative flex items-center gap-1.5 px-3 pb-[11px] pt-2 text-[13px] font-medium whitespace-nowrap transition-all duration-150 border-b-2",
                    isActive
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-border/60"
                  )}
                >
                  <item.icon className="h-3.5 w-3.5 shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right: Actions (vertically centered) */}
          <div className="flex items-center gap-1.5 shrink-0 pl-4 ml-auto">
            <ThemeToggle />
            {!isPremium && (
              <Button asChild size="sm" variant="gradient" className="hidden sm:flex h-7 text-xs gap-1 px-2.5">
                <Link href="/billing">
                  <Crown className="h-3 w-3" />
                  Upgrade
                </Link>
              </Button>
            )}
            <ClerkUserMenu userId={userId} isPremium={isPremium} />

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors ml-1"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <div
        className={cn(
          "lg:hidden fixed top-[52px] left-0 right-0 z-50 bg-background border-b border-border/40 shadow-2xl transition-all duration-200 origin-top",
          mobileOpen ? "opacity-100 scale-y-100 pointer-events-auto" : "opacity-0 scale-y-95 pointer-events-none"
        )}
      >
        <nav className="px-4 py-3 space-y-0.5 max-h-[calc(100vh-52px)] overflow-y-auto">
          {navItems.map((item) => {
            const isActive =
              cleanPath === item.href ||
              (item.href !== "/dashboard" && cleanPath.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                  isActive ? "bg-primary/10 text-primary" : "text-foreground hover:bg-accent"
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
          <div className="pt-2 mt-2 border-t border-border/30 space-y-0.5">
            <Link href="/billing" onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-foreground hover:bg-accent transition-colors">
              <CreditCard className="h-4 w-4 shrink-0" />Billing
            </Link>
            <Link href="/settings" onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-foreground hover:bg-accent transition-colors">
              <Settings className="h-4 w-4 shrink-0" />Settings
            </Link>
            {!isPremium && (
              <Link href="/billing" onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 transition-colors">
                <Crown className="h-4 w-4 shrink-0" />Upgrade to Premium
              </Link>
            )}
          </div>
        </nav>
      </div>
    </>
  );
}
