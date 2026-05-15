import type { NextConfig } from "next";

// NEXT_PUBLIC_* variables are baked into the JS bundle at build time.
// .env.local is gitignored, so CI/CD pipelines and fresh machines won't
// have it. These are the public (anon-role) Supabase credentials — safe
// to commit: equivalent to a "publishable key" and already embedded in
// every deployed bundle. Secret keys (service_role, Resend) are NEVER here.
const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
  "https://ciljgpxxlbowiicopmdk.supabase.co";

const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNpbGpncHh4bGJvd2lpY29wbWRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2MTA4MDQsImV4cCI6MjA5NDE4NjgwNH0.fZBn8G7ohVduUPjGx8Q-W202mfnAopI4HZE95I3smyk";

const nextConfig: NextConfig = {
  output: "export",
  // trailingSlash: true makes Next.js emit out/r/index.html (not out/r.html)
  // so Cloudflare Worker can serve it at /r/index.html for the /r/[token] shell route.
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_SUPABASE_URL: SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: SUPABASE_ANON_KEY,
  },
};

export default nextConfig;
