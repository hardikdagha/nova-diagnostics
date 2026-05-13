"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { FileText, Plus, TrendingUp, Users } from "lucide-react";

interface Stats {
  totalReports: number;
  readyReports: number;
  totalDownloads: number;
  recentReports: Array<{
    id: string;
    report_number: string;
    patient_name: string;
    test_name: string;
    status: string;
    created_at: string;
  }>;
}

const STATUS_COLORS: Record<string, string> = {
  ready: "bg-emerald-100 text-emerald-700",
  draft: "bg-amber-100 text-amber-700",
  revoked: "bg-rose-100 text-rose-700",
  archived: "bg-slate-100 text-slate-600",
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [countRes, recentRes] = await Promise.all([
        supabase.from("reports").select("status, download_count"),
        supabase
          .from("reports")
          .select("id, report_number, patient_name, test_name, status, created_at")
          .order("created_at", { ascending: false })
          .limit(8),
      ]);

      type CountRow = { status: string; download_count: number };
      const rows = (countRes.data ?? []) as CountRow[];
      setStats({
        totalReports: rows.length,
        readyReports: rows.filter((r) => r.status === "ready").length,
        totalDownloads: rows.reduce((s, r) => s + (r.download_count ?? 0), 0),
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
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total Reports", value: stats?.totalReports ?? 0, icon: FileText },
          { label: "Ready to Download", value: stats?.readyReports ?? 0, icon: Users },
          { label: "Total Downloads", value: stats?.totalDownloads ?? 0, icon: TrendingUp },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="card-premium flex items-center gap-4 p-5">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#061A33]/5">
              <Icon className="size-5 text-[#061A33]" />
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
          <p className="px-5 py-8 text-center text-sm text-slate-400">No reports yet. Upload the first one.</p>
        ) : (
          <div className="divide-y divide-slate-50">
            {stats?.recentReports.map((r) => (
              <Link
                key={r.id}
                href={`/admin/reports?id=${r.id}`}
                className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-950">{r.patient_name}</p>
                  <p className="text-xs text-slate-500">
                    {r.report_number} · {r.test_name}
                  </p>
                </div>
                <span className={`ml-3 shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_COLORS[r.status] ?? ""}`}>
                  {r.status}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
