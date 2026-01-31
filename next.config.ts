import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.gravatar.com",
      },
      {
        protocol:"https",
        hostname: "images.unsplash.com"
      },
      {
        protocol: "https",
        hostname: "scontent.fthd1-1.fna.fbcdn.net",
      },
    ],
  },
};

export default nextConfig;
