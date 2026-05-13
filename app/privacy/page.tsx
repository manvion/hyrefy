import type { Metadata } from "next";
import Link from "next/link";
import { HyreLogo } from "@/components/shared/hyrefy-logo";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="flex h-16 items-center px-6 lg:px-12 border-b border-border/20">
        <Link href="/" className="flex items-center gap-2.5">
          <HyreLogo size={32} />
          <span className="text-lg font-bold tracking-tight">Hyrefy</span>
        </Link>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-16 prose prose-invert prose-sm">
        <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" })}</p>

        <section className="space-y-6 text-muted-foreground leading-relaxed">
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-3">1. What We Collect</h2>
            <p>When you use Hyrefy, we collect the information you provide directly: your name, email address, and resume content. We also collect usage data (pages visited, features used) to improve our service.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-foreground mb-3">2. How We Use Your Data</h2>
            <p>Your resume content is processed by our AI engine solely to generate tailored resumes and cover letters on your behalf. We do not sell, trade, or share your personal data with third parties for marketing purposes. Resume data is processed in real-time and not retained beyond the generation call.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-foreground mb-3">3. Data Storage</h2>
            <p>Your account data and generation history are stored securely in an encrypted PostgreSQL database. We retain your generation history for 6 months, after which it is automatically deleted. You can request deletion of your account and all associated data at any time by contacting us.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-foreground mb-3">4. Authentication</h2>
            <p>We use Clerk for authentication. Your login credentials are never stored directly by Hyrefy — Clerk handles all authentication securely. Please refer to <a href="https://clerk.com/privacy" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">Clerk&apos;s Privacy Policy</a> for details on how they handle authentication data.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-foreground mb-3">5. Payments</h2>
            <p>Payment processing is handled entirely by Stripe. We do not store your payment card information. Please refer to <a href="https://stripe.com/privacy" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">Stripe&apos;s Privacy Policy</a> for details.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-foreground mb-3">6. Cookies</h2>
            <p>We use essential cookies for authentication and session management. We do not use tracking or advertising cookies.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-foreground mb-3">7. Your Rights</h2>
            <p>You have the right to access, correct, or delete your personal data at any time. To exercise these rights, contact us at <a href="mailto:privacy@hyrefy.com" className="text-primary hover:underline">privacy@hyrefy.com</a>.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-foreground mb-3">8. Contact</h2>
            <p>For privacy inquiries: <a href="mailto:privacy@hyrefy.com" className="text-primary hover:underline">privacy@hyrefy.com</a></p>
          </div>
        </section>
      </main>

      <footer className="py-6 text-center text-xs text-muted-foreground/40 border-t border-border/20">
        <Link href="/" className="hover:text-muted-foreground transition-colors">← Back to Hyrefy</Link>
      </footer>
    </div>
  );
}
