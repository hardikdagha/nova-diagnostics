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
import { supabase } from "@/lib/supabase/client";
import type { Report } from "@/lib/supabase/types";
import {
  CalendarCheck,
  Download,
  ExternalLink,
  FileSearch,
  FileText,
  LogOut,
  MessageCircle,
  Phone,
  User,
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

type DlState =
  | { phase: "idle" }
  | { phase: "loading" }
  | { phase: "ready"; url: string }
  | { phase: "error"; msg: string };

export default function PatientDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ email: string; name: string } | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
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
        .select("*")
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

  const handleGetLink = async (report: Report) => {
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

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-slate-300 border-t-[#061A33]" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-8">
      {/* Profile header */}
      <div className="card-premium p-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#061A33]/10">
              <User className="size-5 text-[#061A33]" />
            </div>
            <div>
              <p className="font-semibold text-slate-950">{user?.name}</p>
              <p className="text-xs text-slate-500">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800"
          >
            <LogOut className="size-3.5" /> Sign out
          </button>
        </div>
      </div>

      {/* Reports */}
      <div>
        <h2 className="mb-3 text-base font-semibold text-slate-950">Your Reports</h2>

        {reports.length === 0 ? (
          <div className="card-premium p-8 text-center">
            <FileText className="mx-auto mb-3 size-10 text-slate-200" />
            <p className="font-medium text-slate-700">No reports found</p>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              No reports were found for this account. If you received a report link on
              WhatsApp, please use that link directly. You can also use Report Number
              Download or contact Nova Diagnostics.
            </p>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
              <Link href="/reports" className="btn-secondary text-sm">
                <FileSearch className="size-4" /> Download with Report Number
              </Link>
              <a href="https://wa.me/918433706778" className="btn-primary text-sm">
                <MessageCircle className="size-4" /> WhatsApp Nova Diagnostics
              </a>
            </div>
          </div>
        ) : (
          <div className="card-premium divide-y divide-slate-50 overflow-hidden">
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
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="truncate font-medium text-slate-950">{r.test_name}</p>
                        <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_CHIP[r.status] ?? STATUS_CHIP.archived}`}>
                          {r.status}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {r.patient_name} · {r.report_number} · {formattedDate}
                      </p>
                    </div>

                    {/* Download control — changes based on phase */}
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

                  {/* Error message inline */}
                  {dl.phase === "error" && (
                    <p className="mt-2 text-xs text-rose-600">{dl.msg}</p>
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

      {/* Quick links */}
      <div className="grid gap-3 sm:grid-cols-2">
        <Link href="/reports" className="btn-secondary justify-center text-sm">
          <FileSearch className="size-4" /> Download with Report Number
        </Link>
        <Link href="/contact" className="btn-secondary justify-center text-sm">
          <CalendarCheck className="size-4" /> Book a Test
        </Link>
        <a href="tel:+918433706778" className="btn-secondary justify-center text-sm">
          <Phone className="size-4" /> Call Nova Diagnostics
        </a>
        <a href="https://wa.me/918433706778" className="btn-primary justify-center text-sm">
          <MessageCircle className="size-4" /> WhatsApp
        </a>
      </div>
    </div>
  );
}
