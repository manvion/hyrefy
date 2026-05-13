import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/shared/theme-provider";
import { LanguageProvider } from "@/components/shared/language-provider";
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

export const metadata: Metadata = {
  title: { default: "Hyrefy — AI Resume Optimizer | Beat ATS & Land More Interviews", template: "%s | Hyrefy" },
  description:
    "Hyrefy uses AI to generate a perfectly tailored resume and cover letter for every job. ATS-optimized, in English or French, for 9 countries — in seconds. Free to start.",
  keywords: [
    "resume optimizer", "ATS score", "AI resume", "job application", "resume rewriter",
    "cover letter generator", "ATS compatibility", "resume builder", "job search",
    "optimisation CV", "lettre de motivation", "score ATS", "CV optimisé",
  ],
  authors: [{ name: "Hyrefy" }],
  creator: "Hyrefy",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://app.hyrefy.com"),
  alternates: {
    canonical: "/",
    languages: { "en": "/en", "fr": "/fr" },
  },
  openGraph: {
    title: "Hyrefy — Beat ATS & Land More Interviews with AI",
    description: "AI-powered resume optimizer. Get ATS scores, tailored rewrites & cover letters in English or French — in seconds. Free to start.",
    type: "website",
    url: "/",
    siteName: "Hyrefy",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hyrefy — AI Resume Optimizer",
    description: "Beat ATS. Land more interviews. AI-powered resume optimization in seconds.",
    creator: "@hyrefy",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-video-preview": -1, "max-image-preview": "large", "max-snippet": -1 },
  },
};

const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";
const isValidClerkKey = (clerkKey.startsWith("pk_test_") || clerkKey.startsWith("pk_live_")) && clerkKey.length > 20 && !clerkKey.includes("dummy");

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const content = (
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

  return isValidClerkKey ? <ClerkProvider>{content}</ClerkProvider> : content;
}
