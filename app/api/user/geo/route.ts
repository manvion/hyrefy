import { NextRequest, NextResponse } from "next/server";
import { getPricing } from "@/lib/utils/pricing";

export async function GET(req: NextRequest) {
  const country =
    req.headers.get("x-vercel-ip-country") ||
    req.headers.get("cf-ipcountry") ||
    "US";

  const pricing = getPricing(country);

  return NextResponse.json({ country, pricing });
}
