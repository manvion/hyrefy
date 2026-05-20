import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "hyrefy-admin-2024";
const SESSION_COOKIE = "hyrefy-admin-session";
const SESSION_VALUE = Buffer.from(ADMIN_PASSWORD).toString("base64");

export function verifyAdminPassword(password: string): boolean {
  return password === ADMIN_PASSWORD;
}

export async function getAdminSession(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE);
  return session?.value === SESSION_VALUE;
}

export async function requireAdmin() {
  const isAdmin = await getAdminSession();
  if (!isAdmin) redirect("/admin/login");
}

export function createSessionCookie() {
  return { name: SESSION_COOKIE, value: SESSION_VALUE, httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" as const, maxAge: 60 * 60 * 8, path: "/" };
}
