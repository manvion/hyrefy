import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/shared/theme-provider";
import { LanguageProvider } from "@/components/shared/language-provider";
import { ClerkAuthProvider } from "@/components/shared/clerk-provider";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Hyrefy",
  applicationCategory: "BusinessApplication",
  description: "AI-powered resume optimizer. Get ATS scores, tailored rewrites & cover letters in English or French.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
    priceSpecification: {
      "@type": "UnitPriceSpecification",
      price: "19",
      priceCurrency: "USD",
      billingDuration: "P1M",
    },
  },
};

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://app.hyrefy.com";

export const metadata: Metadata = {
  title: { default: "Hyrefy — AI Resume Optimizer | Beat ATS & Land More Interviews", template: "%s | Hyrefy" },
  description:
    "Hyrefy uses AI to generate a tailored resume and cover letter for every job in seconds. ATS-optimized for the US, UK, Canada, Australia, France, India and 4 more countries. Free to start.",
  keywords: [
    // English — global
    "AI resume optimizer", "ATS resume checker", "resume builder AI", "cover letter generator",
    "job application helper", "resume rewriter", "ATS score", "beat ATS", "resume tailor",
    // US
    "resume builder USA", "ATS optimized resume", "American resume format",
    // Canada
    "resume builder Canada", "Canadian resume", "CV builder Canada",
    // UK
    "CV optimizer UK", "ATS CV checker UK", "British CV builder", "UK job application",
    // Australia
    "resume builder Australia", "ATS resume Australia", "Australian resume format",
    // New Zealand
    "resume builder New Zealand", "NZ CV builder",
    // India
    "resume builder India", "ATS resume India", "Indian CV format", "job resume India",
    // French
    "optimisation CV", "générateur lettre de motivation", "score ATS", "CV optimisé IA",
    "constructeur CV France", "optimisation CV Belgique", "CV Suisse",
  ],
  authors: [{ name: "Hyrefy" }],
  creator: "Hyrefy",
  publisher: "Hyrefy",
  category: "Technology",
  metadataBase: new URL(APP_URL),
  alternates: {
    canonical: "/",
    languages: {
      "en":    "/",
      "en-US": "/",
      "en-CA": "/",
      "en-GB": "/",
      "en-AU": "/",
      "en-NZ": "/",
      "en-IN": "/",
      "fr":    "/",
      "fr-FR": "/",
      "fr-BE": "/",
      "fr-CH": "/",
      "x-default": "/",
    },
  },
  icons: {
    icon: [
      { url: "/icon", type: "image/png", sizes: "32x32" },
    ],
    apple: [
      { url: "/apple-icon", type: "image/png", sizes: "180x180" },
    ],
    shortcut: "/icon",
  },
  openGraph: {
    title: "Hyrefy — Beat ATS & Land More Interviews with AI",
    description: "AI-powered resume optimizer trusted in 9 countries. Tailored resume + cover letter in seconds — free to start.",
    type: "website",
    url: "/",
    siteName: "Hyrefy",
    locale: "en_US",
    alternateLocale: ["en_CA", "en_GB", "en_AU", "en_NZ", "en_IN", "fr_FR", "fr_BE", "fr_CH"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Hyrefy — AI Resume Optimizer",
    description: "Beat ATS. Land more interviews. AI-powered resume optimization in seconds — free.",
    creator: "@hyrefy",
    site: "@hyrefy",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-video-preview": -1, "max-image-preview": "large", "max-snippet": -1 },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "",
  },
};

const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";
const isValidClerkKey = (clerkKey.startsWith("pk_test_") || clerkKey.startsWith("pk_live_")) && clerkKey.length > 20 && !clerkKey.includes("dummy");

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const inner = (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <LanguageProvider>
            {children}
            <Toaster />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );

  if (isValidClerkKey) {
    return <ClerkAuthProvider>{inner}</ClerkAuthProvider>;
  }
  return inner;
}
