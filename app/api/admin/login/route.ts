import { NextRequest, NextResponse } from "next/server";
import { verifyAdminPassword, createSessionCookie } from "@/lib/admin-auth";

export async function POST(request: NextRequest) {
  const { password } = await request.json();

  if (!verifyAdminPassword(password)) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  const response = NextResponse.json({ success: true });
  const cookie = createSessionCookie();
  response.cookies.set(cookie.name, cookie.value, {
    httpOnly: cookie.httpOnly,
    secure: cookie.secure,
    maxAge: cookie.maxAge,
    path: cookie.path,
  });

  return response;
}
