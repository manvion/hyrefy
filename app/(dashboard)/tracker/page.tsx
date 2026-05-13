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
      applications = await dbc.jobApplication.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });
    }
  } catch {
    // DB not configured
  }

  const serialized = JSON.parse(JSON.stringify(applications));

  return (
    <div className="flex flex-col h-full p-6">
      <div className="mb-6 flex-shrink-0">
        <div className="flex items-center gap-3 mb-1">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Kanban className="h-4 w-4 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Job Tracker</h1>
        </div>
        <p className="text-sm text-muted-foreground">Track every application from wishlist to offer.</p>
      </div>
      <div className="flex-1 overflow-hidden">
        <KanbanBoard initialApplications={serialized} />
      </div>
    </div>
  );
}
