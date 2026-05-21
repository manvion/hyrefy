import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { clerkClient } from "@clerk/nextjs/server";

function isAdmin(request: NextRequest): boolean {
  const cookie = request.cookies.get("hyrefy-admin-session");
  const pw = process.env.ADMIN_PASSWORD || "hyrefy-admin-2024";
  return cookie?.value === Buffer.from(pw).toString("base64");
}

export async function GET(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const filter = searchParams.get("filter") || "all";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = 25;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};

  if (search) {
    where.OR = [
      { email: { contains: search, mode: "insensitive" } },
      { name: { contains: search, mode: "insensitive" } },
    ];
  }

  if (filter === "premium") {
    where.subscription = { status: "PREMIUM" };
  } else if (filter === "free") {
    where.subscription = { is: { status: "FREE" } };
  } else if (filter === "blocked") {
    where.isBlocked = true;
  }

  try {
    const [dbUsers, total] = await Promise.all([
      db.user.findMany({
        where,
        include: {
          subscription: true,
          _count: { select: { resumes: true, resumeScans: true, interviewPreps: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      db.user.count({ where }),
    ]);

    // Enrich with real Clerk data so name/email are always accurate
    const clerk = await clerkClient();
    const clerkIds = dbUsers.map(u => u.clerkId).filter(Boolean);
    let clerkMap: Record<string, { name: string | null; email: string }> = {};

    if (clerkIds.length > 0) {
      try {
        const clerkUsers = await clerk.users.getUserList({ userId: clerkIds, limit: 100 });
        for (const cu of clerkUsers.data) {
          const name = `${cu.firstName || ""} ${cu.lastName || ""}`.trim() || null;
          const email = cu.emailAddresses[0]?.emailAddress || "";
          clerkMap[cu.id] = { name, email };
        }
      } catch (e) {
        console.error("[admin/users] Clerk enrich error:", e);
      }
    }

    const users = dbUsers.map(u => {
      const clerk = clerkMap[u.clerkId];
      return {
        ...u,
        name: clerk?.name || u.name || null,
        email: clerk?.email || u.email || "",
      };
    });

    return NextResponse.json({
      users,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (e) {
    console.error("[admin/users] GET error:", e);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
