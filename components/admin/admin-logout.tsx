"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function AdminLogout() {
  const router = useRouter();

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  };

  return (
    <Button variant="ghost" size="sm" onClick={logout} className="text-muted-foreground">
      <LogOut className="h-4 w-4 mr-1.5" />
      Logout
    </Button>
  );
}
