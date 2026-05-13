import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
