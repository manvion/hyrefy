"use client";

import { Bell, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { HyreLogo } from "@/components/shared/hyrefy-logo";
import { isDemoMode } from "@/lib/utils/demo-mode";

function ClerkGreeting() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { useUser } = require("@clerk/nextjs");
  const { user } = useUser();
  return <>{user?.firstName || "there"}</>;
}

export function DashboardHeader() {
  const { theme, setTheme } = useTheme();

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <header className="flex h-14 items-center justify-between border-b border-border/30 px-4 sm:px-6 bg-background/50 backdrop-blur-sm shrink-0">
      {/* Mobile: logo; Desktop: greeting */}
      <div className="flex items-center gap-2">
        <div className="flex lg:hidden items-center gap-2">
          <HyreLogo size={26} />
          <span className="font-bold text-sm">Hyrefy</span>
        </div>
        <div className="hidden lg:block">
          <h2 className="text-sm font-medium text-muted-foreground">
            {greeting()},{" "}
            <span className="text-foreground font-semibold">
              {isDemoMode ? "there" : <ClerkGreeting />}
            </span>
          </h2>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="text-muted-foreground h-8 w-8"
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
        <Button variant="ghost" size="icon" className="text-muted-foreground relative h-8 w-8">
          <Bell className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
