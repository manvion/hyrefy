import { auth } from "@clerk/nextjs/server";

const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true" ||
  (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "").includes("dummy");

export async function getAuthUserId(): Promise<string | null> {
  if (isDemoMode) return "demo-user";
  try {
    const { userId } = await auth();
    return userId;
  } catch {
    return null;
  }
}
