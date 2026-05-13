import type { Metadata } from "next";
import Link from "next/link";
import { HyreLogo } from "@/components/shared/hyrefy-logo";

export const metadata: Metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="flex h-16 items-center px-6 lg:px-12 border-b border-border/20">
        <Link href="/" className="flex items-center gap-2.5">
          <HyreLogo size={32} />
          <span className="text-lg font-bold tracking-tight">Hyrefy</span>
        </Link>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
        <p className="text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" })}</p>

        <section className="space-y-6 text-muted-foreground leading-relaxed text-sm">
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-3">1. Acceptance of Terms</h2>
            <p>By accessing or using Hyrefy (&quot;the Service&quot;), you agree to be bound by these Terms of Service. If you do not agree, please do not use the Service.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-foreground mb-3">2. Use of Service</h2>
            <p>Hyrefy provides AI-powered resume and cover letter generation tools. You may use the Service only for lawful purposes and in accordance with these Terms. You are responsible for the accuracy of the information you provide.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-foreground mb-3">3. Accounts</h2>
            <p>You must create an account to access most features. You are responsible for maintaining the confidentiality of your account credentials and for all activity under your account.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-foreground mb-3">4. Content & AI Generation</h2>
            <p>The AI-generated resumes and cover letters are based on the information you provide. You are solely responsible for reviewing, verifying, and ensuring the accuracy of all generated content before use. Hyrefy makes no guarantees about employment outcomes.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-foreground mb-3">5. Subscriptions & Payments</h2>
            <p>Premium subscriptions are billed monthly or yearly as selected. You may cancel at any time; cancellation takes effect at the end of the current billing period. Refunds are provided at our discretion for unused periods within 7 days of purchase.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-foreground mb-3">6. Intellectual Property</h2>
            <p>The Hyrefy platform, design, and code are owned by Hyrefy. The content you upload remains yours. You grant Hyrefy a limited license to process your content solely to provide the Service.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-foreground mb-3">7. Limitation of Liability</h2>
            <p>To the maximum extent permitted by law, Hyrefy shall not be liable for any indirect, incidental, or consequential damages arising from your use of the Service. Our total liability shall not exceed the amount you paid us in the 3 months preceding the claim.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-foreground mb-3">8. Termination</h2>
            <p>We reserve the right to suspend or terminate accounts that violate these Terms. You may delete your account at any time from your account settings.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-foreground mb-3">9. Governing Law</h2>
            <p>These Terms are governed by the laws of Ontario, Canada. Any disputes shall be resolved in the courts of Ontario.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-foreground mb-3">10. Contact</h2>
            <p>For questions about these Terms: <a href="mailto:legal@hyrefy.com" className="text-primary hover:underline">legal@hyrefy.com</a></p>
          </div>
        </section>
      </main>

      <footer className="py-6 text-center text-xs text-muted-foreground/40 border-t border-border/20">
        <Link href="/" className="hover:text-muted-foreground transition-colors">← Back to Hyrefy</Link>
      </footer>
    </div>
  );
}
