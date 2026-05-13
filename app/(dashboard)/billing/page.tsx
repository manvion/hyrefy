"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Check, Zap, CreditCard, ExternalLink, Loader2, CheckCircle } from "lucide-react";
import { toast } from "@/components/ui/toaster";

const PREMIUM_FEATURES = [
  "Unlimited resume & cover letter generations",
  "English + French output for every job",
  "All 9 countries with country-specific standards",
  "PDF download — resume & cover letter",
  "6-month full generation history",
  "Priority AI processing",
  "Priority support",
];

interface SubscriptionData {
  status: string;
  scansUsed: number;
  scansLimit: number;
  currentPeriodEnd?: string;
}

export default function BillingPage() {
  const searchParams = useSearchParams();
  const success = searchParams.get("success");
  const [loading, setLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);

  useEffect(() => {
    fetch("/api/user/subscription").then((r) => r.json()).then(setSubscription).catch(() => {});
    if (success) {
      toast({ title: "Welcome to Premium!", description: "Your subscription is now active.", variant: "success" });
    }
  }, [success]);

  const isPremium = subscription?.status === "PREMIUM";

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else throw new Error(data.error);
    } catch (err) {
      toast({ title: "Error", description: "Failed to start checkout", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handlePortal = async () => {
    setPortalLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {
      toast({ title: "Error", description: "Failed to open portal", variant: "destructive" });
    } finally {
      setPortalLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Billing</h1>
        <p className="text-muted-foreground mt-1">Manage your subscription and usage</p>
      </div>

      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 flex items-center gap-3"
        >
          <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0" />
          <div>
            <p className="text-sm font-medium text-emerald-400">Subscription activated!</p>
            <p className="text-xs text-muted-foreground">You now have access to all Premium features.</p>
          </div>
        </motion.div>
      )}

      {/* Current plan */}
      <Card className="border-border/50 bg-card/30">
        <CardHeader>
          <CardTitle className="text-base flex items-center justify-between">
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
                <span className="font-medium">{subscription.scansUsed}/{subscription.scansLimit}</span>
              </div>
              <Progress value={(subscription.scansUsed / subscription.scansLimit) * 100} className="h-2" />
            </div>
          )}
          {isPremium && subscription?.currentPeriodEnd && (
            <p className="text-sm text-muted-foreground">
              Next billing date: {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
            </p>
          )}
          {isPremium ? (
            <Button onClick={handlePortal} disabled={portalLoading} variant="outline">
              {portalLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ExternalLink className="mr-2 h-4 w-4" />}
              Manage Subscription
            </Button>
          ) : null}
        </CardContent>
      </Card>

      {/* Plans */}
      {!isPremium && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-border/50 bg-card/30">
            <CardHeader>
              <CardTitle className="text-base">Free Plan</CardTitle>
              <CardDescription>Your current plan</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold mb-4">$0<span className="text-sm text-muted-foreground font-normal">/mo</span></p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-muted-foreground" /> 3 scans/month</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-muted-foreground" /> Basic analysis</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-muted-foreground" /> Professional rewrite mode</li>
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
              <CardTitle className="text-base">Premium Plan</CardTitle>
              <CardDescription>Everything you need to land the job</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold mb-4">$19<span className="text-sm text-muted-foreground font-normal">/mo</span></p>
              <ul className="space-y-2 text-sm mb-6">
                {PREMIUM_FEATURES.map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full bg-primary/20 flex items-center justify-center">
                      <Check className="h-2.5 w-2.5 text-primary" />
                    </div>
                    {f}
                  </li>
                ))}
              </ul>
              <Button onClick={handleUpgrade} disabled={loading} variant="gradient" className="w-full">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CreditCard className="mr-2 h-4 w-4" />}
                Upgrade to Premium
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
