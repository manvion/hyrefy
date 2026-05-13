import { Metadata } from "next";

export const metadata: Metadata = { title: "Settings" };

import { isDemoMode } from "@/lib/utils/demo-mode";

function ClerkUserProfile() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { UserProfile } = require("@clerk/nextjs");
  return (
    <UserProfile
      appearance={{
        variables: {
          colorPrimary: "hsl(262.1 83.3% 57.8%)",
          colorBackground: "hsl(224 71.4% 4.1%)",
          colorText: "hsl(210 20% 98%)",
          borderRadius: "0.625rem",
        },
      }}
    />
  );
}

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account settings</p>
      </div>
      {isDemoMode ? (
        <div className="rounded-xl border border-border/50 bg-card/30 p-8 text-center">
          <p className="text-muted-foreground text-sm">
            Account settings require valid Clerk credentials.
          </p>
        </div>
      ) : (
        <ClerkUserProfile />
      )}
    </div>
  );
}
