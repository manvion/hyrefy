"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LanguageToggle } from "@/components/shared/language-toggle";
import { useLanguage } from "@/components/shared/language-provider";
import { cn } from "@/lib/utils/cn";
import { HyreLogo } from "@/components/shared/hyrefy-logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Menu, X } from "lucide-react";

export function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 w-full z-50 transition-all duration-300",
        scrolled
          ? "bg-background/90 backdrop-blur-xl border-b border-border/50 shadow-sm"
          : "bg-transparent"
      )}
    >
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <HyreLogo size={32} className="group-hover:opacity-90 transition-opacity" />
            <span className="text-lg font-bold tracking-tight">Hyrefy</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t.nav.features}</Link>
            <Link href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t.nav.howItWorks}</Link>
            <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t.nav.pricing}</Link>
          </div>

          <div className="hidden md:flex items-center gap-2">
            <ThemeToggle />
            <LanguageToggle />
            <Button asChild variant="ghost" size="sm">
              <Link href="/sign-in">{t.nav.signIn}</Link>
            </Button>
            <Button asChild variant="gradient" size="sm">
              <Link href="/sign-up">{t.nav.getStarted}</Link>
            </Button>
          </div>

          <button
            className="md:hidden p-2 rounded-lg hover:bg-accent transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden py-4 border-t border-border/50 space-y-3">
            <Link href="#features" className="block py-2 text-sm text-muted-foreground hover:text-foreground">{t.nav.features}</Link>
            <Link href="#how-it-works" className="block py-2 text-sm text-muted-foreground hover:text-foreground">{t.nav.howItWorks}</Link>
            <Link href="/pricing" className="block py-2 text-sm text-muted-foreground hover:text-foreground">{t.nav.pricing}</Link>
            <div className="flex gap-2 pt-2 items-center">
              <LanguageToggle />
              <Button asChild variant="outline" size="sm" className="flex-1">
                <Link href="/sign-in">{t.nav.signIn}</Link>
              </Button>
              <Button asChild variant="gradient" size="sm" className="flex-1">
                <Link href="/sign-up">{t.nav.getStarted}</Link>
              </Button>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
