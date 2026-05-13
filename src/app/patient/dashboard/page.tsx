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
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import type { Report } from "@/lib/supabase/types";
import {
  CalendarCheck,
  Download,
  FileSearch,
  FileText,
  LogOut,
  MessageCircle,
  Phone,
  User,
} from "lucide-react";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const STATUS_CHIP: Record<string, string> = {
  ready: "bg-emerald-100 text-emerald-700",
  draft: "bg-amber-100 text-amber-700",
  revoked: "bg-rose-100 text-rose-700",
  archived: "bg-slate-100 text-slate-600",
};

export default function PatientDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ email: string; name: string } | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);

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

      // Reports filtered by patient_email = verified auth email (enforced by RLS)
      // Mobile number is NOT used here — only verified email is trusted.
      const { data } = await supabase
        .from("reports")
        .select("*")
        .eq("patient_email", email)
        .eq("status", "ready")
        .order("report_date", { ascending: false });

      setReports(data ?? []);
      setLoading(false);
    });
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace("/patient/login");
  };

  const handleDownload = async (report: Report) => {
    setDownloading(report.id);
    setDownloadError(null);
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
        window.open(json.signedUrl, "_blank");
      } else {
        setDownloadError("Could not generate download link. Please contact Nova Diagnostics.");
      }
    } catch {
      setDownloadError("Something went wrong. Please try again.");
    } finally {
      setDownloading(null);
    }
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

        {downloadError && (
          <p className="mb-3 rounded-lg bg-rose-50 px-4 py-2.5 text-sm text-rose-600">
            {downloadError}
          </p>
        )}

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

              return (
                <div
                  key={r.id}
                  className="flex items-center justify-between gap-4 px-5 py-4"
                >
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
                  <button
                    onClick={() => handleDownload(r)}
                    disabled={downloading === r.id}
                    className="btn-primary shrink-0 text-sm disabled:opacity-60"
                  >
                    {downloading === r.id ? (
                      <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    ) : (
                      <Download className="size-4" />
                    )}
                    Download
                  </button>
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
