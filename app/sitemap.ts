import { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_APP_URL || "https://app.hyrefy.com";

const LOCALES: Record<string, string> = {
  "en":    BASE,
  "en-US": BASE,
  "en-CA": BASE,
  "en-GB": BASE,
  "en-AU": BASE,
  "en-NZ": BASE,
  "en-IN": BASE,
  "fr":    BASE,
  "fr-FR": BASE,
  "fr-BE": BASE,
  "fr-CH": BASE,
  "x-default": BASE,
};

function withAlternates(path: string) {
  return Object.fromEntries(
    Object.entries(LOCALES).map(([locale, base]) => [locale, `${base}${path}`])
  );
}

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    {
      url: BASE,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
      alternates: { languages: withAlternates("/") },
    },
    {
      url: `${BASE}/job-seekers`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.95,
      alternates: { languages: withAlternates("/job-seekers") },
    },
    {
      url: `${BASE}/pricing`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.85,
      alternates: { languages: withAlternates("/pricing") },
    },
    {
      url: `${BASE}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
      alternates: { languages: withAlternates("/about") },
    },
    {
      url: `${BASE}/sign-up`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
      alternates: { languages: withAlternates("/sign-up") },
    },
    {
      url: `${BASE}/sign-in`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
      alternates: { languages: withAlternates("/sign-in") },
    },
    {
      url: `${BASE}/blog`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.75,
      alternates: { languages: withAlternates("/blog") },
    },
    {
      url: `${BASE}/privacy`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${BASE}/terms`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
