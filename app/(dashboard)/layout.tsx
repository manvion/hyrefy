import { TopNav } from "@/components/dashboard/top-nav";
import { getAuthUserId } from "@/lib/utils/auth";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const userId = (await getAuthUserId()) ?? "demo_user";

  let isPremium = false;
  if (userId !== "demo_user") {
    try {
      const clerkUser = await currentUser();
      const email = clerkUser?.emailAddresses[0]?.emailAddress || "";
      const name = clerkUser
        ? `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || null
        : null;

      const user = await db.user.upsert({
        where: { clerkId: userId },
        update: { email, ...(name ? { name } : {}), imageUrl: clerkUser?.imageUrl || null },
        create: {
          clerkId: userId,
          email,
          name,
          imageUrl: clerkUser?.imageUrl || null,
          subscription: { create: { scansUsed: 0, scansLimit: 3 } },
        },
        include: { subscription: true },
      });

      if ((user as any)?.isBlocked) {
        redirect("/sign-in?blocked=1");
      }
      isPremium = user?.subscription?.status === "PREMIUM";
    } catch { /* DB not configured */ }
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <TopNav userId={userId} isPremium={isPremium} />
      <main className="flex-1 overflow-y-auto">
        <div className="px-4 sm:px-6 lg:px-8 py-6 pb-8 w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
