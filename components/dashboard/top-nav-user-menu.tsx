"use client";

import { useState } from "react";
import { useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { CreditCard, Settings, LogOut, Crown } from "lucide-react";
import { isDemoMode } from "@/lib/utils/demo-mode";
import { cn } from "@/lib/utils/cn";

interface Props {
  userId: string;
  isPremium?: boolean;
}

function DemoUserMenu({ userId }: { userId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((p) => !p)}
        className="h-8 w-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-xs font-semibold text-primary hover:ring-2 hover:ring-primary/30 transition-all"
      >
        D
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-10 z-50 w-52 rounded-xl border border-border/50 bg-popover shadow-xl py-1 text-sm">
            <div className="px-3 py-2.5 border-b border-border/30">
              <p className="font-medium">Demo User</p>
              <p className="text-xs text-muted-foreground">demo@hyrefy.com</p>
            </div>
            <Link href={`/settings/${userId}`} onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 hover:bg-accent transition-colors">
              <Settings className="h-3.5 w-3.5 text-muted-foreground" />Settings
            </Link>
            <button
              onClick={() => router.push("/sign-in")}
              className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-destructive/10 text-destructive transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />Sign out
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export function TopNavUserMenu({ userId, isPremium }: Props) {
  const { signOut, user } = useClerk();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  if (isDemoMode) return <DemoUserMenu userId={userId} />;

  const handleSignOut = async () => {
    setSigningOut(true);
    try { await signOut(); } finally {
      router.push("/sign-in");
      router.refresh();
    }
  };

  const avatarUrl = user?.imageUrl;
  const initials =
    user?.firstName?.[0] ??
    user?.emailAddresses?.[0]?.emailAddress?.[0]?.toUpperCase() ??
    "?";
  const displayName = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Account";
  const email = user?.emailAddresses?.[0]?.emailAddress ?? "";

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((p) => !p)}
        className="h-8 w-8 rounded-full overflow-hidden border border-border/50 hover:ring-2 hover:ring-primary/30 transition-all shrink-0"
      >
        {avatarUrl ? (
          <Image src={avatarUrl} alt="avatar" width={32} height={32} className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full bg-primary/20 flex items-center justify-center text-xs font-semibold text-primary">
            {initials}
          </div>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-10 z-50 w-56 rounded-xl border border-border/50 bg-popover shadow-xl py-1 text-sm">
            <div className="px-3 py-2.5 border-b border-border/30">
              <p className="font-semibold truncate">{displayName}</p>
              <p className="text-xs text-muted-foreground truncate">{email}</p>
              {isPremium && (
                <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-medium text-amber-500 bg-amber-500/10 border border-amber-500/20 rounded-full px-2 py-0.5">
                  <Crown className="h-2.5 w-2.5" />Premium
                </span>
              )}
            </div>
            <Link href={`/billing/${userId}`} onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 hover:bg-accent transition-colors text-foreground">
              <CreditCard className="h-3.5 w-3.5 text-muted-foreground" />Billing
            </Link>
            <Link href={`/settings/${userId}`} onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 hover:bg-accent transition-colors text-foreground">
              <Settings className="h-3.5 w-3.5 text-muted-foreground" />Settings
            </Link>
            <div className="border-t border-border/30 mt-1 pt-1">
              <button
                onClick={handleSignOut}
                disabled={signingOut}
                className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-destructive/10 text-destructive transition-colors disabled:opacity-60"
              >
                <LogOut className="h-3.5 w-3.5" />
                {signingOut ? "Signing out…" : "Sign out"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
