/**
 * Cloudflare Worker — Nova Diagnostics
 *
 * Serves static assets from the Next.js `out/` directory.
 *
 * Report links use the format /r/?t=[token] so Cloudflare serves the
 * pre-built shell at /r/ directly — no path-based routing tricks needed.
 * The shell extracts the token from window.location.search client-side.
 */

interface Env {
  ASSETS: Fetcher;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
