"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { loadStripe } from "@stripe/stripe-js";
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Check, Zap, CreditCard, ExternalLink, Loader2, CheckCircle, X,
  ShieldCheck, Lock, AlertTriangle, Calendar,
} from "lucide-react";
import { toast } from "@/components/ui/toaster";
import type { CountryPrice } from "@/lib/utils/pricing";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const PREMIUM_FEATURES = [
  "Unlimited resume & cover letter generations",
  "Unlimited resume builds",
  "Unlimited interview prep sessions",
  "All 9 countries + local standards",
  "PDF & Word (.docx) download",
  "Resume templates (6 designs)",
  "All 4 rewrite modes",
  "6-month full history",
  "Advanced ATS scoring",
  "English & French output",
  "Priority AI processing",
  "Priority support",
  "Early access to new features",
];

interface SubscriptionData {
  status: string;
  scansUsed: number;
  scansLimit: number;
  currentPeriodEnd?: string;
  hasStripeCustomer?: boolean;
  stripeSubscriptionId?: string;
}

// ─── Checkout modal ─────────────────────────────────────────────────────────────

function CheckoutModal({
  initialBilling, pricing, isNewUser, onClose,
}: {
  initialBilling?: "monthly" | "yearly";
  pricing: CountryPrice | null;
  isNewUser: boolean;
  onClose: () => void;
}) {
  const [billing, setBilling] = useState<"monthly" | "yearly" | null>(initialBilling ?? null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startCheckout = useCallback(async (plan: "monthly" | "yearly") => {
    setBilling(plan);
    setLoadingPlan(true);
    setError(null);
    const locale = typeof navigator !== "undefined" && navigator.language.toLowerCase().startsWith("fr") ? "fr" : "en";
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale, billing: plan }),
      });
      const data = await res.json();
      if (data.clientSecret) setClientSecret(data.clientSecret);
      else setError(data.error || "Failed to start checkout");
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setLoadingPlan(false);
    }
  }, []);

  // Auto-start if billing pre-selected (e.g. from URL param)
  useEffect(() => {
    if (initialBilling) startCheckout(initialBilling);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const monthlyFull = pricing?.displayAmount ?? "$20";
  const firstMonthPrice = pricing?.displayFirstMonth ?? "$10";
  const yearlyPerMonth = pricing ? `${pricing.symbol}${pricing.displayYearlyPerMonth}` : "$10";
  const yearlyTotal = pricing?.displayYearlyTotal ?? "$120";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={!clientSecret ? onClose : undefined} />

      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 8 }}
        className="relative z-10 w-full max-w-lg bg-background rounded-2xl border border-border/50 shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/40 bg-card/50">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-500" />
            <span className="font-semibold text-foreground">
              {clientSecret ? "Secure Checkout" : "Choose Your Plan"}
            </span>
            {billing && clientSecret && (
              <Badge variant="secondary" className="text-[10px] py-0">
                {billing === "yearly" ? "Annual · Save 50%" : "Monthly"}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-xs text-muted-foreground"><Lock className="h-3 w-3" />Stripe</span>
            <button onClick={onClose} className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-all">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Step 1 — Plan chooser */}
        {!clientSecret && !loadingPlan && (
          <div className="p-5 space-y-4">
            <p className="text-xs text-muted-foreground text-center">Select your billing period to continue</p>

            <div className="grid grid-cols-2 gap-3">
              {/* Monthly */}
              <button
                onClick={() => startCheckout("monthly")}
                className="relative rounded-2xl border-2 border-border/50 bg-card/40 p-4 text-left hover:border-primary/40 hover:bg-primary/5 transition-all"
              >
                <p className="text-sm font-semibold text-foreground mb-2">Monthly</p>
                {isNewUser ? (
                  <>
                    <p className="text-xs text-muted-foreground line-through">{monthlyFull}/mo</p>
                    <p className="text-2xl font-bold text-emerald-400">{firstMonthPrice}</p>
                    <p className="text-xs text-muted-foreground">/mo first month</p>
                    <p className="text-xs text-muted-foreground mt-1">then {monthlyFull}/mo</p>
                  </>
                ) : (
                  <>
                    <p className="text-2xl font-bold text-foreground">{monthlyFull}</p>
                    <p className="text-xs text-muted-foreground">/mo · cancel anytime</p>
                  </>
                )}
              </button>

              {/* Annual — highlighted */}
              <button
                onClick={() => startCheckout("yearly")}
                className="relative rounded-2xl border-2 border-emerald-500/60 bg-emerald-500/5 p-4 text-left hover:border-emerald-500 hover:bg-emerald-500/10 transition-all"
              >
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                  <span className="text-[10px] font-bold bg-emerald-500 text-white px-2.5 py-0.5 rounded-full whitespace-nowrap">
                    BEST VALUE
                  </span>
                </div>
                <p className="text-sm font-semibold text-foreground mb-2">Annual</p>
                <p className="text-xs text-muted-foreground line-through">{monthlyFull}/mo</p>
                <p className="text-2xl font-bold text-emerald-400">{yearlyPerMonth}</p>
                <p className="text-xs text-muted-foreground">/mo · {yearlyTotal} billed yearly</p>
              </button>
            </div>

            {error && (
              <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}
          </div>
        )}

        {/* Loading */}
        {loadingPlan && (
          <div className="flex flex-col items-center justify-center py-14 gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Setting up your checkout…</p>
          </div>
        )}

        {/* Step 2 — Stripe embedded checkout */}
        {clientSecret && (
          <div className="p-4 max-h-[80vh] overflow-y-auto">
            {error && (
              <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 mb-4">
                <p className="text-sm text-destructive">{error}</p>
                <Button size="sm" variant="outline" className="mt-2" onClick={() => billing && startCheckout(billing)}>
                  Try again
                </Button>
              </div>
            )}
            <EmbeddedCheckoutProvider stripe={stripePromise} options={{ clientSecret }}>
              <EmbeddedCheckout />
            </EmbeddedCheckoutProvider>
          </div>
        )}
      </motion.div>
    </div>
  );
}

// ─── Billing page ────────────────────────────────────────────────────────────────

export default function BillingPage() {
  const searchParams = useSearchParams();
  const success = searchParams.get("success");
  const autoCheckout = searchParams.get("checkout") === "1";

  const [showCheckout, setShowCheckout] = useState(false);
  const billingParam = searchParams.get("billing") as "monthly" | "yearly" | null;
  const [pageLoading, setPageLoading] = useState(true);
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [pricing, setPricing] = useState<CountryPrice | null>(null);

  useEffect(() => {
    if (success) {
      toast({ title: "Welcome to Premium!", description: "Your subscription is now active.", variant: "success" });
    }

    Promise.all([
      fetch("/api/user/subscription").then((r) => r.json()).catch(() => null),
      fetch("/api/user/geo").then((r) => r.json()).then((d) => d.pricing).catch(() => null),
    ]).then(([sub, pricingData]) => {
      if (sub) setSubscription(sub);
      if (pricingData) setPricing(pricingData);

      // Premium users with a Stripe subscription → go directly to portal, skip pricing UI
      if (sub?.status === "PREMIUM" && sub?.hasStripeCustomer && !autoCheckout && !success) {
        fetch("/api/stripe/portal", { method: "POST" })
          .then((r) => r.json())
          .then((data) => {
            if (data.url) {
              window.location.href = data.url;
              // keep pageLoading true — spinner stays until browser navigates away
            } else {
              setPageLoading(false);
            }
          })
          .catch(() => setPageLoading(false));
      } else {
        if (autoCheckout && sub?.status !== "PREMIUM") setShowCheckout(true);
        setPageLoading(false);
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isPremium = subscription?.status === "PREMIUM";
  const isNewUser = !subscription?.stripeSubscriptionId && !isPremium;

  // Pricing display — pricing is always set before pageLoading becomes false, so no US flash
  const monthlyDisplay = pricing?.displayAmount ?? "";
  const yearlyPerMonthDisplay = pricing ? `${pricing.symbol}${pricing.displayYearlyPerMonth}` : "";
  const yearlyTotalDisplay = pricing?.displayYearlyTotal ?? "";
  const firstMonthDisplay = pricing?.displayFirstMonth ?? "";

  // Days remaining
  const daysRemaining = (() => {
    if (!subscription?.currentPeriodEnd) return null;
    const diff = new Date(subscription.currentPeriodEnd).getTime() - Date.now();
    return Math.ceil(diff / 86400000);
  })();
  const isExpiringSoon = daysRemaining !== null && daysRemaining <= 7 && daysRemaining > 0;
  const isExpired = daysRemaining !== null && daysRemaining <= 0;

  const handlePortal = async () => {
    setPageLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
        return; // keep spinner until browser navigates away
      }
      throw new Error(data.error || "Portal error");
    } catch (err: unknown) {
      setPageLoading(false);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to open portal",
        variant: "destructive",
      });
    }
  };

  if (pageLoading) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Billing</h1>
          <p className="text-muted-foreground mt-1">Manage your subscription and usage</p>
        </div>

        {/* Success banner */}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 flex items-center gap-3"
          >
            <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">Subscription activated!</p>
              <p className="text-xs text-muted-foreground">You now have access to all Premium features.</p>
            </div>
          </motion.div>
        )}

        {/* Renewal alert */}
        {isPremium && (isExpiringSoon || isExpired) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-xl border p-4 flex items-start gap-3 ${
              isExpired ? "border-destructive/30 bg-destructive/5" : "border-amber-500/30 bg-amber-500/5"
            }`}
          >
            <AlertTriangle className={`h-5 w-5 shrink-0 mt-0.5 ${isExpired ? "text-destructive" : "text-amber-500"}`} />
            <div className="flex-1">
              <p className={`text-sm font-semibold ${isExpired ? "text-destructive" : "text-amber-500"}`}>
                {isExpired
                  ? "Subscription expired"
                  : `Subscription expires in ${daysRemaining} day${daysRemaining === 1 ? "" : "s"}`}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isExpired ? "Renew now to restore access." : "Renew now for uninterrupted access."}
              </p>
            </div>
            <button
              onClick={handlePortal}
              disabled={pageLoading}
              className="shrink-0 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {pageLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Renew"}
            </button>
          </motion.div>
        )}

        {/* Current plan */}
        <Card className="border-border/50 bg-card/30">
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between text-foreground">
              Current Plan
              <Badge variant={isPremium ? "success" : "secondary"}>
                {isPremium ? "Premium" : "Free"}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isPremium && subscription && (
              <div>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-muted-foreground">Scans used this month</span>
                  <span className="font-medium text-foreground">
                    {subscription.scansUsed}/{subscription.scansLimit}
                  </span>
                </div>
                <Progress value={(subscription.scansUsed / Math.max(subscription.scansLimit, 1)) * 100} className="h-2" />
              </div>
            )}
            {isPremium && subscription?.currentPeriodEnd && (
              <div className="flex items-center gap-3 p-3 rounded-xl border border-border/40 bg-muted/20">
                <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Next billing date</p>
                  <p className="text-sm font-medium">
                    {new Date(subscription.currentPeriodEnd).toLocaleDateString("en-CA", {
                      year: "numeric", month: "long", day: "numeric",
                    })}
                  </p>
                </div>
                {daysRemaining !== null && (
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    isExpired ? "bg-destructive/10 text-destructive"
                    : isExpiringSoon ? "bg-amber-500/10 text-amber-500"
                    : "bg-emerald-500/10 text-emerald-400"
                  }`}>
                    {isExpired ? "Expired" : `${daysRemaining}d left`}
                  </span>
                )}
              </div>
            )}
            {isPremium && subscription?.hasStripeCustomer && (
              <div className="flex flex-wrap gap-2">
                <Button onClick={handlePortal} disabled={pageLoading} variant="outline">
                  {pageLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ExternalLink className="mr-2 h-4 w-4" />}
                  Manage Subscription
                </Button>
                <Button onClick={handlePortal} disabled={pageLoading} variant="outline"
                  className="text-destructive border-destructive/30 hover:bg-destructive/10">
                  {pageLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <X className="mr-2 h-4 w-4" />}
                  Cancel Plan
                </Button>
              </div>
            )}
            {isPremium && !subscription?.hasStripeCustomer && (
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3">
                <p className="text-xs font-semibold text-amber-400 mb-0.5">Admin-granted access</p>
                <p className="text-xs text-muted-foreground mb-3">
                  Your premium access was granted directly. Start a paid subscription to continue after it expires.
                </p>
                <Button onClick={() => setShowCheckout(true)} variant="gradient" size="sm">
                  <CreditCard className="mr-2 h-3.5 w-3.5" />
                  Start Paid Subscription
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upgrade section — only for non-premium users */}
        {!isPremium && (
          <div className="space-y-6">
            {/* Plan cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Free */}
              <Card className="border-border/50 bg-card/30">
                <CardHeader>
                  <CardTitle className="text-base text-foreground">Free Plan</CardTitle>
                  <CardDescription>Your current plan</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold mb-4 text-foreground">
                    $0<span className="text-sm text-muted-foreground font-normal">/mo</span>
                  </p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2"><Check className="h-4 w-4 shrink-0" /> 3 tailored resume generations/month</li>
                    <li className="flex items-center gap-2"><Check className="h-4 w-4 shrink-0" /> 1 resume build/month</li>
                    <li className="flex items-center gap-2"><Check className="h-4 w-4 shrink-0" /> 1 interview prep session/month</li>
                    <li className="flex items-center gap-2"><Check className="h-4 w-4 shrink-0" /> 4 supported countries</li>
                    <li className="flex items-center gap-2"><Check className="h-4 w-4 shrink-0" /> PDF download</li>
                    <li className="flex items-center gap-2"><Check className="h-4 w-4 shrink-0" /> Basic ATS scoring</li>
                    <li className="flex items-center gap-2"><Check className="h-4 w-4 shrink-0" /> English & French output</li>
                  </ul>
                </CardContent>
              </Card>

              {/* Premium */}
              <Card className="border-2 border-primary/50 bg-primary/5 relative">
                <div className="absolute -top-3 left-6">
                  <Badge variant="purple" className="shadow-lg">
                    <Zap className="mr-1 h-3 w-3" />Recommended
                  </Badge>
                </div>
                <CardHeader>
                  <CardTitle className="text-base text-foreground">Premium Plan</CardTitle>
                  <CardDescription>Everything you need to land the job</CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Price preview — two options side by side */}
                  <div className="grid grid-cols-2 gap-2 mb-5">
                    <div className="rounded-xl border border-border/40 bg-muted/20 p-3 text-center">
                      <p className="text-[10px] text-muted-foreground mb-1">Monthly</p>
                      {isNewUser && <p className="text-xs line-through text-muted-foreground">{monthlyDisplay}/mo</p>}
                      <p className="text-xl font-bold text-foreground">{isNewUser ? firstMonthDisplay : monthlyDisplay}</p>
                      <p className="text-[10px] text-muted-foreground">{isNewUser ? "1st month" : "/mo"}</p>
                      {isNewUser && <p className="text-[9px] text-muted-foreground">then {monthlyDisplay}/mo</p>}
                    </div>
                    <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/5 p-3 text-center relative">
                      <div className="absolute -top-2 left-1/2 -translate-x-1/2">
                        <span className="text-[9px] font-bold bg-emerald-500 text-white px-2 py-0.5 rounded-full whitespace-nowrap">BEST VALUE</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground mb-1">Annual</p>
                      <p className="text-xs line-through text-muted-foreground">{monthlyDisplay}/mo</p>
                      <p className="text-xl font-bold text-emerald-400">{yearlyPerMonthDisplay}</p>
                      <p className="text-[10px] text-muted-foreground">/mo · {yearlyTotalDisplay}/yr</p>
                    </div>
                  </div>

                  <ul className="space-y-2 text-sm mb-6">
                    {PREMIUM_FEATURES.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-foreground">
                        <div className="h-4 w-4 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                          <Check className="h-2.5 w-2.5 text-primary" />
                        </div>
                        {f}
                      </li>
                    ))}
                  </ul>

                  <Button onClick={() => setShowCheckout(true)} variant="gradient" className="w-full" size="lg">
                    <CreditCard className="mr-2 h-4 w-4" />
                    {isNewUser ? "Claim Offer & Choose Plan" : "Choose Plan & Upgrade"}
                  </Button>

                  <p className="text-[11px] text-muted-foreground mt-3 flex items-center justify-center gap-1">
                    <Lock className="h-3 w-3" />You&apos;ll choose Monthly or Annual on the next screen
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showCheckout && (
          <CheckoutModal
            initialBilling={billingParam ?? undefined}
            pricing={pricing}
            isNewUser={isNewUser}
            onClose={() => setShowCheckout(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
