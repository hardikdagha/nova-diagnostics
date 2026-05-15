/**
 * Cloudflare Worker — Nova Diagnostics
 *
 * Serves static assets from the Next.js `out/` directory.
 *
 * Report links use the format /r/?t=[token] so Cloudflare serves the
 * pre-built shell at /r/ directly — no path-based routing tricks needed.
 * The shell extracts the token from window.location.search client-side.
 *
 * Security headers applied on every response:
 *   X-Frame-Options          — prevents clickjacking
 *   X-Content-Type-Options   — prevents MIME sniffing
 *   Referrer-Policy          — limits referrer leakage
 *   Permissions-Policy       — disables unused browser features
 *
 * CSP is intentionally omitted for now: the static export includes
 * inline scripts and data URIs (Next.js JSON chunks, Supabase realtime)
 * that would require unsafe-inline/unsafe-eval, negating CSP's value.
 * A hash-based CSP can be added in a future hardening pass once the
 * asset pipeline is audited.
 */

interface Env {
  ASSETS: Fetcher;
}

const SECURITY_HEADERS: Record<string, string> = {
  "X-Frame-Options":           "DENY",
  "X-Content-Type-Options":    "nosniff",
  "Referrer-Policy":           "strict-origin-when-cross-origin",
  "Permissions-Policy":        "camera=(), microphone=(), geolocation=()",
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const response = await env.ASSETS.fetch(request);

    // Clone and attach security headers to every response
    const newHeaders = new Headers(response.headers);
    for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
      newHeaders.set(key, value);
    }

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders,
    });
  },
} satisfies ExportedHandler<Env>;
