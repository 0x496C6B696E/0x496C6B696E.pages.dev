import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fully static output for Cloudflare Pages: `next build` writes ./out
  output: "export",
  images: { unoptimized: true },
  reactStrictMode: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
