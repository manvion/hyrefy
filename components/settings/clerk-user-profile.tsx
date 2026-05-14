"use client";

import { UserProfile } from "@clerk/nextjs";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ClerkUserProfileClient() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="h-64 rounded-xl border border-border/40 bg-card/30 animate-pulse" />;

  const isDark = resolvedTheme === "dark";

  return (
    <div className="rounded-2xl overflow-hidden border border-border/50">
      <UserProfile
        routing="hash"
        appearance={{
          variables: {
            colorPrimary: isDark ? "hsl(212, 86%, 68%)" : "hsl(211, 89%, 40%)",
            colorBackground: isDark ? "hsl(216, 14%, 11%)" : "hsl(0, 0%, 100%)",
            colorText: isDark ? "hsl(210, 17%, 95%)" : "hsl(0, 0%, 10%)",
            colorTextSecondary: isDark ? "hsl(217, 10%, 60%)" : "hsl(0, 0%, 44%)",
            colorInputBackground: isDark ? "hsl(216, 11%, 14%)" : "hsl(40, 8%, 91%)",
            colorInputText: isDark ? "hsl(210, 17%, 95%)" : "hsl(0, 0%, 10%)",
            borderRadius: "0.75rem",
            fontFamily: "inherit",
          },
          layout: { shimmer: false },
          elements: {
            rootBox: "w-full",
            card: "shadow-none border-none rounded-none bg-transparent",
            navbar: isDark
              ? "bg-[hsl(216,12%,15%)] border-r border-[hsl(216,11%,21%)]"
              : "bg-[hsl(40,14%,95%)] border-r border-[hsl(40,8%,85%)]",
            pageScrollBox: "p-6",
            profileSection: "border-[hsl(var(--border))]",
          },
        }}
      />
    </div>
  );
}
