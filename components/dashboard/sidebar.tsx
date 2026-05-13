"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { SignOutButton as ClerkSignOutButton } from "@clerk/nextjs";
import { cn } from "@/lib/utils/cn";
import { isDemoMode } from "@/lib/utils/demo-mode";
import {
  LayoutDashboard, Upload, Sparkles, CreditCard,
  Settings, ChevronLeft, ChevronRight, History, LogOut,
  Flame, BrainCircuit, KanbanSquare, FileSearch,
} from "lucide-react";
import { HyreLogo } from "@/components/shared/hyrefy-logo";

// Load with ssr:false — useClerk() throws during static prerendering without ClerkProvider
const ClerkUserButtonDynamic = dynamic(
  () => import("@/components/dashboard/clerk-user-button").then((m) => ({ default: m.ClerkUserButton })),
  { ssr: false, loading: () => <div className="h-8 w-8 rounded-full bg-muted animate-pulse shrink-0" /> }
);

// Strip the Clerk userId or demo_user segment from the end of the path
function stripUserId(path: string): string {
  return path.replace(/\/(user_\w+|demo_user)$/, "");
}

function UserAvatar({ collapsed }: { collapsed: boolean }) {
  if (isDemoMode) {
    return (
      <div className="h-8 w-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-xs font-medium text-primary shrink-0">
        D
      </div>
    );
  }
  return <ClerkUserButtonDynamic collapsed={collapsed} />;
}

function SignOutBtn({ collapsed }: { collapsed: boolean }) {
  const router = useRouter();

  if (isDemoMode) {
    return (
      <button
        onClick={() => router.push("/sign-in")}
        className={cn(
          "w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 text-muted-foreground hover:bg-destructive/10 hover:text-destructive",
          collapsed && "justify-center px-2"
        )}
        title={collapsed ? "Sign Out" : undefined}
      >
        <LogOut className="h-4 w-4 shrink-0" />
        {!collapsed && <span>Sign Out</span>}
      </button>
    );
  }

  return (
    <ClerkSignOutButton redirectUrl="/sign-in">
      <button
        className={cn(
          "w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 text-muted-foreground hover:bg-destructive/10 hover:text-destructive",
          collapsed && "justify-center px-2"
        )}
        title={collapsed ? "Sign Out" : undefined}
      >
        <LogOut className="h-4 w-4 shrink-0" />
        {!collapsed && <span>Sign Out</span>}
      </button>
    </ClerkSignOutButton>
  );
}

const navItems = [
  { href: "/dashboard",      icon: LayoutDashboard, label: "Dashboard"    },
  { href: "/resume/upload",  icon: Upload,          label: "My Resume"    },
  { href: "/generate",       icon: Sparkles,        label: "Generate"     },
  { href: "/analyze",        icon: FileSearch,      label: "ATS Analyzer" },
  { href: "/tracker",        icon: KanbanSquare,    label: "Job Tracker"  },
  { href: "/history",        icon: History,         label: "History"      },
  { href: "/roast",          icon: Flame,           label: "Roast My CV"  },
  { href: "/interview-prep", icon: BrainCircuit,    label: "Interview AI" },
];

const bottomItems = [
  { href: "/billing",  icon: CreditCard, label: "Billing"  },
  { href: "/settings", icon: Settings,   label: "Settings" },
];

interface Props {
  userId: string;
}

export function DashboardSidebar({ userId }: Props) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const cleanPath = stripUserId(pathname);

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col border-r border-border/50 bg-card/30 backdrop-blur-sm transition-all duration-300 shrink-0 relative",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className={cn("flex h-16 items-center border-b border-border/30 px-4", collapsed ? "justify-center" : "gap-3")}>
        <Link href={`/dashboard/${userId}`} className="flex items-center gap-2.5 group">
          <HyreLogo size={32} className="shrink-0" />
          {!collapsed && (
            <span className="text-base font-bold tracking-tight">Hyrefy</span>
          )}
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        <div className="space-y-1">
          {navItems.map((item) => {
            const isActive = cleanPath === item.href || cleanPath.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={`${item.href}/${userId}`}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                  collapsed && "justify-center px-2"
                )}
                title={collapsed ? item.label : undefined}
              >
                <item.icon className={cn("h-4 w-4 shrink-0", isActive && "text-primary")} />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Bottom */}
      <div className="border-t border-border/30 py-4 px-2 space-y-1">
        {bottomItems.map((item) => {
          const isActive = cleanPath === item.href;
          return (
            <Link
              key={item.href}
              href={`${item.href}/${userId}`}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
                collapsed && "justify-center px-2"
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}

        <SignOutBtn collapsed={collapsed} />

        <div className={cn("flex items-center gap-3 px-3 py-2 mt-1 border-t border-border/20 pt-3", collapsed && "justify-center px-2")}>
          <UserAvatar collapsed={collapsed} />
          {!collapsed && <span className="text-sm text-muted-foreground truncate">Account</span>}
        </div>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-background shadow-sm hover:bg-accent transition-colors z-10"
      >
        {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </button>
    </aside>
  );
}
