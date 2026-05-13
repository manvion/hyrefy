"use client";

import { Bell, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true" ||
  (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "").includes("dummy");

function ClerkGreeting() {
  // Dynamically require so it's only evaluated when ClerkProvider is present
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
    <header className="flex h-16 items-center justify-between border-b border-border/30 px-6 bg-background/50 backdrop-blur-sm shrink-0">
      <div>
        <h2 className="text-sm font-medium text-muted-foreground">
          {greeting()},{" "}
          <span className="text-foreground font-semibold">
            {isDemoMode ? "there" : <ClerkGreeting />}
          </span>
        </h2>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="text-muted-foreground"
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
        <Button variant="ghost" size="icon" className="text-muted-foreground relative">
          <Bell className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
