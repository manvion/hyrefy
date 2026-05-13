import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardHeader } from "@/components/dashboard/header";
import { MobileNav } from "@/components/dashboard/mobile-nav";
import { getAuthUserId } from "@/lib/utils/auth";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const userId = (await getAuthUserId()) ?? "demo_user";

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <DashboardSidebar userId={userId} />
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 pb-24 lg:pb-8">
            {children}
          </div>
        </main>
      </div>
      <MobileNav userId={userId} />
    </div>
  );
}
