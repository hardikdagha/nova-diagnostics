"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import type { Report } from "@/lib/supabase/types";
import { Download, FileText, LogOut, MessageCircle, Phone } from "lucide-react";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;

export default function PatientDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ email: string; name: string } | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.replace("/patient/login"); return; }

      const email = session.user.email ?? "";
      const name = session.user.user_metadata?.full_name ?? email.split("@")[0];
      setUser({ email, name });

      // Load reports linked to this patient's email
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
    try {
      // Call verify-report-token edge function using the report's token is not possible here
      // (we don't have the raw token). Instead, for authenticated patients, use the signed URL API directly.
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(
        `${SUPABASE_URL}/functions/v1/fallback-report-lookup`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token}` },
          body: JSON.stringify({ reportNumber: report.report_number, mobile: report.patient_mobile }),
        }
      );
      const json = await res.json();
      if (json.signedUrl) {
        window.open(json.signedUrl, "_blank");
      } else {
        alert("Could not generate download link. Please contact Nova Diagnostics.");
      }
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-950">Hello, {user?.name}</h1>
          <p className="text-sm text-slate-500">{user?.email}</p>
        </div>
        <button onClick={handleSignOut} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800">
          <LogOut className="size-4" /> Sign out
        </button>
      </div>

      {/* Reports */}
      <div>
        <h2 className="mb-3 font-semibold text-slate-950">Your Reports</h2>
        {reports.length === 0 ? (
          <div className="card-premium p-8 text-center">
            <FileText className="mx-auto mb-3 size-8 text-slate-300" />
            <p className="text-sm font-medium text-slate-600">No reports found</p>
            <p className="mt-1 text-xs text-slate-400">
              Reports will appear here once linked to your email address.
            </p>
            <p className="mt-3 text-xs text-slate-400">
              If you received a WhatsApp report link, you can still use it directly.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {reports.map((r) => (
              <div key={r.id} className="card-premium flex items-center justify-between gap-4 p-4">
                <div className="min-w-0">
                  <p className="truncate font-medium text-slate-950">{r.test_name}</p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {r.report_number} · {new Date(r.report_date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                </div>
                <button
                  onClick={() => handleDownload(r)}
                  disabled={downloading === r.id}
                  className="btn-primary shrink-0 text-sm disabled:opacity-60"
                >
                  {downloading === r.id
                    ? <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    : <Download className="size-4" />}
                  Download
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Help */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <p className="text-sm font-semibold text-slate-800">Need help?</p>
        <p className="mt-1 text-xs text-slate-500">Contact Nova Diagnostics for report access or booking support.</p>
        <div className="mt-3 flex gap-3">
          <a href="tel:+918433706778" className="btn-secondary flex-1 text-sm">
            <Phone className="size-4" /> Call
          </a>
          <a href="https://wa.me/918433706778" className="btn-primary flex-1 text-sm">
            <MessageCircle className="size-4" /> WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
