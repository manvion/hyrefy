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
import { Check, Zap, CreditCard, ExternalLink, Loader2, CheckCircle, X, ShieldCheck, Lock } from "lucide-react";
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
}

function CheckoutModal({ onClose }: { onClose: () => void }) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchClientSecret = useCallback(async () => {
    const locale = typeof navigator !== "undefined" && navigator.language.toLowerCase().startsWith("fr") ? "fr" : "en";
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale }),
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
  }, []);

  useEffect(() => { fetchClientSecret(); }, [fetchClientSecret]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
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
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Lock className="h-3 w-3" />Powered by Stripe
            </span>
            <button
              onClick={onClose}
              className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent active:bg-accent transition-all"
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
            <EmbeddedCheckoutProvider
              stripe={stripePromise}
              options={{ clientSecret }}
            >
              <EmbeddedCheckout />
            </EmbeddedCheckoutProvider>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default function BillingPage() {
  const searchParams = useSearchParams();
  const success = searchParams.get("success");
  const [showCheckout, setShowCheckout] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [pricing, setPricing] = useState<CountryPrice | null>(null);

  useEffect(() => {
    fetch("/api/user/subscription").then((r) => r.json()).then(setSubscription).catch(() => {});
    fetch("/api/user/geo").then((r) => r.json()).then((d) => setPricing(d.pricing)).catch(() => {});
    if (success) {
      toast({ title: "Welcome to Premium!", description: "Your subscription is now active.", variant: "success" });
    }
  }, [success]);

  const isPremium = subscription?.status === "PREMIUM";
  const displayPrice = pricing?.displayAmount ?? "$19";
  const displayLabel = pricing?.label ?? "USD";

  const handlePortal = async () => {
    setPortalLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else throw new Error(data.error || "Portal error");
    } catch (err: unknown) {
      toast({ title: "Error", description: err instanceof Error ? err.message : "Failed to open portal", variant: "destructive" });
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
                  <span className="font-medium text-foreground">{subscription.scansUsed}/{subscription.scansLimit}</span>
                </div>
                <Progress value={(subscription.scansUsed / subscription.scansLimit) * 100} className="h-2" />
              </div>
            )}
            {isPremium && subscription?.currentPeriodEnd && (
              <p className="text-sm text-muted-foreground">
                Next billing date: {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
              </p>
            )}
            {isPremium && (
              <Button onClick={handlePortal} disabled={portalLoading} variant="outline">
                {portalLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ExternalLink className="mr-2 h-4 w-4" />}
                Manage Subscription
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Plans */}
        {!isPremium && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-border/50 bg-card/30">
              <CardHeader>
                <CardTitle className="text-base text-foreground">Free Plan</CardTitle>
                <CardDescription>Your current plan</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold mb-4 text-foreground">$0<span className="text-sm text-muted-foreground font-normal">/mo</span></p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-muted-foreground" /> 3 tailored resume generations/month</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-muted-foreground" /> 1 resume build/month</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-muted-foreground" /> 1 interview prep session/month</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-muted-foreground" /> 4 supported countries (US, CA, UK, IN)</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-muted-foreground" /> PDF download (print)</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-muted-foreground" /> Professional rewrite mode</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-muted-foreground" /> Basic ATS scoring</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-muted-foreground" /> English & French output</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-muted-foreground" /> Community support</li>
                </ul>
              </CardContent>
            </Card>

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
                <div className="mb-4">
                  <p className="text-3xl font-bold text-foreground">
                    {displayPrice}
                    <span className="text-sm text-muted-foreground font-normal">/mo</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">Billed in {displayLabel} · Cancel anytime</p>
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

                <Button
                  onClick={() => setShowCheckout(true)}
                  variant="gradient"
                  className="w-full"
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  Upgrade to Premium
                </Button>

                <p className="text-[11px] text-muted-foreground mt-3 flex items-center justify-center gap-1">
                  <Lock className="h-3 w-3" />Secure payment · Powered by Stripe
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Embedded checkout modal */}
      <AnimatePresence>
        {showCheckout && <CheckoutModal onClose={() => setShowCheckout(false)} />}
      </AnimatePresence>
    </>
  );
}
