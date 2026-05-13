import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { HyreLogo } from "@/components/shared/hyrefy-logo";

const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";
const isValidClerkKey =
  (clerkKey.startsWith("pk_test_") || clerkKey.startsWith("pk_live_")) &&
  clerkKey.length > 20 &&
  !clerkKey.includes("dummy");
const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true" || !isValidClerkKey;

const clerkAppearance = {
  variables: {
    colorPrimary: "#0A66C2",
    colorBackground: "#ffffff",
    colorInputBackground: "#f8fafc",
    colorText: "#0f172a",
    colorTextSecondary: "#64748b",
    colorNeutral: "#94a3b8",
    colorSuccess: "#10b981",
    colorDanger: "#ef4444",
    borderRadius: "0.75rem",
    fontFamily: "inherit",
    fontSize: "14px",
  },
};

function DemoSignUp() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F3F2EF] dark:bg-background px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <HyreLogo size={40} />
            <span className="text-xl font-bold text-slate-900 dark:text-foreground">Hyrefy</span>
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-foreground">Create your account</h1>
          <p className="text-slate-500 dark:text-muted-foreground mt-1">Start generating tailored resumes for free</p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-border/50 bg-white dark:bg-card/30 p-8 shadow-xl space-y-4">
          <div className="rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-500/30 dark:bg-amber-500/10 px-4 py-3">
            <p className="text-sm text-amber-700 dark:text-amber-400 font-medium">Demo Mode</p>
            <p className="text-xs text-amber-600/70 dark:text-muted-foreground mt-0.5">
              Add real Clerk keys in Vercel to enable full sign-up.
            </p>
          </div>
          <Button asChild variant="gradient" size="lg" className="w-full">
            <Link href="/dashboard">
              Continue to Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <p className="text-center text-xs text-slate-500 dark:text-muted-foreground">
            Already have an account?{" "}
            <Link href="/sign-in" className="text-[#0A66C2] hover:underline font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function ClerkSignUp() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { SignUp } = require("@clerk/nextjs");
  return (
    <div className="min-h-screen bg-[#F3F2EF] dark:bg-background flex flex-col">
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto w-full">
        <Link href="/" className="flex items-center gap-2.5 group">
          <HyreLogo size={36} />
          <span className="text-lg font-bold text-slate-900 dark:text-foreground group-hover:text-[#0A66C2] transition-colors">
            Hyrefy
          </span>
        </Link>
        <p className="text-sm text-slate-500 dark:text-muted-foreground">
          Already have an account?{" "}
          <Link href="/sign-in" className="text-[#0A66C2] hover:underline font-medium">Sign in</Link>
        </p>
      </nav>

      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-16">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-foreground">Create your account</h1>
          <p className="text-slate-500 dark:text-muted-foreground mt-1">Free forever. No credit card required.</p>
        </div>
        <SignUp
          appearance={clerkAppearance}
          fallbackRedirectUrl="/dashboard"
          signInUrl="/sign-in"
        />
      </div>
    </div>
  );
}

export default function SignUpPage() {
  if (isDemoMode) return <DemoSignUp />;
  return <ClerkSignUp />;
}
