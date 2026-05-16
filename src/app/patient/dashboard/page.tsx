"use client";

/**
 * /patient/dashboard — Authenticated patient report dashboard.
 *
 * Security:
 * - Requires Supabase auth session; redirects to /patient/login if absent.
 * - Reports are fetched by patient_email = auth.email() (RLS-enforced server-side).
 * - Reports matched only by verified email — NOT by unverified mobile number.
 * - Downloads use the fallback-report-lookup Edge Function (signed URL, 8-min TTL).
 * - Service role key is never used in frontend code.
 *
 * Download UX note:
 * Mobile Safari/Chrome block any programmatic navigation (window.open, anchor.click)
 * that happens after an async/await gap. The solution: fetch the signed URL in the
 * background, store it in state, then render a real <a href> that the user taps
 * directly. A real tap is always a genuine user gesture and is never blocked.
 */

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { patientSupabase as supabase } from "@/lib/supabase/patientClient";
import type { Report } from "@/lib/supabase/types";

// Narrow type — only the columns we SELECT (avoids exposing token/file_path to the bundle)
type PatientReport = Pick<
  Report,
  "id" | "report_number" | "patient_name" | "patient_mobile" | "test_name" | "report_date" | "status" | "download_count" | "created_at"
>;

import {
  CalendarCheck,
  Download,
  ExternalLink,
  FileSearch,
  FileText,
  LogOut,
  MessageCircle,
  Phone,
} from "lucide-react";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Signed URLs have an 8-minute TTL — expire UI state at 7 min to be safe.
const SIGNED_URL_TTL_MS = 7 * 60 * 1000;

const STATUS_CHIP: Record<string, string> = {
  ready: "bg-emerald-100 text-emerald-700",
  draft: "bg-amber-100 text-amber-700",
  revoked: "bg-rose-100 text-rose-700",
  archived: "bg-slate-100 text-slate-600",
};

const STATUS_DOT: Record<string, string> = {
  ready: "bg-emerald-500",
  draft: "bg-amber-400",
  revoked: "bg-rose-400",
  archived: "bg-slate-300",
};

type DlState =
  | { phase: "idle" }
  | { phase: "loading" }
  | { phase: "ready"; url: string }
  | { phase: "error"; msg: string };

export default function PatientDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ email: string; name: string } | null>(null);
  const [reports, setReports] = useState<PatientReport[]>([]);
  const [loading, setLoading] = useState(true);
  // Per-report download state keyed by report.id
  const [dlStates, setDlStates] = useState<Record<string, DlState>>({});
  const expiryTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        router.replace("/patient/login");
        return;
      }

      const email = session.user.email ?? "";
      const name =
        session.user.user_metadata?.full_name ??
        email.split("@")[0];
      setUser({ email, name });

      const { data } = await supabase
        .from("reports")
        .select("id, report_number, patient_name, patient_mobile, test_name, report_date, status, download_count, created_at")
        .eq("patient_email", email)
        .eq("status", "ready")
        .order("report_date", { ascending: false });

      setReports(data ?? []);
      setLoading(false);
    });

    // Clear all expiry timers on unmount
    const timers = expiryTimers.current;
    return () => { Object.values(timers).forEach(clearTimeout); };
  }, [router]);

  const setDl = (id: string, state: DlState) =>
    setDlStates((prev) => ({ ...prev, [id]: state }));

  const handleGetLink = async (report: PatientReport) => {
    const current = dlStates[report.id];
    // If a URL is already ready, nothing to do — the user just needs to tap the link.
    if (current?.phase === "loading" || current?.phase === "ready") return;

    setDl(report.id, { phase: "loading" });
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(
        `${SUPABASE_URL}/functions/v1/fallback-report-lookup`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({
            reportNumber: report.report_number,
            mobile: report.patient_mobile,
          }),
        }
      );
      const json = await res.json();

      if (json.signedUrl) {
        setDl(report.id, { phase: "ready", url: json.signedUrl });

        // Auto-expire the link state when the signed URL becomes invalid
        clearTimeout(expiryTimers.current[report.id]);
        expiryTimers.current[report.id] = setTimeout(() => {
          setDl(report.id, { phase: "idle" });
        }, SIGNED_URL_TTL_MS);
      } else {
        setDl(report.id, { phase: "error", msg: "Could not prepare download. Please try again." });
        setTimeout(() => setDl(report.id, { phase: "idle" }), 5000);
      }
    } catch {
      setDl(report.id, { phase: "error", msg: "Something went wrong. Please try again." });
      setTimeout(() => setDl(report.id, { phase: "idle" }), 5000);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace("/patient/login");
  };

  // Derive initials from display name for avatar
  const initials = user?.name
    ? user.name.split(" ").map((p) => p[0]?.toUpperCase() ?? "").slice(0, 2).join("")
    : "?";

  /* ── Skeleton loading state ─────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="mx-auto max-w-2xl space-y-4 px-4 py-8">
        {/* Profile skeleton */}
        <div className="card-premium p-5">
          <div className="flex animate-pulse items-center gap-4">
            <div className="size-12 shrink-0 rounded-full bg-slate-100" />
            <div className="space-y-2.5">
              <div className="h-4 w-36 rounded-md bg-slate-100" />
              <div className="h-3 w-52 rounded-md bg-slate-100" />
            </div>
          </div>
        </div>
        {/* Report card skeletons */}
        <div className="card-premium divide-y divide-slate-50 overflow-hidden">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse px-5 py-5">
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-2.5">
                  <div className="h-4 w-44 rounded-md bg-slate-100" />
                  <div className="h-3 w-60 rounded-md bg-slate-100" />
                </div>
                <div className="h-9 w-24 shrink-0 rounded-lg bg-slate-100" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ── Main dashboard ─────────────────────────────────────────────────── */
  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-8">

      {/* ── Profile card ──────────────────────────────────────────────── */}
      <div className="card-premium overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-teal-400 to-teal-600" />
        <div className="flex items-center justify-between gap-4 p-5">
          <div className="flex items-center gap-4">
            {/* Initials avatar */}
            <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#061A33] text-sm font-bold text-white">
              {initials}
            </div>
            <div>
              <p className="font-semibold text-slate-950">{user?.name}</p>
              <p className="mt-0.5 text-xs text-slate-500">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-800"
          >
            <LogOut className="size-3.5" aria-hidden="true" />
            Sign out
          </button>
        </div>
      </div>

      {/* ── Reports section ───────────────────────────────────────────── */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-950">Your Reports</h2>
          {reports.length > 0 && (
            <span className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-700 ring-1 ring-teal-100">
              {reports.length} {reports.length === 1 ? "report" : "reports"}
            </span>
          )}
        </div>

        {reports.length === 0 ? (
          /* ── Empty state ──────────────────────────────────────────── */
          <div className="card-premium px-6 py-10 text-center">
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-slate-100">
              <FileText className="size-8 text-slate-300" />
            </div>
            <p className="text-base font-semibold text-slate-800">No reports found</p>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
              No ready reports are linked to this account. If you received a report
              link on WhatsApp, use that link directly.
            </p>
            <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link href="/reports" className="btn-secondary text-sm">
                <FileSearch className="size-4" />
                Download with Report Number
              </Link>
              <a href="https://wa.me/918433706778" className="btn-primary text-sm">
                <MessageCircle className="size-4" />
                WhatsApp Nova Diagnostics
              </a>
            </div>
          </div>
        ) : (
          /* ── Report list ──────────────────────────────────────────── */
          <div className="card-premium divide-y divide-slate-100 overflow-hidden">
            {reports.map((r) => {
              let formattedDate = r.report_date;
              try {
                formattedDate = new Date(r.report_date).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                });
              } catch { /* keep raw */ }

              const dl = dlStates[r.id] ?? { phase: "idle" };

              return (
                <div key={r.id} className="px-5 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 flex-1 items-start gap-3 pt-0.5">
                      {/* Status dot */}
                      <span
                        className={`mt-1.5 size-2 shrink-0 rounded-full ${STATUS_DOT[r.status] ?? STATUS_DOT.archived}`}
                        aria-hidden="true"
                      />
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold text-slate-950">{r.test_name}</p>
                          <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${STATUS_CHIP[r.status] ?? STATUS_CHIP.archived}`}>
                            {r.status}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-400">
                          {r.patient_name} · {r.report_number} · {formattedDate}
                        </p>
                      </div>
                    </div>

                    {/* Download control — changes based on DlState phase */}
                    {dl.phase === "ready" ? (
                      // Real anchor — user taps it directly (never blocked on mobile)
                      <a
                        href={dl.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary shrink-0 text-sm"
                      >
                        <ExternalLink className="size-4" />
                        Open PDF
                      </a>
                    ) : dl.phase === "loading" ? (
                      <button disabled className="btn-primary shrink-0 text-sm opacity-70">
                        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                        Preparing…
                      </button>
                    ) : (
                      <button
                        onClick={() => handleGetLink(r)}
                        className="btn-primary shrink-0 text-sm"
                      >
                        <Download className="size-4" />
                        Download
                      </button>
                    )}
                  </div>

                  {/* Inline error message */}
                  {dl.phase === "error" && (
                    <p className="mt-2 text-xs font-medium text-rose-600">{dl.msg}</p>
                  )}

                  {/* Tap prompt shown when link is ready */}
                  {dl.phase === "ready" && (
                    <p className="mt-1.5 text-xs text-teal-600">
                      Your report is ready — tap <strong>Open PDF</strong> to view it.
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Quick actions ─────────────────────────────────────────────── */}
      <div>
        <h2 className="mb-4 text-base font-semibold text-slate-950">Need help?</h2>
        <div className="grid gap-3 sm:grid-cols-2">

          <Link
            href="/reports"
            className="card-premium flex items-center gap-4 p-4 transition hover:shadow-md"
          >
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-slate-100">
              <FileSearch className="size-5 text-slate-500" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-800">Download by Report Number</p>
              <p className="mt-0.5 text-xs text-slate-400">Access reports without signing in</p>
            </div>
          </Link>

          <Link
            href="/contact"
            className="card-premium flex items-center gap-4 p-4 transition hover:shadow-md"
          >
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-slate-100">
              <CalendarCheck className="size-5 text-slate-500" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-800">Book a Test</p>
              <p className="mt-0.5 text-xs text-slate-400">Schedule a new diagnostic test</p>
            </div>
          </Link>

          <a
            href="tel:+918433706778"
            className="card-premium flex items-center gap-4 p-4 transition hover:shadow-md"
          >
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-slate-100">
              <Phone className="size-5 text-slate-500" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-800">Call Nova Diagnostics</p>
              <p className="mt-0.5 text-xs text-slate-400">+91 8433706778</p>
            </div>
          </a>

          {/* WhatsApp — primary dark card */}
          <a
            href="https://wa.me/918433706778"
            className="flex items-center gap-4 rounded-xl border border-[#0b3b75] bg-[#061A33] p-4 shadow-sm transition hover:bg-[#0b3b75]"
          >
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-white/10">
              <MessageCircle className="size-5 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white">WhatsApp</p>
              <p className="mt-0.5 text-xs text-white/60">Message the lab directly</p>
            </div>
          </a>

        </div>
      </div>

    </div>
  );
}
