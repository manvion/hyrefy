"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Upload, Sparkles, History, MoreHorizontal, CreditCard, Settings, LogOut, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { HyreLogo } from "@/components/shared/hyrefy-logo";
import { isDemoMode } from "@/lib/utils/demo-mode";

function stripUserId(path: string): string {
  return path.replace(/\/(user_\w+|demo_user)$/, "");
}

const navItems = [
  { href: "/dashboard",     icon: LayoutDashboard, label: "Home"     },
  { href: "/resume/upload", icon: Upload,           label: "Resume"   },
  { href: "/generate",      icon: Sparkles,         label: "Generate" },
  { href: "/history",       icon: History,          label: "History"  },
];

const moreItems = [
  { href: "/billing",  icon: CreditCard, label: "Billing & Upgrade" },
  { href: "/settings", icon: Settings,   label: "Settings"          },
];

function SignOutButton({ onClose }: { onClose: () => void }) {
  const router = useRouter();

  if (isDemoMode) {
    return (
      <button
        onClick={() => { onClose(); router.push("/sign-in"); }}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-xl transition-colors"
      >
        <LogOut className="h-5 w-5 shrink-0" />
        Sign Out
      </button>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { SignOutButton: ClerkSignOut } = require("@clerk/nextjs");
  return (
    <ClerkSignOut redirectUrl="/sign-in">
      <button
        onClick={onClose}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-xl transition-colors"
      >
        <LogOut className="h-5 w-5 shrink-0" />
        Sign Out
      </button>
    </ClerkSignOut>
  );
}

export function MobileTopBar() {
  return (
    <div className="lg:hidden flex items-center gap-2">
      <HyreLogo size={28} />
      <span className="font-bold text-base">Hyrefy</span>
    </div>
  );
}

interface Props {
  userId: string;
}

export function MobileNav({ userId }: Props) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const cleanPath = stripUserId(pathname);
  const isMoreActive = cleanPath === "/billing" || cleanPath === "/settings";

  return (
    <>
      {/* Bottom nav bar */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border/40 bg-background/95 backdrop-blur-md"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="flex items-stretch justify-around px-1 py-1">
          {navItems.map((item) => {
            const isActive =
              cleanPath === item.href ||
              (item.href !== "/dashboard" && cleanPath.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={`${item.href}/${userId}`}
                className={cn(
                  "relative flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all min-w-0 flex-1",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                <span className="text-[10px] font-medium leading-tight">{item.label}</span>
                {isActive && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-8 rounded-full bg-primary" />
                )}
              </Link>
            );
          })}

          {/* More button */}
          <button
            onClick={() => setDrawerOpen(true)}
            className={cn(
              "relative flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all flex-1",
              isMoreActive || drawerOpen ? "text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <MoreHorizontal className="h-5 w-5 shrink-0" />
            <span className="text-[10px] font-medium leading-tight">More</span>
            {isMoreActive && (
              <span className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-8 rounded-full bg-primary" />
            )}
          </button>
        </div>
      </nav>

      {/* Backdrop */}
      {drawerOpen && (
        <div
          className="lg:hidden fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* Slide-up drawer */}
      <div
        className={cn(
          "lg:hidden fixed left-0 right-0 bottom-0 z-[70] bg-background rounded-t-2xl border-t border-border/50 shadow-2xl transition-transform duration-300",
          drawerOpen ? "translate-y-0" : "translate-y-full"
        )}
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <div className="flex items-center gap-2">
            <HyreLogo size={24} />
            <span className="font-bold text-sm">Hyrefy</span>
          </div>
          <button
            onClick={() => setDrawerOpen(false)}
            className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-accent transition-colors"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-border" />

        <div className="px-3 pb-4 space-y-1">
          {moreItems.map((item) => {
            const isActive = cleanPath === item.href;
            return (
              <Link
                key={item.href}
                href={`${item.href}/${userId}`}
                onClick={() => setDrawerOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-colors",
                  isActive ? "bg-primary/10 text-primary" : "text-foreground hover:bg-accent"
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {item.label}
              </Link>
            );
          })}

          <div className="pt-1 border-t border-border/30 mt-2">
            <SignOutButton onClose={() => setDrawerOpen(false)} />
          </div>
        </div>
      </div>
    </>
  );
}
