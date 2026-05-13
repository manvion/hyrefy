import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { HyreLogo } from "@/components/shared/hyrefy-logo";

const isDemoMode =
  process.env.NEXT_PUBLIC_DEMO_MODE === "true" ||
  (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "").includes("dummy");

function DemoSignUp() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md px-4">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <HyreLogo size={48} />
          </div>
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="text-muted-foreground mt-1">Start generating tailored resumes for free</p>
        </div>

        <div className="rounded-2xl border border-border/50 bg-card/30 p-8 space-y-4">
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3">
            <p className="text-sm text-amber-400 font-medium">Demo Mode</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Authentication is running in demo mode. Add real Clerk keys to enable full sign-up.
            </p>
          </div>

          <Button asChild variant="gradient" size="lg" className="w-full">
            <Link href="/dashboard">
              Continue to Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            Already have an account?{" "}
            <Link href="/sign-in" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function ClerkSignUp() {
  // Loaded dynamically only when ClerkProvider is present
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { SignUp } = require("@clerk/nextjs");
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md px-4">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="text-muted-foreground mt-1">Start generating tailored resumes for free</p>
        </div>
        <SignUp
          appearance={{
            variables: {
              colorPrimary: "hsl(262.1 83.3% 57.8%)",
              colorBackground: "hsl(224 71.4% 4.1%)",
              colorInputBackground: "hsl(215 27.9% 10%)",
              colorText: "hsl(210 20% 98%)",
              borderRadius: "0.625rem",
            },
          }}
        />
      </div>
    </div>
  );
}

export default function SignUpPage() {
  if (isDemoMode) return <DemoSignUp />;
  return <ClerkSignUp />;
}
