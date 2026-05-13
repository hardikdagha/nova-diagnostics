"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { Download, FileText, Plus, TrendingUp, Upload } from "lucide-react";

interface Stats {
  totalReports: number;
  readyReports: number;
  totalDownloads: number;
  todayUploads: number;
  recentReports: Array<{
    id: string;
    report_number: string;
    patient_name: string;
    test_name: string;
    status: string;
    download_count: number;
    report_date: string;
    created_at: string;
  }>;
}

const STATUS_COLORS: Record<string, string> = {
  ready:    "bg-emerald-100 text-emerald-700",
  draft:    "bg-amber-100 text-amber-700",
  revoked:  "bg-rose-100 text-rose-700",
  archived: "bg-slate-100 text-slate-600",
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const [countRes, recentRes] = await Promise.all([
        supabase.from("reports").select("status, download_count, created_at"),
        supabase
          .from("reports")
          .select("id, report_number, patient_name, test_name, status, download_count, report_date, created_at")
          .order("created_at", { ascending: false })
          .limit(10),
      ]);

      type CountRow = { status: string; download_count: number; created_at: string };
      const rows = (countRes.data ?? []) as CountRow[];
      setStats({
        totalReports: rows.length,
        readyReports: rows.filter((r) => r.status === "ready").length,
        totalDownloads: rows.reduce((s, r) => s + (r.download_count ?? 0), 0),
        todayUploads: rows.filter((r) => new Date(r.created_at) >= todayStart).length,
        recentReports: (recentRes.data ?? []) as Stats["recentReports"],
      });
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-slate-300 border-t-[#061A33]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-950">Dashboard</h1>
        <Link href="/admin/reports/upload" className="btn-primary text-sm">
          <Plus className="size-4" /> Upload Report
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Reports",    value: stats?.totalReports   ?? 0, icon: FileText,  color: "text-[#061A33]",    bg: "bg-[#061A33]/5" },
          { label: "Ready to Download",value: stats?.readyReports   ?? 0, icon: Download,  color: "text-emerald-700",  bg: "bg-emerald-50" },
          { label: "Total Downloads",  value: stats?.totalDownloads ?? 0, icon: TrendingUp, color: "text-teal-700",    bg: "bg-teal-50" },
          { label: "Uploaded Today",   value: stats?.todayUploads   ?? 0, icon: Upload,    color: "text-amber-700",    bg: "bg-amber-50" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="card-premium flex items-center gap-4 p-5">
            <div className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${bg}`}>
              <Icon className={`size-5 ${color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-950">{value}</p>
              <p className="text-sm text-slate-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent reports */}
      <div className="card-premium overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="font-semibold text-slate-950">Recent Reports</h2>
          <Link href="/admin/reports" className="text-sm font-medium text-teal-600 hover:text-teal-700">
            View all
          </Link>
        </div>
        {stats?.recentReports.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-slate-400">
            No reports yet.{" "}
            <Link href="/admin/reports/upload" className="font-medium text-teal-600 underline">
              Upload the first one.
            </Link>
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                  <th className="px-5 py-3">Patient</th>
                  <th className="px-5 py-3 hidden sm:table-cell">Test</th>
                  <th className="px-5 py-3 hidden md:table-cell">Report Date</th>
                  <th className="px-5 py-3 text-center hidden sm:table-cell">Downloads</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {stats?.recentReports.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3.5">
                      <Link href={`/admin/reports?id=${r.id}`} className="block">
                        <p className="font-medium text-slate-950 hover:text-teal-700">{r.patient_name}</p>
                        <p className="text-xs text-slate-400">{r.report_number}</p>
                      </Link>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 hidden sm:table-cell">{r.test_name}</td>
                    <td className="px-5 py-3.5 text-slate-500 hidden md:table-cell">
                      {new Date(r.report_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-5 py-3.5 text-center text-slate-500 hidden sm:table-cell">
                      {r.download_count}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_COLORS[r.status] ?? ""}`}>
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
