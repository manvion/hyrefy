import { NextRequest, NextResponse } from "next/server";

const SUPPORTED = ["US", "CA", "GB", "AU", "NZ", "FR", "BE", "CH", "IN"];

function geoResponse(country: string) {
  const res = NextResponse.json({ country });
  res.headers.set("Cache-Control", "public, max-age=3600, s-maxage=3600");
  return res;
}

export async function GET(request: NextRequest) {
  // 1. Try Vercel/Cloudflare headers (works in production)
  const vercelCountry = request.headers.get("x-vercel-ip-country");
  const cfCountry = request.headers.get("cf-ipcountry");
  const country = vercelCountry || cfCountry;

  if (country && SUPPORTED.includes(country)) {
    return geoResponse(country);
  }

  // 2. Try x-forwarded-for IP → ipapi.co (free tier, no key needed)
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0].trim() || request.headers.get("x-real-ip");

  if (ip && ip !== "127.0.0.1" && ip !== "::1" && !ip.startsWith("192.168") && !ip.startsWith("10.")) {
    try {
      const res = await fetch(`https://ipapi.co/${ip}/country/`, { signal: AbortSignal.timeout(2000) });
      if (res.ok) {
        const detected = (await res.text()).trim();
        if (SUPPORTED.includes(detected)) {
          return geoResponse(detected);
        }
      }
    } catch {
      // Fall through to default
    }
  }

  // 3. Default to Canada (dev/local)
  return geoResponse("CA");
}
