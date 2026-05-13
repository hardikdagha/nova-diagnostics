/**
 * Cloudflare Worker — Nova Diagnostics
 *
 * Serves static assets from the Next.js `out/` directory.
 * Routes /r/* (secure report links with dynamic tokens) to the
 * pre-built shell page, which handles them client-side.
 * All other paths are served directly from static assets.
 *
 * Shell file location:
 *   - out/r/index.html  (when next.config.ts has trailingSlash: true)
 *   - out/r.html        (fallback, without trailingSlash)
 * We try both so the worker is robust to build config changes.
 */

interface Env {
  ASSETS: Fetcher;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // /r/[token] — token is dynamic; serve the pre-built shell page.
    // The shell reads window.location.pathname client-side to extract the token.
    if (path.startsWith("/r/") && path.length > 3) {
      // Try explicit file paths — avoids relying on directory index resolution.
      for (const shellPath of ["/r/index.html", "/r.html"]) {
        try {
          const shellReq = new Request(new URL(shellPath, url).toString());
          const res = await env.ASSETS.fetch(shellReq);
          // Return the file if found (not a 404)
          if (res.status !== 404) return res;
        } catch {
          // Asset not found at this path — try next candidate
        }
      }
      // Neither shell file found — build artifact issue
      return new Response(
        "Report page temporarily unavailable. Please try again or contact Nova Diagnostics.",
        { status: 503, headers: { "Content-Type": "text/plain" } }
      );
    }

    // Everything else — serve static file directly
    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
