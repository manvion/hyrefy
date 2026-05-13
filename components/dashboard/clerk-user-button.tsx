"use client";

import { useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut, Settings } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export function ClerkUserButton({ collapsed }: { collapsed?: boolean }) {
  const { signOut, user } = useClerk();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
    } finally {
      router.push("/sign-in");
      router.refresh();
    }
  };

  const avatarUrl = user?.imageUrl;
  const initials = user?.firstName?.[0] ?? user?.emailAddresses?.[0]?.emailAddress?.[0]?.toUpperCase() ?? "?";

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((p) => !p)}
        className="h-8 w-8 rounded-full overflow-hidden border border-border/50 hover:ring-2 hover:ring-primary/30 transition-all shrink-0"
      >
        {avatarUrl ? (
          <Image src={avatarUrl} alt="avatar" width={32} height={32} className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full bg-primary/20 flex items-center justify-center text-xs font-medium text-primary">
            {initials}
          </div>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute bottom-10 left-0 z-50 w-52 rounded-xl border border-border/50 bg-popover shadow-xl py-1 text-sm">
            <div className="px-3 py-2.5 border-b border-border/30">
              <p className="font-medium truncate">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.emailAddresses?.[0]?.emailAddress}</p>
            </div>
            <Link
              href="/settings"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 hover:bg-accent transition-colors"
            >
              <Settings className="h-3.5 w-3.5 text-muted-foreground" />
              Manage account
            </Link>
            <button
              onClick={handleSignOut}
              disabled={signingOut}
              className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-destructive/10 text-destructive transition-colors disabled:opacity-60"
            >
              <LogOut className="h-3.5 w-3.5" />
              {signingOut ? "Signing out…" : "Sign out"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
