import { auth } from "@clerk/nextjs/server";
import { isDemoMode } from "@/lib/utils/demo-mode";

export async function getAuthUserId(): Promise<string | null> {
  if (isDemoMode) return "demo-user";
  try {
    const { userId } = await auth();
    return userId;
  } catch {
    return null;
  }
}
