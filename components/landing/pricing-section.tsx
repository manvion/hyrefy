"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/components/shared/language-provider";
import { Check, Zap, Globe } from "lucide-react";
import { useState, useEffect } from "react";

const CURRENCY_MAP: Record<string, { symbol: string; monthly: number; yearly: number; code: string }> = {
  CA: { symbol: "CA$", monthly: 25, yearly: 150, code: "CAD" },
  US: { symbol: "$",   monthly: 19, yearly: 114, code: "USD" },
  GB: { symbol: "£",   monthly: 15, yearly: 90,  code: "GBP" },
  AU: { symbol: "A$",  monthly: 28, yearly: 168, code: "AUD" },
  NZ: { symbol: "NZ$", monthly: 29, yearly: 174, code: "NZD" },
  FR: { symbol: "€",   monthly: 18, yearly: 108, code: "EUR" },
  BE: { symbol: "€",   monthly: 18, yearly: 108, code: "EUR" },
  CH: { symbol: "CHF", monthly: 19, yearly: 114, code: "CHF" },
  IN: { symbol: "₹",   monthly: 999, yearly: 5994, code: "INR" },
};

const DEFAULT_CURRENCY = CURRENCY_MAP.CA;

function useGeoPrice() {
  const [price, setPrice] = useState(DEFAULT_CURRENCY);
  const [countryCode, setCountryCode] = useState("CA");

  useEffect(() => {
    fetch("/api/geo")
      .then((r) => r.json())
      .then((d) => {
        const code = d.country as string;
        if (CURRENCY_MAP[code]) {
          setPrice(CURRENCY_MAP[code]);
          setCountryCode(code);
        }
      })
      .catch(() => {});
  }, []);

  return { price, countryCode };
}

export function PricingSection() {
  const { t } = useLanguage();
  const { free, premium } = t.pricing;
  const { price, countryCode } = useGeoPrice();
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");

  const displayPrice = billing === "monthly" ? price.monthly : Math.round(price.yearly / 12);
  const yearlySavings = Math.round(((price.monthly * 12 - price.yearly) / (price.monthly * 12)) * 100);

  return (
    <section id="pricing" className="py-24 relative">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-primary/5 rounded-full blur-[100px]" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
            {t.pricing.title}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            {t.pricing.subtitle}
          </p>

          {/* Billing toggle */}
          <div className="inline-flex items-center gap-1 rounded-xl border border-border/50 bg-card/30 p-1">
            <button
              onClick={() => setBilling("monthly")}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${billing === "monthly" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBilling("yearly")}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${billing === "yearly" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              Yearly
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded">Save 50%</span>
            </button>
          </div>

          {/* Geo currency indicator */}
          <div className="flex items-center justify-center gap-1.5 mt-3 text-xs text-muted-foreground">
            <Globe className="h-3 w-3" />
            <span>Prices shown in {price.code} for {countryCode}</span>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free plan */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative rounded-2xl border border-border/50 bg-card/30 p-8"
          >
            <div className="mb-6">
              <h3 className="text-xl font-bold mb-1">{free.name}</h3>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-4xl font-bold">{free.price}</span>
                <span className="text-muted-foreground">{free.period}</span>
              </div>
              <p className="text-sm text-muted-foreground">{free.desc}</p>
            </div>
            <ul className="space-y-3 mb-8">
              {free.features.map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 flex-shrink-0">
                    <Check className="h-3 w-3 text-primary" />
                  </div>
                  {f}
                </li>
              ))}
            </ul>
            <Button asChild variant="outline" size="lg" className="w-full">
              <Link href="/sign-up">{free.cta}</Link>
            </Button>
          </motion.div>

          {/* Premium plan */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="relative rounded-2xl border-2 border-primary/50 bg-primary/5 shadow-xl shadow-primary/10 p-8"
          >
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <Badge variant="purple" className="px-3 py-1 shadow-lg">
                <Zap className="mr-1 h-3 w-3" />
                {premium.badge}
              </Badge>
            </div>
            <div className="mb-6">
              <h3 className="text-xl font-bold mb-1">{premium.name}</h3>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-4xl font-bold">{price.symbol}{displayPrice}</span>
                <span className="text-muted-foreground">/mo</span>
              </div>
              {billing === "yearly" && (
                <p className="text-xs text-emerald-400 mb-2">
                  {price.symbol}{price.yearly} billed annually · Save {yearlySavings}%
                </p>
              )}
              <p className="text-sm text-muted-foreground">{premium.desc}</p>
            </div>
            <ul className="space-y-3 mb-8">
              {premium.features.map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 flex-shrink-0">
                    <Check className="h-3 w-3 text-primary" />
                  </div>
                  {f}
                </li>
              ))}
            </ul>
            <Button asChild variant="gradient" size="lg" className="w-full">
              <Link href={`/sign-up?plan=premium&billing=${billing}`}>{premium.cta}</Link>
            </Button>
          </motion.div>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-sm text-muted-foreground mt-8"
        >
          SSL encrypted · GDPR compliant · 99.9% uptime · Cancel anytime
        </motion.p>
      </div>
    </section>
  );
}
