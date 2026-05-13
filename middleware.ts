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
  "/blog(.*)",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/stripe/webhook",
  "/api/user/geo",
]);

// Dashboard pages that get a userId segment appended to the URL
const DASHBOARD_PATHS = new Set([
  "/dashboard",
  "/generate",
  "/billing",
  "/history",
  "/settings",
  "/analyze",
  "/rewrite",
  "/interview-prep",
  "/roast",
  "/tracker",
  "/resume/upload",
]);

function isUserId(segment: string): boolean {
  return segment.startsWith("user_") || segment === "demo_user";
}

// Clerk middleware: runs only when hasValidKey — handles auth + user-specific redirect
const clerkHandler = clerkMiddleware(async (auth, request) => {
  const { userId } = await auth();
  const url = request.nextUrl;

  if (userId && DASHBOARD_PATHS.has(url.pathname)) {
    // Redirect generic path → user-specific path
    return NextResponse.redirect(
      new URL(`${url.pathname}/${userId}${url.search}`, request.url)
    );
  }

  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const hostname = request.headers.get("host") || "";
  const segments = url.pathname.split("/").filter(Boolean);
  const lastSegment = segments[segments.length - 1] ?? "";

  // ─── User-specific URL rewrite ─────────────────────────────────────────────
  // /dashboard/user_abc123 → serve /dashboard (browser URL stays)
  if (segments.length >= 2 && isUserId(lastSegment)) {
    const basePath = "/" + segments.slice(0, -1).join("/");
    return NextResponse.rewrite(
      new URL(basePath + url.search, request.url)
    );
  }

  // ─── Subdomain routing ─────────────────────────────────────────────────────
  if (hostname.startsWith("recruiter.")) {
    if (url.pathname !== "/recruiter") {
      return NextResponse.rewrite(new URL("/recruiter", request.url));
    }
    return NextResponse.next();
  }

  if (hostname.startsWith("app.")) {
    if (url.pathname === "/") {
      return NextResponse.rewrite(new URL("/job-seekers", request.url));
    }

    if (!hasValidKey) {
      // Demo mode: redirect dashboard paths to demo_user-specific URL
      if (DASHBOARD_PATHS.has(url.pathname)) {
        return NextResponse.redirect(
          new URL(`${url.pathname}/demo_user${url.search}`, request.url)
        );
      }
      return NextResponse.next();
    }

    return clerkHandler(request, {} as never);
  }

  // ─── Default (non-subdomain) ───────────────────────────────────────────────
  if (!hasValidKey) {
    if (DASHBOARD_PATHS.has(url.pathname)) {
      return NextResponse.redirect(
        new URL(`${url.pathname}/demo_user${url.search}`, request.url)
      );
    }
    return NextResponse.next();
  }

  return clerkHandler(request, {} as never);
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
