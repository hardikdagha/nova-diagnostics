/**
 * Cloudflare Worker — Nova Diagnostics
 *
 * Serves static assets from the Next.js `out/` directory.
 * Routes /r/[token] (secure report links) to the pre-built shell page
 * which handles the token client-side.
 *
 * Key insight on Cloudflare Static Assets path normalisation:
 *   out/r/index.html  →  served at  /r/   (trailingSlash: true build)
 *   out/r.html        →  served at  /r    (no-trailingSlash build)
 *
 * Requesting /r/index.html or /r.html explicitly returns 404 in both cases
 * because Cloudflare normalises those paths away. The correct paths to try
 * are /r/ (index.html build) and /r (flat-html build).
 */

interface Env {
  ASSETS: Fetcher;
}

async function fetchShell(env: Env, base: URL, path: string): Promise<Response | null> {
  try {
    const res = await env.ASSETS.fetch(new Request(new URL(path, base).toString()));
    if (res.ok) return res;
    // Follow a single redirect (Cloudflare may 301 /r → /r/)
    if ((res.status === 301 || res.status === 302) && res.headers.has("Location")) {
      const loc = res.headers.get("Location")!;
      const redirectUrl = loc.startsWith("http") ? loc : new URL(loc, base).toString();
      try {
        const redirectRes = await env.ASSETS.fetch(new Request(redirectUrl));
        if (redirectRes.ok) return redirectRes;
      } catch { /* ignore */ }
    }
    return null;
  } catch {
    return null;
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // /r/[token] — serve the pre-built shell page at the token URL so that
    // window.location.pathname still contains the token for client-side extraction.
    if (path.startsWith("/r/") && path.length > 3) {
      // Try /r/ first (trailingSlash: true → out/r/index.html served at /r/)
      // then /r (no-trailingSlash  → out/r.html        served at /r)
      for (const shellPath of ["/r/", "/r"]) {
        const res = await fetchShell(env, url, shellPath);
        if (res) return res;
      }
      return new Response(
        "Report page temporarily unavailable. Please try again or contact Nova Diagnostics.",
        { status: 503, headers: { "Content-Type": "text/plain" } }
      );
    }

    // Everything else — serve static files directly
    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
