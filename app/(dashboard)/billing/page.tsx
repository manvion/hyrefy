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
  ShieldCheck, Lock, AlertTriangle, Calendar, Gift,
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

function CheckoutModal({ billing, onClose }: { billing: "monthly" | "yearly"; onClose: () => void }) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchClientSecret = useCallback(async () => {
    setError(null);
    const locale =
      typeof navigator !== "undefined" && navigator.language.toLowerCase().startsWith("fr") ? "fr" : "en";
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale, billing }),
      });
      const data = await res.json();
      if (data.clientSecret) {
        setClientSecret(data.clientSecret);
      } else {
        setError(data.error || "Failed to start checkout");
      }
    } catch {
      setError("Connection error. Please try again.");
    }
  }, [billing]);

  useEffect(() => { fetchClientSecret(); }, [fetchClientSecret]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

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
            <span className="font-semibold text-foreground">Secure Checkout</span>
            <Badge variant="secondary" className="text-[10px] py-0">
              {billing === "yearly" ? "Annual · Save 50%" : "Monthly"}
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Lock className="h-3 w-3" />Stripe
            </span>
            <button
              onClick={onClose}
              className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Checkout area */}
        <div className="p-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 mb-4">
              <p className="text-sm text-destructive">{error}</p>
              <Button size="sm" variant="outline" className="mt-2" onClick={fetchClientSecret}>
                Try again
              </Button>
            </div>
          )}

          {!clientSecret && !error && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          )}

          {clientSecret && (
            <EmbeddedCheckoutProvider stripe={stripePromise} options={{ clientSecret }}>
              <EmbeddedCheckout />
            </EmbeddedCheckoutProvider>
          )}
        </div>
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
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
  const [portalLoading, setPortalLoading] = useState(false);
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [pricing, setPricing] = useState<CountryPrice | null>(null);

  useEffect(() => {
    fetch("/api/user/subscription")
      .then((r) => r.json())
      .then((sub) => {
        setSubscription(sub);
        if (autoCheckout && sub?.status !== "PREMIUM") setShowCheckout(true);
      })
      .catch(() => {});
    fetch("/api/user/geo")
      .then((r) => r.json())
      .then((d) => setPricing(d.pricing))
      .catch(() => {});
    if (success) {
      toast({ title: "Welcome to Premium!", description: "Your subscription is now active.", variant: "success" });
    }
  }, [success, autoCheckout]);

  const isPremium = subscription?.status === "PREMIUM";
  const isNewUser = !subscription?.stripeSubscriptionId && !isPremium;

  // Pricing display
  const sym = pricing?.symbol ?? "$";
  const label = pricing?.label ?? "USD";
  const monthlyDisplay = pricing?.displayAmount ?? "$19";
  const yearlyPerMonthDisplay = pricing ? `${sym}${pricing.displayYearlyPerMonth}` : "$9.50";
  const yearlyTotalDisplay = pricing?.displayYearlyTotal ?? "$114";

  // Active price to show in the premium card
  const activePriceDisplay =
    billing === "yearly" ? yearlyPerMonthDisplay : monthlyDisplay;
  const activePriceSubline =
    billing === "yearly"
      ? `${yearlyTotalDisplay} billed annually · Save 50%`
      : isNewUser
      ? `First month 50% off — then ${monthlyDisplay}/mo`
      : `Billed monthly · Cancel anytime`;

  // Days remaining
  const daysRemaining = (() => {
    if (!subscription?.currentPeriodEnd) return null;
    const diff = new Date(subscription.currentPeriodEnd).getTime() - Date.now();
    return Math.ceil(diff / 86400000);
  })();
  const isExpiringSoon = daysRemaining !== null && daysRemaining <= 7 && daysRemaining > 0;
  const isExpired = daysRemaining !== null && daysRemaining <= 0;

  const handlePortal = async () => {
    setPortalLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else throw new Error(data.error || "Portal error");
    } catch (err: unknown) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to open portal",
        variant: "destructive",
      });
    } finally {
      setPortalLoading(false);
    }
  };

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
              disabled={portalLoading}
              className="shrink-0 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {portalLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Renew"}
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
                <Button onClick={handlePortal} disabled={portalLoading} variant="outline">
                  {portalLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ExternalLink className="mr-2 h-4 w-4" />}
                  Manage Subscription
                </Button>
                <Button onClick={handlePortal} disabled={portalLoading} variant="outline"
                  className="text-destructive border-destructive/30 hover:bg-destructive/10">
                  {portalLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <X className="mr-2 h-4 w-4" />}
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
            {/* First-month promo banner for new users */}
            {isNewUser && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 px-4 py-3 flex items-center gap-3"
              >
                <Gift className="h-5 w-5 text-emerald-400 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-emerald-400">New user offer: 50% off your first month!</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Automatically applied at checkout on monthly plan. No code needed.
                  </p>
                </div>
              </motion.div>
            )}

            {/* Billing toggle */}
            <div className="flex flex-col items-center gap-2">
              <div className="inline-flex items-center gap-1 rounded-xl border border-border/50 bg-card/30 p-1">
                <button
                  onClick={() => setBilling("monthly")}
                  className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                    billing === "monthly"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Monthly
                  {isNewUser && billing === "monthly" && (
                    <span className="ml-2 text-[10px] font-bold bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded">
                      50% OFF 1ST
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setBilling("yearly")}
                  className={`px-5 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                    billing === "yearly"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Annual
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded">
                    Save 50%
                  </span>
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                {billing === "yearly"
                  ? `Pay once per year · ${yearlyTotalDisplay}/yr · Prices in ${label}`
                  : `Pay monthly · Prices in ${label} · Cancel anytime`}
              </p>
            </div>

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
                  {/* Price display */}
                  <div className="mb-5">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-4xl font-bold text-foreground">{activePriceDisplay}</span>
                      <span className="text-sm text-muted-foreground">/mo</span>
                      {billing === "yearly" && (
                        <span className="text-sm font-semibold text-emerald-400 ml-1">· Save 50%</span>
                      )}
                    </div>
                    <p className={`text-xs mt-1 ${
                      billing === "monthly" && isNewUser ? "text-emerald-400 font-medium" : "text-muted-foreground"
                    }`}>
                      {activePriceSubline}
                    </p>
                    {/* What you pay today */}
                    {isNewUser && billing === "monthly" && (
                      <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                        <Gift className="h-3 w-3 text-emerald-400" />
                        <span className="text-xs font-semibold text-emerald-400">
                          Pay {monthlyDisplay && pricing
                            ? `${pricing.symbol}${(pricing.amount / 200).toFixed(2)}`
                            : "half price"} today
                        </span>
                      </div>
                    )}
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
                    {billing === "yearly" ? "Get Annual Plan" : isNewUser ? "Claim 50% Off & Upgrade" : "Upgrade to Premium"}
                  </Button>

                  <p className="text-[11px] text-muted-foreground mt-3 flex items-center justify-center gap-1">
                    <Lock className="h-3 w-3" />Secure payment · Powered by Stripe · Cancel anytime
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>

      {/* Checkout modal — passes billing type so API charges the right amount */}
      <AnimatePresence>
        {showCheckout && (
          <CheckoutModal billing={billing} onClose={() => setShowCheckout(false)} />
        )}
      </AnimatePresence>
    </>
  );
}
