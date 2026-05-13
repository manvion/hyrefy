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
    colorInputText: "#0f172a",
    colorText: "#0f172a",
    colorTextSecondary: "#64748b",
    colorNeutral: "#64748b",
    colorSuccess: "#10b981",
    colorDanger: "#ef4444",
    borderRadius: "0.75rem",
    fontFamily: "inherit",
    fontSize: "14px",
  },
  elements: {
    card: "shadow-xl border border-slate-200",
    headerTitle: "text-slate-900 font-bold",
    headerSubtitle: "text-slate-500",
    socialButtonsBlockButton: "border border-slate-200 hover:bg-slate-50 text-slate-700",
    formFieldInput: "border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 text-slate-900 bg-white",
    formFieldLabel: "text-slate-700 font-medium",
    formButtonPrimary: "bg-[#0A66C2] hover:bg-[#004182] text-white font-semibold",
    footerActionLink: "text-[#0A66C2] hover:text-[#004182] font-medium",
    identityPreviewEditButton: "text-[#0A66C2]",
    dividerLine: "bg-slate-200",
    dividerText: "text-slate-400",
  },
};

function DemoSignIn() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F3F2EF] dark:bg-background px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <HyreLogo size={40} />
            <span className="text-xl font-bold text-slate-900 dark:text-foreground">Hyrefy</span>
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-foreground">Welcome back</h1>
          <p className="text-slate-500 dark:text-muted-foreground mt-1">Sign in to your Hyrefy account</p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-border/50 bg-white dark:bg-card/30 p-8 shadow-xl space-y-4">
          <div className="rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-500/30 dark:bg-amber-500/10 px-4 py-3">
            <p className="text-sm text-amber-700 dark:text-amber-400 font-medium">Demo Mode</p>
            <p className="text-xs text-amber-600/70 dark:text-muted-foreground mt-0.5">
              Add real Clerk keys in Vercel to enable full sign-in.
            </p>
          </div>

          <Button asChild variant="gradient" size="lg" className="w-full">
            <Link href="/dashboard">
              Continue to Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>

          <p className="text-center text-xs text-slate-500 dark:text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/sign-up" className="text-[#0A66C2] hover:underline font-medium">
              Sign up free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function ClerkSignIn() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { SignIn } = require("@clerk/nextjs");
  return (
    <div className="min-h-screen bg-[#F3F2EF] dark:bg-background flex flex-col">
      {/* Top nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto w-full">
        <Link href="/" className="flex items-center gap-2.5 group">
          <HyreLogo size={36} />
          <span className="text-lg font-bold text-slate-900 dark:text-foreground group-hover:text-[#0A66C2] transition-colors">
            Hyrefy
          </span>
        </Link>
        <p className="text-sm text-slate-500 dark:text-muted-foreground">
          New to Hyrefy?{" "}
          <Link href="/sign-up" className="text-[#0A66C2] hover:underline font-medium">
            Create account
          </Link>
        </p>
      </nav>

      {/* Centered Clerk widget */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-16">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-foreground">Welcome back</h1>
          <p className="text-slate-500 dark:text-muted-foreground mt-1">
            Sign in to continue optimizing your resume
          </p>
        </div>
        <SignIn appearance={clerkAppearance} />
      </div>
    </div>
  );
}

export default function SignInPage() {
  if (isDemoMode) return <DemoSignIn />;
  return <ClerkSignIn />;
}
