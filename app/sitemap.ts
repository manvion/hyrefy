import { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_APP_URL || "https://app.hyrefy.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE,                  lastModified: now, changeFrequency: "weekly",  priority: 1.0 },
    { url: `${BASE}/job-seekers`, lastModified: now, changeFrequency: "weekly",  priority: 0.9 },
    { url: `${BASE}/pricing`,     lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/sign-up`,     lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/sign-in`,     lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/privacy`,     lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
    { url: `${BASE}/terms`,       lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
  ];

  return staticRoutes;
}
