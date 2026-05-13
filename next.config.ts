import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Bake Clerk URL config into the build so Vercel doesn't need separate env vars
  env: {
    NEXT_PUBLIC_CLERK_SIGN_IN_URL: "/sign-in",
    NEXT_PUBLIC_CLERK_SIGN_UP_URL: "/sign-up",
    NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: "/dashboard",
    NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL: "/dashboard",
    NEXT_PUBLIC_CLERK_AFTER_SIGN_OUT_URL: "/sign-in",
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.clerk.com" },
      { protocol: "https", hostname: "**.clerk.dev" },
      { protocol: "https", hostname: "img.clerk.com" },
    ],
  },
  experimental: {
    serverActions: {
      allowedOrigins: [
        "localhost:3000",
        "hyrefy.com",
        "www.hyrefy.com",
        "app.hyrefy.com",
        "www.app.hyrefy.com",
        "recruiter.hyrefy.com",
        "www.recruiter.hyrefy.com",
      ],
    },
  },
};

export default nextConfig;
