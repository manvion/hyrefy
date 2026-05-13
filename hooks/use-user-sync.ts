"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";

export function useUserSync() {
  const { isSignedIn, user } = useUser();

  useEffect(() => {
    if (isSignedIn && user) {
      fetch("/api/user/sync", { method: "POST" }).catch(() => {});
    }
  }, [isSignedIn, user]);
}
