"use client";

import Link from "next/link";
import { HyreLogo } from "@/components/shared/hyrefy-logo";
import { useLanguage } from "@/components/shared/language-provider";
import { LanguageToggle } from "@/components/shared/language-toggle";

export function Footer() {
  const { t } = useLanguage();

  const footerLinks = [
    {
      label: t.footer.product,
      links: [
        { label: t.footer.links.features, href: "#features" },
        { label: t.footer.links.pricing, href: "/pricing" },
        { label: t.footer.links.changelog, href: "/changelog" },
      ],
    },
    {
      label: t.footer.company,
      links: [
        { label: t.footer.links.about, href: "/about" },
        { label: t.footer.links.blog, href: "/blog" },
        { label: t.footer.links.careers, href: "/careers" },
      ],
    },
    {
      label: t.footer.legal,
      links: [
        { label: t.footer.links.privacy, href: "/privacy" },
        { label: t.footer.links.terms, href: "/terms" },
      ],
    },
  ];

  return (
    <footer className="border-t border-border/50 pt-12 pb-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <HyreLogo size={32} />
              <span className="text-base font-bold">Hyrefy</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mb-4">
              {t.footer.tagline}
            </p>
            <LanguageToggle />
          </div>

          {footerLinks.map((section) => (
            <div key={section.label}>
              <h3 className="text-sm font-semibold mb-4">{section.label}</h3>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 border-t border-border/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Hyrefy. {t.footer.copyright}
          </p>
          <p className="text-sm text-muted-foreground">
            Powered by Hyrefy AI · EN / FR
          </p>
        </div>
      </div>
    </footer>
  );
}
