import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { stripe } from "@/lib/utils/stripe";
import { getPricing } from "@/lib/utils/pricing";

const WELCOME_COUPON_METADATA_KEY = "hyrefy_welcome_50";

/** Retrieve or create the "First Month 50% Off" coupon (created once, reused). */
async function getOrCreateWelcomeCoupon(): Promise<string> {
  // Check env override first
  if (process.env.STRIPE_WELCOME_COUPON_ID) {
    return process.env.STRIPE_WELCOME_COUPON_ID;
  }
  // Search existing coupons for our tagged one
  const list = await stripe.coupons.list({ limit: 100 });
  const existing = list.data.find(
    (c) => c.metadata?.[WELCOME_COUPON_METADATA_KEY] === "true" && c.valid
  );
  if (existing) return existing.id;

  // Create it once
  const coupon = await stripe.coupons.create({
    percent_off: 50,
    duration: "once",
    name: "50% off your first month — Welcome!",
    metadata: { [WELCOME_COUPON_METADATA_KEY]: "true" },
  });
  return coupon.id;
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const locale = (body.locale as string) === "fr" ? "fr" : "en";
    const billing: "monthly" | "yearly" = body.billing === "yearly" ? "yearly" : "monthly";

    const user = await db.user.findUnique({
      where: { clerkId: userId },
      include: { subscription: true },
    });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Block only users with an active Stripe subscription; admin-trial users can upgrade
    if (user.subscription?.status === "PREMIUM" && user.subscription?.stripeSubscriptionId) {
      return NextResponse.json({ error: "Already subscribed" }, { status: 400 });
    }

    const origin = req.headers.get("origin") || "http://localhost:3000";
    const country = req.headers.get("x-vercel-ip-country") || req.headers.get("cf-ipcountry") || "US";
    const pricing = getPricing(country);

    // New user = never had a Stripe subscription
    const isNewUser = !user.subscription?.stripeSubscriptionId;

    // Build line item based on billing period
    const isYearly = billing === "yearly";
    const unitAmount = isYearly ? pricing.yearlyAmount : pricing.amount;
    const interval = isYearly ? "year" : "month";
    const productName = isYearly
      ? "Hyrefy Premium — Annual (Save 50%)"
      : "Hyrefy Premium";
    const productDescription = isYearly
      ? "Unlimited generations, all 9 countries, PDF/DOCX downloads — billed annually"
      : "Unlimited resume & cover letter generations, all 9 countries, PDF downloads, 6-month history";

    // Apply welcome discount for new monthly users (50% off first invoice)
    const discounts: { coupon: string }[] = [];
    if (isNewUser && !isYearly) {
      const couponId = await getOrCreateWelcomeCoupon();
      discounts.push({ coupon: couponId });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sessionParams: any = {
      ui_mode: "embedded",
      mode: "subscription",
      payment_method_types: ["card"],
      customer_email: user.email || undefined,
      locale: locale as "en" | "fr",
      line_items: [
        {
          price_data: {
            currency: pricing.currency,
            product_data: {
              name: productName,
              description: productDescription,
            },
            unit_amount: unitAmount,
            recurring: { interval },
          },
          quantity: 1,
        },
      ],
      return_url: `${origin}/billing?success=true`,
      metadata: { userId: user.id, clerkId: userId, billing },
      subscription_data: { metadata: { userId: user.id } },
    };

    if (discounts.length > 0) {
      sessionParams.discounts = discounts;
    }

    const session = await stripe.checkout.sessions.create(sessionParams);
    return NextResponse.json({ clientSecret: session.client_secret });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
