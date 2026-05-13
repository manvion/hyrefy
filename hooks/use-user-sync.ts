"use client";

import { useEffect } from "react";
import { isDemoMode } from "@/lib/utils/demo-mode";

export function useUserSync() {
  useEffect(() => {
    if (!isDemoMode) {
      fetch("/api/user/sync", { method: "POST" }).catch(() => {});
    }
  }, []);
}
