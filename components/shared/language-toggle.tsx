"use client";

import { useLanguage } from "@/components/shared/language-provider";
import { Globe } from "lucide-react";

export function LanguageToggle({ className }: { className?: string }) {
  const { language, setLanguage } = useLanguage();

  return (
    <button
      onClick={() => setLanguage(language === "en" ? "fr" : "en")}
      title={language === "en" ? "Switch to French" : "Passer en anglais"}
      className={`
        inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg
        border border-border/50 bg-card/30
        text-xs font-semibold text-muted-foreground
        hover:bg-accent hover:text-foreground hover:border-border
        active:scale-95
        cursor-pointer transition-all duration-150
        ${className ?? ""}
      `}
    >
      <Globe className="h-3.5 w-3.5" />
      {language === "en" ? "FR" : "EN"}
    </button>
  );
}
