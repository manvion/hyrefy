import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { stripe } from "@/lib/utils/stripe";
import { getPricing } from "@/lib/utils/pricing";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await db.user.findUnique({
      where: { clerkId: userId },
      include: { subscription: true },
    });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    if (user.subscription?.status === "PREMIUM") {
      return NextResponse.json({ error: "Already subscribed" }, { status: 400 });
    }

    const origin = req.headers.get("origin") || "http://localhost:3000";
    const country = req.headers.get("x-vercel-ip-country") || req.headers.get("cf-ipcountry") || "US";
    const pricing = getPricing(country);

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer_email: user.email || undefined,
      line_items: [
        {
          price_data: {
            currency: pricing.currency,
            product_data: {
              name: "Hyrefy Premium",
              description: "Unlimited resume & cover letter generations, all 9 countries, PDF downloads, 6-month history",
            },
            unit_amount: pricing.amount,
            recurring: { interval: "month" },
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/billing?success=true`,
      cancel_url: `${origin}/billing?canceled=true`,
      metadata: { userId: user.id, clerkId: userId },
      subscription_data: { metadata: { userId: user.id } },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
