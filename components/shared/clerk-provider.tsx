"use client";

import { ClerkProvider } from "@clerk/nextjs";
import type { ReactNode } from "react";

export function ClerkAuthProvider({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider afterSignOutUrl="/sign-in" signInUrl="/sign-in" signUpUrl="/sign-up">
      {children}
    </ClerkProvider>
  );
}
