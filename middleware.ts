import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";
const hasValidKey = clerkKey.length > 30 && !clerkKey.includes("dummy");

const isPublicRoute = createRouteMatcher([
  "/",
  "/job-seekers(.*)",
  "/recruiter(.*)",
  "/pricing(.*)",
  "/privacy(.*)",
  "/terms(.*)",
  "/about(.*)",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/stripe/webhook",
  "/api/geo",
]);

const clerkHandler = clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const hostname = request.headers.get("host") || "";

  // ─── Subdomain routing ───────────────────────────────────────────────────────
  // recruiter.hyrefy.com → /recruiter (no auth needed)
  if (hostname.startsWith("recruiter.")) {
    if (url.pathname !== "/recruiter") {
      return NextResponse.rewrite(new URL("/recruiter", request.url));
    }
    return NextResponse.next();
  }

  // app.hyrefy.com → job seeker app
  // root path shows job seeker landing; all other paths work normally
  if (hostname.startsWith("app.")) {
    if (url.pathname === "/") {
      return NextResponse.rewrite(new URL("/job-seekers", request.url));
    }
    // Apply Clerk auth for app subdomain
    if (!hasValidKey) return NextResponse.next();
    return clerkHandler(request, {} as never);
  }

  // www.hyrefy.com / hyrefy.com → selector page
  // Just pass through — the / route is the selector
  if (!hasValidKey) return NextResponse.next();
  return clerkHandler(request, {} as never);
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
