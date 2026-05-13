"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Upload, Sparkles, History, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { HyreLogo } from "@/components/shared/hyrefy-logo";

const navItems = [
  { href: "/dashboard",      icon: LayoutDashboard, label: "Home"     },
  { href: "/resume/upload",  icon: Upload,          label: "Resume"   },
  { href: "/generate",       icon: Sparkles,        label: "Generate" },
  { href: "/history",        icon: History,         label: "History"  },
];

export function MobileTopBar() {
  return (
    <div className="lg:hidden flex items-center gap-2">
      <HyreLogo size={28} />
      <span className="font-bold text-base">Hyrefy</span>
    </div>
  );
}

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border/40 bg-background/95 backdrop-blur-md safe-area-pb">
      <div className="flex items-center justify-around px-1 py-1.5">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl transition-all min-w-0",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className={cn("h-5 w-5 shrink-0", isActive && "text-primary")} />
              <span className={cn("text-[10px] font-medium", isActive && "text-primary")}>
                {item.label}
              </span>
              {isActive && (
                <span className="absolute bottom-1.5 h-0.5 w-5 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
        <Link
          href="/billing"
          className={cn(
            "flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl transition-all",
            pathname === "/billing" || pathname === "/settings"
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <MoreHorizontal className="h-5 w-5 shrink-0" />
          <span className="text-[10px] font-medium">More</span>
        </Link>
      </div>
    </nav>
  );
}
