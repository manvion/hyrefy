import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  typescript: true,
});

export const PLANS = {
  FREE: {
    name: "Free",
    price: 0,
    scansLimit: 3,
    features: [
      "3 ATS scans per month",
      "Basic keyword analysis",
      "Resume score",
      "PDF upload",
    ],
  },
  PREMIUM: {
    name: "Premium",
    price: 1900, // $19/month in cents
    priceId: process.env.STRIPE_PREMIUM_PRICE_ID!,
    scansLimit: -1, // unlimited
    features: [
      "Unlimited ATS scans",
      "Advanced AI rewrites",
      "All rewrite modes",
      "PDF & DOCX download",
      "Priority processing",
      "Resume history",
      "Bulk analysis",
    ],
  },
} as const;

export async function createCheckoutSession(
  userId: string,
  userEmail: string,
  priceId: string,
  successUrl: string,
  cancelUrl: string
): Promise<string> {
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    customer_email: userEmail,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: { userId },
    subscription_data: { metadata: { userId } },
  });
  return session.url!;
}

export async function createPortalSession(
  customerId: string,
  returnUrl: string
): Promise<string> {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
  return session.url;
}
