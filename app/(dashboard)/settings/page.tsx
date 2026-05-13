import { Metadata } from "next";
import { isDemoMode } from "@/lib/utils/demo-mode";
import { ClerkUserProfileClient } from "@/components/settings/clerk-user-profile";

export const metadata: Metadata = { title: "Settings" };

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
        <ClerkUserProfileClient />
      )}
    </div>
  );
}
