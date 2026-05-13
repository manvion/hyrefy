import { Metadata } from "next";
import { LandingNav } from "@/components/landing/landing-nav";
import { PricingSection } from "@/components/landing/pricing-section";
import { CtaSection } from "@/components/landing/cta-section";
import { Footer } from "@/components/landing/footer";

export const metadata: Metadata = { title: "Pricing" };

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      <LandingNav />
      <div className="pt-16">
        <PricingSection />
        <CtaSection />
      </div>
      <Footer />
    </div>
  );
}
