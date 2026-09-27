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
import { siteConfig } from "@/config/site";
import type { Report } from "@/lib/supabase/types";

// Narrow type — only the columns we SELECT (avoids exposing token/file_path to the bundle)
type PatientReport = Pick<
  Report,
  "id" | "report_number" | "patient_name" | "patient_mobile" | "test_name" | "report_date" | "status" | "download_count" | "created_at"
>;

import {
  ArrowRight,
  CalendarCheck,
  CalendarDays,
  Download,
  ExternalLink,
  FileSearch,
  FileText,
  LogOut,
  MessageCircle,
  Phone,
  Search,
  ShieldCheck,
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
  const [reportQuery, setReportQuery] = useState("");
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
  const normalizedReportQuery = reportQuery.trim().toLocaleLowerCase("en-IN");
  const filteredReports = reports.filter((report) =>
    [report.test_name, report.patient_name, report.report_number]
      .some((value) => value.toLocaleLowerCase("en-IN").includes(normalizedReportQuery))
  );

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 sm:px-6 lg:py-10" aria-label="Loading patient reports" aria-busy="true">
        <div className="flex animate-pulse flex-wrap items-center justify-between gap-5 border-b border-slate-200 pb-6">
          <div className="space-y-3"><div className="h-3 w-28 rounded bg-slate-200" /><div className="h-8 w-60 rounded bg-slate-200" /><div className="h-4 w-80 max-w-full rounded bg-slate-200" /></div>
          <div className="h-16 w-72 max-w-full rounded-md bg-white" />
        </div>
        <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="space-y-4"><div className="h-8 w-48 animate-pulse rounded bg-slate-200" /><div className="divide-y rounded-md border border-slate-200 bg-white">{[1, 2, 3].map((item) => <div key={item} className="flex animate-pulse items-center justify-between gap-4 px-5 py-6"><div className="space-y-2"><div className="h-4 w-48 rounded bg-slate-100" /><div className="h-3 w-64 max-w-full rounded bg-slate-100" /></div><div className="h-10 w-28 rounded bg-slate-100" /></div>)}</div></div>
          <div className="h-64 animate-pulse rounded-md border border-slate-200 bg-white" />
        </div>
      </div>
    );
  }

  const whatsappUrl = `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent("Hello Nova Diagnostics, I need help accessing my report.")}`;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:py-10">
      <div className="mb-7 flex flex-col justify-between gap-5 border-b border-slate-200 pb-6 sm:flex-row sm:items-end">
        <div>
          <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-teal-800">
            <ShieldCheck className="size-4" aria-hidden="true" />
            Patient portal
          </p>
          <h1 className="mt-2 text-[28px] font-semibold leading-tight text-[#061a33] sm:text-[32px]">Your reports</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">View and download the reports linked to your sign-in email.</p>
        </div>

        <div className="flex min-w-0 items-center gap-3 rounded-md border border-slate-200 bg-white p-3 sm:min-w-[310px]">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-[#eef5f8] text-sm font-semibold text-[#0b2b45]">{initials}</span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold text-slate-800">{user?.name}</span>
            <span className="mt-0.5 block truncate text-xs text-slate-500">{user?.email}</span>
          </span>
          <button
            type="button"
            onClick={handleSignOut}
            className="inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-md px-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-[#061a33]"
            aria-label="Sign out of patient portal"
          >
            <LogOut className="size-4" aria-hidden="true" />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </div>

      <div className="mb-7 flex flex-wrap items-center justify-between gap-3 rounded-md border border-teal-100 bg-white px-4 py-3.5">
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-md bg-teal-50 text-teal-800"><FileText className="size-[18px]" aria-hidden="true" /></span>
          <span>
            <span className="block text-sm font-semibold text-slate-800">Reports linked to this email</span>
            <span className="mt-0.5 block text-xs text-slate-500">Reports appear here when they are ready.</span>
          </span>
        </div>
        <span className="rounded-md bg-slate-50 px-3 py-1.5 text-xs font-semibold tabular-nums text-slate-700">
          {reports.length} {reports.length === 1 ? "report" : "reports"}
        </span>
      </div>

      <div className="grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_300px]">
        <section id="reports" className="min-w-0">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-[#061a33]">Reports & results</h2>
              <p className="mt-1 text-xs text-slate-500">Your most recent reports are listed first.</p>
            </div>
            {reports.length > 0 ? (
              <label className="relative block w-full sm:max-w-[280px]">
                <span className="sr-only">Search reports</span>
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                <input
                  type="search"
                  value={reportQuery}
                  onChange={(event) => setReportQuery(event.target.value)}
                  placeholder="Search test or report number"
                  className="h-10 w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 text-xs text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/10"
                />
              </label>
            ) : null}
          </div>

          {reports.length === 0 ? (
            <div className="rounded-md border border-slate-200 bg-white px-5 py-10 text-center sm:px-8 sm:py-14">
              <span className="mx-auto flex size-12 items-center justify-center rounded-md bg-slate-50 text-slate-500"><FileText className="size-6" aria-hidden="true" /></span>
              <h3 className="mt-4 text-base font-semibold text-[#061a33]">No reports available yet</h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Ready reports linked to this email will appear here. If the lab shared a report link with you, you can open it directly or look up a report using its number.
              </p>
              <div className="mt-6 flex flex-col justify-center gap-2.5 sm:flex-row">
                <Link href="/reports" className="btn-secondary text-sm"><FileSearch className="size-4" aria-hidden="true" />Find a report number</Link>
                <Link href="/tests" className="btn-primary text-sm"><CalendarCheck className="size-4" aria-hidden="true" />Browse tests</Link>
              </div>
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="rounded-md border border-slate-200 bg-white px-5 py-10 text-center">
              <p className="text-sm font-semibold text-slate-800">No matching reports</p>
              <p className="mt-1 text-xs text-slate-500">Try another test name or report number.</p>
              <button type="button" onClick={() => setReportQuery("")} className="mt-3 text-xs font-semibold text-teal-800 underline decoration-teal-200 underline-offset-4">Clear search</button>
            </div>
          ) : (
            <div className="overflow-hidden rounded-md border border-slate-200 bg-white divide-y divide-slate-100">
              {filteredReports.map((report) => {
                let formattedDate = report.report_date;
                try {
                  formattedDate = new Date(report.report_date).toLocaleDateString("en-IN", {
                    timeZone: "Asia/Kolkata",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  });
                } catch { /* keep raw */ }

                const downloadState = dlStates[report.id] ?? { phase: "idle" };

                return (
                  <article key={report.id} className="grid gap-4 px-4 py-4 transition-colors hover:bg-slate-50/70 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:px-5">
                    <div className="flex min-w-0 items-start gap-3.5">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-[#eef5f8] text-[#0b3b75]"><FileText className="size-[18px]" aria-hidden="true" /></span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="min-w-0 text-sm font-semibold text-slate-900">{report.test_name}</h3>
                          <span className={`inline-flex items-center gap-1.5 rounded px-2 py-1 text-[10px] font-semibold capitalize ${STATUS_CHIP[report.status] ?? STATUS_CHIP.archived}`}>
                            <span className={`size-1.5 rounded-full ${STATUS_DOT[report.status] ?? STATUS_DOT.archived}`} aria-hidden="true" />
                            {report.status}
                          </span>
                        </div>
                        <p className="mt-1.5 break-words text-xs text-slate-500">{report.patient_name} <span className="px-1 text-slate-300">·</span> {report.report_number}</p>
                        <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-slate-500"><CalendarDays className="size-3.5" aria-hidden="true" />{formattedDate}</p>
                        {downloadState.phase === "error" ? <p role="alert" className="mt-2 text-xs font-medium text-rose-700">{downloadState.msg}</p> : null}
                        {downloadState.phase === "ready" ? <p className="mt-2 text-xs font-medium text-teal-800">Your secure link is ready. Open the PDF before the link expires.</p> : null}
                      </div>
                    </div>

                    <div className="sm:pl-3">
                      {downloadState.phase === "ready" ? (
                        <a href={downloadState.url} target="_blank" rel="noopener noreferrer" className="btn-primary w-full text-xs sm:w-auto">
                          <ExternalLink className="size-4" aria-hidden="true" />Open PDF
                        </a>
                      ) : downloadState.phase === "loading" ? (
                        <button type="button" disabled className="btn-primary w-full cursor-wait text-xs opacity-70 sm:w-auto">
                          <span className="inline-block size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />Preparing…
                        </button>
                      ) : (
                        <button type="button" onClick={() => handleGetLink(report)} className="btn-primary w-full text-xs sm:w-auto">
                          <Download className="size-4" aria-hidden="true" />Download report
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <aside className="space-y-4">
          <section className="rounded-md border border-slate-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-[#061a33]">Useful links</h2>
            <div className="mt-3 divide-y divide-slate-100">
              <Link href="/reports" className="flex min-h-12 items-center gap-3 py-2 text-xs font-medium text-slate-700 transition hover:text-teal-800">
                <FileSearch className="size-4 text-slate-500" aria-hidden="true" />
                <span className="min-w-0 flex-1">Find a report by number</span>
                <ArrowRight className="size-3.5 text-slate-400" aria-hidden="true" />
              </Link>
              <Link href="/tests" className="flex min-h-12 items-center gap-3 py-2 text-xs font-medium text-slate-700 transition hover:text-teal-800">
                <CalendarCheck className="size-4 text-slate-500" aria-hidden="true" />
                <span className="min-w-0 flex-1">Browse tests & packages</span>
                <ArrowRight className="size-3.5 text-slate-400" aria-hidden="true" />
              </Link>
              <Link href="/home-sample-collection" className="flex min-h-12 items-center gap-3 py-2 text-xs font-medium text-slate-700 transition hover:text-teal-800">
                <CalendarDays className="size-4 text-slate-500" aria-hidden="true" />
                <span className="min-w-0 flex-1">Request home collection</span>
                <ArrowRight className="size-3.5 text-slate-400" aria-hidden="true" />
              </Link>
            </div>
          </section>

          <section className="rounded-md bg-[#061a33] p-5 text-white">
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-teal-200">Patient support</p>
            <h2 className="mt-2 text-base font-semibold">Need help with a report?</h2>
            <p className="mt-1.5 text-xs leading-5 text-slate-300">Contact the Nova Diagnostics team for help accessing your results.</p>
            <div className="mt-4 grid gap-2">
              <a href={whatsappUrl} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-white px-3 py-2 text-xs font-semibold text-[#061a33] transition hover:bg-teal-50">
                <MessageCircle className="size-4" aria-hidden="true" />WhatsApp the lab
              </a>
              <a href={`tel:${siteConfig.phone}`} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-white/20 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/10">
                <Phone className="size-4" aria-hidden="true" />Call {siteConfig.displayPhone}
              </a>
            </div>
          </section>

          <p className="px-1 text-[11px] leading-5 text-slate-500">Reports are shown for the email address used to sign in. Medical decisions should be discussed with a qualified doctor.</p>
        </aside>
      </div>
    </div>
  );
}
