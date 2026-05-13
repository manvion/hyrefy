"use client";

import { useUser } from "@clerk/nextjs";

export function ClerkGreeting() {
  const { user } = useUser();
  return <>{user?.firstName || "there"}</>;
}
