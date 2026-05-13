"use client";

/**
 * /r/[token] — Secure patient report page.
 *
 * This page is a static shell served at /r/index.html.
 * The Cloudflare Worker routes all /r/* requests here.
 * The token is extracted from window.location.pathname client-side.
 *
 * Security flow:
 * 1. Extract token from URL path
 * 2. Call verify-report-token Edge Function (POST, no JWT required)
 *    → Edge Function hashes token, looks up by hash, validates status/expiry
 *    → Returns safe metadata (no file path, no raw token)
 * 3. On Download click, call the same function with ?action=download
 *    → Edge Function generates a signed URL (8 min TTL), increments download_count, logs access
 *    → We open the signed URL directly
 */

import { useEffect, useState } from "react";
import { AlertTriangle, Clock, Download, MessageCircle, Phone, XCircle } from "lucide-react";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

type State =
  | { phase: "loading" }
  | { phase: "ready"; data: ReportMeta }
  | { phase: "error"; code: "not_found" | "expired" | "revoked" | "limit_reached" | "server_error" }
  | { phase: "download_error" };

interface ReportMeta {
  reportNumber: string;
  patientName: string;
  testName: string;
  reportDate: string;
}

const ERROR_CONTENT: Record<string, { icon: React.ReactNode; title: string; body: string }> = {
  not_found: {
    icon: <AlertTriangle className="size-8 text-amber-500" />,
    title: "Report not found",
    body: "This report link is invalid or does not exist. Please check the link or contact Nova Diagnostics.",
  },
  expired: {
    icon: <Clock className="size-8 text-amber-500" />,
    title: "This link has expired",
    body: "This report link has expired. Please contact Nova Diagnostics to request a new link.",
  },
  revoked: {
    icon: <XCircle className="size-8 text-rose-500" />,
    title: "Link no longer active",
    body: "This report link has been deactivated. Please contact Nova Diagnostics for assistance.",
  },
  limit_reached: {
    icon: <XCircle className="size-8 text-rose-500" />,
    title: "Download limit reached",
    body: "This report has reached its maximum number of downloads. Please contact Nova Diagnostics.",
  },
  server_error: {
    icon: <AlertTriangle className="size-8 text-slate-400" />,
    title: "Something went wrong",
    body: "We could not load this report right now. Please try again or contact Nova Diagnostics.",
  },
};

export default function ReportPage() {
  const [state, setState] = useState<State>({ phase: "loading" });
  const [token, setToken] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    // Extract token from /r/<token> path
    const path = window.location.pathname; // e.g. /r/abc123xyz
    const parts = path.split("/").filter(Boolean);
    const t = parts[1] ?? null; // parts[0] = "r", parts[1] = token
    setToken(t);

    if (!t) {
      setState({ phase: "error", code: "not_found" });
      return;
    }

    // Verify token via Edge Function
    fetch(`${SUPABASE_URL}/functions/v1/verify-report-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ token: t }),
    })
      .then((r) => r.json())
      .then((json) => {
        if (json.error) {
          const code = json.error as State extends { phase: "error"; code: infer C } ? C : never;
          setState({ phase: "error", code });
        } else {
          setState({ phase: "ready", data: json as ReportMeta });
        }
      })
      .catch(() => setState({ phase: "error", code: "server_error" }));
  }, []);

  const handleDownload = async () => {
    if (!token) return;
    setIsDownloading(true);

    try {
      const res = await fetch(
        `${SUPABASE_URL}/functions/v1/verify-report-token?action=download`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({ token }),
        }
      );
      const json = await res.json();
      if (json.signedUrl) {
        window.open(json.signedUrl, "_blank");
        // Re-verify to refresh state after download
        const meta = await fetch(`${SUPABASE_URL}/functions/v1/verify-report-token`, {
          method: "POST",
          headers: { "Content-Type": "application/json", apikey: SUPABASE_ANON_KEY },
          body: JSON.stringify({ token }),
        }).then((r) => r.json());
        if (!meta.error) setState({ phase: "ready", data: meta as ReportMeta });
        else setState({ phase: "error", code: meta.error });
      } else {
        setState({ phase: "download_error" });
      }
    } catch {
      setState({ phase: "download_error" });
    } finally {
      setIsDownloading(false);
    }
  };

  const help = (
    <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
      <a
        href="tel:+918433706778"
        className="btn-secondary flex items-center justify-center gap-2 text-sm"
      >
        <Phone className="size-4" /> Call Nova Diagnostics
      </a>
      <a
        href="https://wa.me/918433706778"
        className="btn-primary flex items-center justify-center gap-2 text-sm"
      >
        <MessageCircle className="size-4" /> WhatsApp
      </a>
    </div>
  );

  if (state.phase === "loading") {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-[#061A33]" />
          <p className="mt-4 text-sm text-slate-500">Loading your report…</p>
        </div>
      </div>
    );
  }

  if (state.phase === "error" || state.phase === "download_error") {
    const code = state.phase === "download_error" ? "server_error" : state.code;
    const content = ERROR_CONTENT[code] ?? ERROR_CONTENT.server_error;
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-slate-100">
            {content.icon}
          </div>
          <h1 className="text-xl font-semibold text-slate-950">{content.title}</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">{content.body}</p>
          {help}
        </div>
      </div>
    );
  }

  if (state.phase !== "ready") return null;
  const { data } = state;
  const formattedDate = (() => {
    try {
      return new Date(data.reportDate).toLocaleDateString("en-IN", {
        day: "numeric", month: "long", year: "numeric",
      });
    } catch {
      return data.reportDate;
    }
  })();

  return (
    <div className="flex min-h-[70vh] items-start justify-center px-4 py-10">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="card-premium overflow-hidden">
          {/* Header band */}
          <div className="bg-[#061A33] px-6 py-5 text-white">
            <p className="text-xs font-semibold uppercase tracking-widest text-cyan-300">
              Nova Diagnostics
            </p>
            <h1 className="mt-1 text-2xl font-semibold">Your report is ready</h1>
          </div>

          {/* Details */}
          <div className="px-6 py-5">
            <dl className="space-y-3">
              {[
                ["Patient", data.patientName],
                ["Test", data.testName],
                ["Report No.", data.reportNumber],
                ["Report Date", formattedDate],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4 text-sm">
                  <dt className="text-slate-400">{label}</dt>
                  <dd className="font-medium text-slate-800 text-right">{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Download */}
          <div className="border-t border-slate-100 px-6 py-5">
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="btn-primary w-full justify-center gap-2 py-3.5 text-base disabled:opacity-60"
            >
              {isDownloading ? (
                <>
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Preparing download…
                </>
              ) : (
                <>
                  <Download className="size-5" />
                  Download Report
                </>
              )}
            </button>

            <p className="mt-3 text-center text-xs text-slate-400">
              PDF opens in a new tab. Do not share this link.
            </p>
          </div>
        </div>

        {/* Help */}
        <div className="mt-5 text-center">
          <p className="text-xs text-slate-500 mb-2">Need help? Contact Nova Diagnostics</p>
          <div className="flex justify-center gap-3">
            <a href="tel:+918433706778" className="btn-secondary text-sm">
              <Phone className="size-4" /> Call
            </a>
            <a href="https://wa.me/918433706778" className="btn-primary text-sm">
              <MessageCircle className="size-4" /> WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
