"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils/cn";
import { isDemoMode } from "@/lib/utils/demo-mode";
import { HyreLogo } from "@/components/shared/hyrefy-logo";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard, Upload, Sparkles, FileText, FileSearch,
  KanbanSquare, History, BrainCircuit, Crown, Menu, X,
  CreditCard, Settings, LogOut, Sun, Moon, ChevronDown,
  Image as ImageIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";

// Load Clerk hooks only on client
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

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-md shrink-0">
        <div className="flex h-14 items-center gap-2 px-4 sm:px-6">

          {/* Left: Logo */}
          <Link
            href={`/dashboard/${userId}`}
            className="flex items-center gap-2.5 shrink-0 mr-4 group"
          >
            <HyreLogo size={28} className="transition-transform group-hover:scale-105" />
            <span className="font-bold text-base tracking-tight hidden sm:inline">Hyrefy</span>
          </Link>

          {/* Center: Nav tabs (desktop) */}
          <nav className="hidden lg:flex flex-1 items-center gap-0.5 overflow-x-auto no-scrollbar">
            {navItems.map((item) => {
              const isActive =
                cleanPath === item.href ||
                (item.href !== "/dashboard" && cleanPath.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={`${item.href}/${userId}`}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-150",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                >
                  <item.icon className="h-3.5 w-3.5 shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right: actions */}
          <div className="ml-auto flex items-center gap-1.5 shrink-0">
            <ThemeToggle />

            {!isPremium && (
              <Button asChild size="sm" variant="gradient" className="hidden sm:flex h-7 text-xs gap-1">
                <Link href={`/billing/${userId}`}>
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
          className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <div
        className={cn(
          "lg:hidden fixed top-14 left-0 right-0 z-50 bg-background border-b border-border/40 shadow-xl transition-all duration-200 origin-top",
          mobileOpen ? "opacity-100 scale-y-100 pointer-events-auto" : "opacity-0 scale-y-95 pointer-events-none"
        )}
      >
        <nav className="px-4 py-3 space-y-1 max-h-[calc(100vh-3.5rem)] overflow-y-auto">
          {navItems.map((item) => {
            const isActive =
              cleanPath === item.href ||
              (item.href !== "/dashboard" && cleanPath.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={`${item.href}/${userId}`}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-foreground hover:bg-accent"
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}

          <div className="pt-2 mt-2 border-t border-border/30 flex flex-col gap-1">
            <Link
              href={`/billing/${userId}`}
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-foreground hover:bg-accent transition-colors"
            >
              <CreditCard className="h-4 w-4 shrink-0" />
              Billing
            </Link>
            <Link
              href={`/settings/${userId}`}
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-foreground hover:bg-accent transition-colors"
            >
              <Settings className="h-4 w-4 shrink-0" />
              Settings
            </Link>
            {!isPremium && (
              <Link
                href={`/billing/${userId}`}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 transition-colors"
              >
                <Crown className="h-4 w-4 shrink-0" />
                Upgrade to Premium
              </Link>
            )}
          </div>
        </nav>
      </div>
    </>
  );
}
