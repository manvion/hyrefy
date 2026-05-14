import { getAuthUserId } from "@/lib/utils/auth";
import { db } from "@/lib/db";
import { KanbanBoard } from "@/components/tracker/kanban-board";
import { Kanban } from "lucide-react";

export const metadata = { title: "Job Tracker | Hyrefy" };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const dbc = db as any;

export default async function TrackerPage() {
  const userId = await getAuthUserId();

  let applications: object[] = [];
  try {
    if (userId) {
      const user = await db.user.findUnique({ where: { clerkId: userId } });
      if (user) {
        applications = await dbc.jobApplication.findMany({
          where: { userId: user.id },
          orderBy: { createdAt: "desc" },
        });
      }
    }
  } catch {
    // DB not configured
  }

  const serialized = JSON.parse(JSON.stringify(applications));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Job Tracker</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Track every application from wishlist to offer.</p>
      </div>
      <KanbanBoard initialApplications={serialized} />
    </div>
  );
}
