import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  // trailingSlash: true makes Next.js emit out/r/index.html (not out/r.html)
  // so Cloudflare Worker can serve it at /r/index.html for the /r/[token] shell route.
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
