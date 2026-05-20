"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[admin error]", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full text-center space-y-4">
        <div className="h-14 w-14 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center mx-auto">
          <AlertCircle className="h-7 w-7 text-destructive" />
        </div>
        <h1 className="text-xl font-bold text-foreground">Admin page error</h1>
        <p className="text-sm text-muted-foreground">
          {error?.message || "An unexpected error occurred loading the admin dashboard."}
          {error?.digest && <span className="block text-xs mt-1 opacity-60">Digest: {error.digest}</span>}
        </p>
        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={reset}>Try again</Button>
          <Button asChild variant="gradient">
            <Link href="/admin/login">Back to login</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
