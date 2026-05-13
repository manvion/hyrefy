"use client";

import { UserProfile } from "@clerk/nextjs";

export function ClerkUserProfileClient() {
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
