import { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_APP_URL || "https://app.hyrefy.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/job-seekers", "/pricing", "/sign-in", "/sign-up", "/privacy", "/terms"],
        disallow: ["/dashboard", "/generate", "/history", "/billing", "/settings", "/resume/", "/api/", "/admin/"],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
  };
}
