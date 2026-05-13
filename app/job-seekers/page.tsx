import type { Metadata } from "next";
import { LandingNav } from "@/components/landing/landing-nav";
import { HeroSection } from "@/components/landing/hero-section";
import { TrustBar } from "@/components/landing/trust-bar";
import { BeforeAfterSection } from "@/components/landing/before-after-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { HowItWorksSection } from "@/components/landing/how-it-works-section";
import { GlobalSection } from "@/components/landing/global-section";
import { TestimonialsSection } from "@/components/landing/testimonials-section";
import { PricingSection } from "@/components/landing/pricing-section";
import { CtaSection } from "@/components/landing/cta-section";
import { Footer } from "@/components/landing/footer";

export const metadata: Metadata = {
  title: "AI Resume & Cover Letter Generator | Beat ATS in Seconds",
  description:
    "Upload your resume once. Paste any job description — get a perfectly tailored resume and cover letter in English or French, optimized for 9 countries. Free to start.",
  keywords: [
    "AI resume generator", "cover letter generator", "ATS resume", "tailored resume",
    "resume builder Canada", "resume builder India", "bilingual resume", "job application AI",
    "resume optimization", "generateur CV IA", "lettre motivation IA",
  ],
  openGraph: {
    title: "Hyrefy — AI Resume & Cover Letter in Seconds",
    description: "Upload once. Paste the job. Download your tailored resume + cover letter — ATS-optimized, in English or French.",
    type: "website",
  },
};

export default function JobSeekersLandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <LandingNav />
      <main>
        <HeroSection />
        <TrustBar />
        <BeforeAfterSection />
        <FeaturesSection />
        <HowItWorksSection />
        <GlobalSection />
        <TestimonialsSection />
        <PricingSection />
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
}
