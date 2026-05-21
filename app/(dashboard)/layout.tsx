import { TopNav } from "@/components/dashboard/top-nav";
import { getAuthUserId } from "@/lib/utils/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const userId = (await getAuthUserId()) ?? "demo_user";

  let isPremium = false;
  if (userId !== "demo_user") {
    try {
      const user = await db.user.findUnique({
        where: { clerkId: userId },
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
