/**
 * Cloudflare Worker — Nova Diagnostics
 *
 * Serves static assets from the Next.js `out/` directory.
 * Routes /r/* (secure report links with dynamic tokens) to the
 * pre-built shell page at /r/index.html, which handles them client-side.
 * All other paths are served directly from static assets.
 */

interface Env {
  ASSETS: Fetcher;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // /r/[token] — token is dynamic; serve the shell page that handles it client-side
    if (path.startsWith("/r/") && path.length > 3) {
      const shellUrl = new URL("/r/index.html", url);
      return env.ASSETS.fetch(new Request(shellUrl, request));
    }

    // Everything else — serve static file directly
    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
