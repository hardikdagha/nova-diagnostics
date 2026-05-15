"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import {
  ClipboardList,
  Download,
  FileText,
  Home,
  Plus,
  ScrollText,
  TrendingUp,
  Upload,
} from "lucide-react";

interface Stats {
  totalReports: number;
  readyReports: number;
  totalDownloads: number;
  todayUploads: number;
  newHomeCollections: number;
  newPrescriptionRequests: number;
  newEnquiries: number;
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
  latestRequests: Array<{
    id: string;
    type: "home_collection" | "prescription" | "enquiry";
    full_name: string;
    mobile: string;
    status: string;
    summary: string;
    created_at: string;
    href: string;
  }>;
}

const STATUS_COLORS: Record<string, string> = {
  ready:    "bg-emerald-100 text-emerald-700",
  draft:    "bg-amber-100 text-amber-700",
  revoked:  "bg-rose-100 text-rose-700",
  archived: "bg-slate-100 text-slate-600",
};

const REQ_STATUS_COLORS: Record<string, string> = {
  New:       "bg-sky-100 text-sky-700",
  Viewed:    "bg-slate-100 text-slate-600",
  Contacted: "bg-amber-100 text-amber-700",
  Called:    "bg-amber-100 text-amber-700",
  Confirmed: "bg-teal-100 text-teal-700",
  Completed: "bg-emerald-100 text-emerald-700",
  Resolved:  "bg-emerald-100 text-emerald-700",
  Booked:    "bg-teal-100 text-teal-700",
  Cancelled: "bg-rose-100 text-rose-700",
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  async function load() {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [countRes, recentRes, hcRes, rxRes, enqRes] = await Promise.all([
      supabase.from("reports").select("status, download_count, created_at"),
      supabase
        .from("reports")
        .select("id, report_number, patient_name, test_name, status, download_count, report_date, created_at")
        .order("created_at", { ascending: false })
        .limit(8),
      supabase.from("home_collection_requests").select("id, full_name, mobile, status, area_location, test_package_required, created_at").order("created_at", { ascending: false }).limit(5),
      supabase.from("prescription_requests").select("id, full_name, mobile, status, preferred_service, created_at").order("created_at", { ascending: false }).limit(5),
      supabase.from("contact_enquiries").select("id, full_name, mobile, status, inquiry_type, created_at").order("created_at", { ascending: false }).limit(5),
    ]);

    type CountRow = { status: string; download_count: number; created_at: string };
    const rows = (countRes.data ?? []) as CountRow[];

    const hcRows = hcRes.data ?? [];
    const rxRows = rxRes.data ?? [];
    const enqRows = enqRes.data ?? [];

    // Merge latest requests from all three tables, sort by created_at desc, take 10
    type HcRow = typeof hcRows[number];
    type RxRow = typeof rxRows[number];
    type EnqRow = typeof enqRows[number];

    const latestRequests: Stats["latestRequests"] = [
      ...hcRows.map((r: HcRow) => ({
        id: r.id,
        type: "home_collection" as const,
        full_name: r.full_name,
        mobile: r.mobile,
        status: r.status,
        summary: r.area_location ?? (r.test_package_required ?? "Home collection"),
        created_at: r.created_at,
        href: "/admin/home-collections",
      })),
      ...rxRows.map((r: RxRow) => ({
        id: r.id,
        type: "prescription" as const,
        full_name: r.full_name,
        mobile: r.mobile,
        status: r.status,
        summary: r.preferred_service ? `Via ${r.preferred_service}` : "Prescription upload",
        created_at: r.created_at,
        href: "/admin/prescription-requests",
      })),
      ...enqRows.map((r: EnqRow) => ({
        id: r.id,
        type: "enquiry" as const,
        full_name: r.full_name,
        mobile: r.mobile,
        status: r.status,
        summary: r.inquiry_type ?? "General enquiry",
        created_at: r.created_at,
        href: "/admin/enquiries",
      })),
    ]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 10);

    setStats({
      totalReports: rows.length,
      readyReports: rows.filter((r) => r.status === "ready").length,
      totalDownloads: rows.reduce((s, r) => s + (r.download_count ?? 0), 0),
      todayUploads: rows.filter((r) => new Date(r.created_at) >= todayStart).length,
      newHomeCollections: hcRows.filter((r: HcRow) => r.status === "New").length,
      newPrescriptionRequests: rxRows.filter((r: RxRow) => r.status === "New").length,
      newEnquiries: enqRows.filter((r: EnqRow) => r.status === "New").length,
      recentReports: (recentRes.data ?? []) as Stats["recentReports"],
      latestRequests,
    });
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    intervalRef.current = setInterval(load, 30_000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-slate-300 border-t-[#061A33]" />
      </div>
    );
  }

  const TYPE_LABEL: Record<string, string> = {
    home_collection: "Home Collection",
    prescription: "Prescription",
    enquiry: "Enquiry",
  };
  const TYPE_ICON: Record<string, React.ElementType> = {
    home_collection: Home,
    prescription: ScrollText,
    enquiry: ClipboardList,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-950">Dashboard</h1>
        <Link href="/admin/reports/upload" className="btn-primary text-sm">
          <Plus className="size-4" /> Upload Report
        </Link>
      </div>

      {/* Report stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Reports",     value: stats?.totalReports   ?? 0, icon: FileText,   color: "text-[#061A33]",   bg: "bg-[#061A33]/5" },
          { label: "Ready to Download", value: stats?.readyReports   ?? 0, icon: Download,   color: "text-emerald-700", bg: "bg-emerald-50" },
          { label: "Total Downloads",   value: stats?.totalDownloads ?? 0, icon: TrendingUp,  color: "text-teal-700",   bg: "bg-teal-50" },
          { label: "Uploaded Today",    value: stats?.todayUploads   ?? 0, icon: Upload,     color: "text-amber-700",   bg: "bg-amber-50" },
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

      {/* New request cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          {
            label: "New Home Collections",
            value: stats?.newHomeCollections ?? 0,
            icon: Home,
            href: "/admin/home-collections",
            color: "text-teal-700",
            bg: "bg-teal-50",
          },
          {
            label: "New Prescription Requests",
            value: stats?.newPrescriptionRequests ?? 0,
            icon: ScrollText,
            href: "/admin/prescription-requests",
            color: "text-violet-700",
            bg: "bg-violet-50",
          },
          {
            label: "New Enquiries",
            value: stats?.newEnquiries ?? 0,
            icon: ClipboardList,
            href: "/admin/enquiries",
            color: "text-sky-700",
            bg: "bg-sky-50",
          },
        ].map(({ label, value, icon: Icon, href, color, bg }) => (
          <Link key={label} href={href} className="card-premium flex items-center gap-4 p-5 hover:bg-slate-50 transition-colors">
            <div className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${bg}`}>
              <Icon className={`size-5 ${color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-950">{value}</p>
              <p className="text-sm text-slate-500">{label}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Latest requests */}
      {(stats?.latestRequests?.length ?? 0) > 0 && (
        <div className="card-premium overflow-hidden">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="font-semibold text-slate-950">Latest Requests</h2>
          </div>
          <div className="divide-y divide-slate-50">
            {stats?.latestRequests.map((r) => {
              const Icon = TYPE_ICON[r.type] ?? ClipboardList;
              const date = new Date(r.created_at).toLocaleDateString("en-IN", {
                day: "numeric", month: "short",
              });
              return (
                <Link key={`${r.type}-${r.id}`} href={r.href} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-slate-100">
                    <Icon className="size-4 text-slate-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-950">{r.full_name}</p>
                    <p className="text-xs text-slate-400">{TYPE_LABEL[r.type]} · {r.summary} · {date}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${REQ_STATUS_COLORS[r.status] ?? "bg-slate-100 text-slate-600"}`}>
                    {r.status}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

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
                  <th className="hidden px-5 py-3 sm:table-cell">Test</th>
                  <th className="hidden px-5 py-3 md:table-cell">Report Date</th>
                  <th className="hidden px-5 py-3 text-center sm:table-cell">Downloads</th>
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
                    <td className="hidden px-5 py-3.5 text-slate-600 sm:table-cell">{r.test_name}</td>
                    <td className="hidden px-5 py-3.5 text-slate-500 md:table-cell">
                      {new Date(r.report_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="hidden px-5 py-3.5 text-center text-slate-500 sm:table-cell">
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
