"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  FileText,
  Home,
  RefreshCw,
  ScrollText,
  Upload,
} from "lucide-react";
import { staffSupabase as supabase } from "@/lib/supabase/staffClient";

type RequestType = "home_collection" | "prescription" | "enquiry";

type RequestRecord = {
  id: string;
  type: RequestType;
  full_name: string;
  status: string;
  summary: string;
  created_at: string;
  href: string;
};

type RecentReport = {
  id: string;
  report_number: string;
  patient_name: string;
  test_name: string;
  status: string;
  download_count: number;
  report_date: string;
  created_at: string;
};

type ActivityRecord = {
  id: string;
  kind: "report" | RequestType;
  title: string;
  person: string;
  detail: string;
  created_at: string;
  href: string;
};

type DashboardData = {
  readyReports: number;
  todayUploads: number;
  homeCollectionsToday: number;
  newHomeCollections: number;
  newPrescriptionRequests: number;
  newEnquiries: number;
  actionQueue: RequestRecord[];
  recentReports: RecentReport[];
  activity: ActivityRecord[];
};

const REQUEST_META: Record<RequestType, { label: string; icon: typeof Home; tone: string }> = {
  home_collection: { label: "Home collection", icon: Home, tone: "bg-teal-50 text-teal-800" },
  prescription: { label: "Prescription", icon: ScrollText, tone: "bg-violet-50 text-violet-800" },
  enquiry: { label: "Enquiry", icon: ClipboardList, tone: "bg-sky-50 text-sky-800" },
};

const STATUS_TONE: Record<string, string> = {
  ready: "bg-emerald-50 text-emerald-800",
  draft: "bg-amber-50 text-amber-800",
  revoked: "bg-rose-50 text-rose-800",
  archived: "bg-slate-100 text-slate-600",
};

function getIndiaDayRange() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const part = (type: string) => parts.find((item) => item.type === type)?.value ?? "";
  const date = `${part("year")}-${part("month")}-${part("day")}`;
  const start = new Date(`${date}T00:00:00+05:30`);
  return {
    start: start.toISOString(),
    end: new Date(start.getTime() + 24 * 60 * 60 * 1000).toISOString(),
  };
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function createPreviewData(): DashboardData {
  const now = Date.now();
  const minutesAgo = (minutes: number) => new Date(now - minutes * 60_000).toISOString();
  const today = new Date(now).toISOString();

  const actionQueue: RequestRecord[] = [
    {
      id: "DEMO-ENQ-0148",
      type: "enquiry",
      full_name: "Preview Patient A",
      status: "New",
      summary: "Request to book a blood test",
      created_at: minutesAgo(18),
      href: "/admin/enquiries",
    },
    {
      id: "DEMO-HC-0032",
      type: "home_collection",
      full_name: "Preview Patient B",
      status: "New",
      summary: "Vashi · CBC and thyroid profile",
      created_at: minutesAgo(52),
      href: "/admin/home-collections",
    },
  ];

  const recentReports: RecentReport[] = [
    { id: "DEMO-REPORT-01", report_number: "DEMO-2026-008547", patient_name: "Preview Patient C", test_name: "CBC", status: "ready", download_count: 1, report_date: today, created_at: minutesAgo(35) },
    { id: "DEMO-REPORT-02", report_number: "DEMO-2026-008546", patient_name: "Preview Patient D", test_name: "Thyroid Profile", status: "ready", download_count: 0, report_date: today, created_at: minutesAgo(90) },
    { id: "DEMO-REPORT-03", report_number: "DEMO-2026-008545", patient_name: "Preview Patient E", test_name: "Fasting Blood Sugar", status: "ready", download_count: 2, report_date: today, created_at: minutesAgo(145) },
    { id: "DEMO-REPORT-04", report_number: "DEMO-2026-008544", patient_name: "Preview Patient F", test_name: "Lipid Profile", status: "ready", download_count: 0, report_date: today, created_at: minutesAgo(210) },
  ];

  const activity: ActivityRecord[] = [
    { id: "DEMO-ACTIVITY-01", kind: "enquiry", title: "Enquiry received", person: "Preview Patient A", detail: "Request to book a blood test", created_at: minutesAgo(18), href: "/admin/enquiries" },
    { id: "DEMO-ACTIVITY-02", kind: "report", title: "Report uploaded", person: "Preview Patient C", detail: "CBC · DEMO-2026-008547", created_at: minutesAgo(35), href: "/admin/reports" },
    { id: "DEMO-ACTIVITY-03", kind: "home_collection", title: "Home collection request received", person: "Preview Patient B", detail: "Vashi · CBC and thyroid profile", created_at: minutesAgo(52), href: "/admin/home-collections" },
    { id: "DEMO-ACTIVITY-04", kind: "report", title: "Report uploaded", person: "Preview Patient D", detail: "Thyroid Profile · DEMO-2026-008546", created_at: minutesAgo(90), href: "/admin/reports" },
  ];

  return {
    readyReports: 85,
    todayUploads: 4,
    homeCollectionsToday: 2,
    newHomeCollections: 1,
    newPrescriptionRequests: 0,
    newEnquiries: 1,
    actionQueue,
    recentReports,
    activity,
  };
}

function StatCard({
  label,
  value,
  detail,
  icon: Icon,
  accent,
}: {
  label: string;
  value: number;
  detail: string;
  icon: typeof FileText;
  accent: string;
}) {
  return (
    <section className="relative min-w-0 overflow-hidden rounded-md border border-slate-200/80 bg-white px-5 py-5 shadow-[0_2px_12px_rgba(15,23,42,0.035)] sm:px-6">
      <span className={`absolute inset-y-0 left-0 w-[3px] ${accent}`} aria-hidden="true" />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-500">{label}</p>
          <p className="mt-2 text-[32px] font-semibold leading-none tabular-nums tracking-normal text-[#0b1f33]">{value.toLocaleString("en-IN")}</p>
          <p className="mt-2 text-xs text-slate-500">{detail}</p>
        </div>
        <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-slate-50 text-slate-600">
          <Icon className="size-[17px]" aria-hidden="true" />
        </span>
      </div>
    </section>
  );
}

export default function AdminDashboardPage() {
  const pathname = usePathname();
  const isPreview = process.env.NODE_ENV === "development" && pathname?.replace(/\/$/, "") === "/admin/dashboard-preview";
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState("");
  const [businessDate, setBusinessDate] = useState("");

  const loadDashboard = useCallback(async () => {
    setRefreshing(true);
    setError("");

    if (isPreview) {
      setData(createPreviewData());
      setLastUpdated(new Intl.DateTimeFormat("en-IN", {
        timeZone: "Asia/Kolkata",
        hour: "numeric",
        minute: "2-digit",
      }).format(new Date()));
      setLoading(false);
      setRefreshing(false);
      return;
    }

    const { start, end } = getIndiaDayRange();

    try {
      const [
        readyReportsRes,
        todayUploadsRes,
        homeTodayRes,
        homeNewRes,
        prescriptionNewRes,
        enquiryNewRes,
        reportsRes,
        homeRecentRes,
        prescriptionRecentRes,
        enquiriesRecentRes,
      ] = await Promise.all([
        supabase.from("reports").select("id", { count: "exact", head: true }).eq("status", "ready"),
        supabase.from("reports").select("id", { count: "exact", head: true }).gte("created_at", start).lt("created_at", end),
        supabase.from("home_collection_requests").select("id", { count: "exact", head: true }).gte("created_at", start).lt("created_at", end),
        supabase.from("home_collection_requests").select("id", { count: "exact", head: true }).eq("status", "New"),
        supabase.from("prescription_requests").select("id", { count: "exact", head: true }).eq("status", "New"),
        supabase.from("contact_enquiries").select("id", { count: "exact", head: true }).eq("status", "New"),
        supabase
          .from("reports")
          .select("id, report_number, patient_name, test_name, status, download_count, report_date, created_at")
          .order("created_at", { ascending: false })
          .limit(7),
        supabase
          .from("home_collection_requests")
          .select("id, full_name, status, area_location, test_package_required, created_at")
          .order("created_at", { ascending: false })
          .limit(12),
        supabase
          .from("prescription_requests")
          .select("id, full_name, status, preferred_service, created_at")
          .order("created_at", { ascending: false })
          .limit(12),
        supabase
          .from("contact_enquiries")
          .select("id, full_name, status, inquiry_type, created_at")
          .order("created_at", { ascending: false })
          .limit(12),
      ]);

      const responses = [
        readyReportsRes,
        todayUploadsRes,
        homeTodayRes,
        homeNewRes,
        prescriptionNewRes,
        enquiryNewRes,
        reportsRes,
        homeRecentRes,
        prescriptionRecentRes,
        enquiriesRecentRes,
      ];
      const failed = responses.find((response) => response.error);
      if (failed?.error) throw failed.error;

      const reports = (reportsRes.data ?? []) as RecentReport[];
      const homeRequests = homeRecentRes.data ?? [];
      const prescriptionRequests = prescriptionRecentRes.data ?? [];
      const enquiries = enquiriesRecentRes.data ?? [];

      const requests: RequestRecord[] = [
        ...homeRequests.map((record) => ({
          id: record.id,
          type: "home_collection" as const,
          full_name: record.full_name,
          status: record.status,
          summary: record.area_location || record.test_package_required || "Home collection request",
          created_at: record.created_at,
          href: "/admin/home-collections",
        })),
        ...prescriptionRequests.map((record) => ({
          id: record.id,
          type: "prescription" as const,
          full_name: record.full_name,
          status: record.status,
          summary: record.preferred_service ? `Preferred contact: ${record.preferred_service}` : "Prescription upload request",
          created_at: record.created_at,
          href: "/admin/prescription-requests",
        })),
        ...enquiries.map((record) => ({
          id: record.id,
          type: "enquiry" as const,
          full_name: record.full_name,
          status: record.status,
          summary: record.inquiry_type || "General enquiry",
          created_at: record.created_at,
          href: "/admin/enquiries",
        })),
      ];

      const actionQueue = requests
        .filter((record) => record.status === "New")
        .sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at))
        .slice(0, 6);

      const activity: ActivityRecord[] = [
        ...reports.map((report) => ({
          id: `report-${report.id}`,
          kind: "report" as const,
          title: "Report uploaded",
          person: report.patient_name,
          detail: `${report.test_name} · ${report.report_number}`,
          created_at: report.created_at,
          href: `/admin/reports?id=${report.id}`,
        })),
        ...requests.map((request) => ({
          id: `${request.type}-${request.id}`,
          kind: request.type,
          title: request.type === "home_collection"
            ? "Home collection request received"
            : request.type === "prescription"
              ? "Prescription request received"
              : "Enquiry received",
          person: request.full_name,
          detail: request.summary,
          created_at: request.created_at,
          href: request.href,
        })),
      ]
        .sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at))
        .slice(0, 6);

      setData({
        readyReports: readyReportsRes.count ?? 0,
        todayUploads: todayUploadsRes.count ?? 0,
        homeCollectionsToday: homeTodayRes.count ?? 0,
        newHomeCollections: homeNewRes.count ?? 0,
        newPrescriptionRequests: prescriptionNewRes.count ?? 0,
        newEnquiries: enquiryNewRes.count ?? 0,
        actionQueue,
        recentReports: reports,
        activity,
      });
      setLastUpdated(new Intl.DateTimeFormat("en-IN", {
        timeZone: "Asia/Kolkata",
        hour: "numeric",
        minute: "2-digit",
      }).format(new Date()));
    } catch (caught) {
      console.error("[AdminDashboard] Could not load operations data:", caught);
      setError("Live operations data could not be loaded. Try refreshing, or open the relevant queue directly.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isPreview]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setBusinessDate(new Intl.DateTimeFormat("en-IN", {
        timeZone: "Asia/Kolkata",
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(new Date()));
    }, 0);
    const loadTimeout = window.setTimeout(() => void loadDashboard(), 0);
    const interval = setInterval(() => void loadDashboard(), 60_000);
    return () => {
      window.clearTimeout(timeout);
      window.clearTimeout(loadTimeout);
      clearInterval(interval);
    };
  }, [loadDashboard]);

  const newRequests = data
    ? data.newHomeCollections + data.newPrescriptionRequests + data.newEnquiries
    : 0;

  if (loading && !data) {
    return (
      <div className="space-y-6" aria-label="Loading operations overview" aria-busy="true">
        <div className="space-y-2"><div className="h-7 w-64 animate-pulse rounded bg-slate-200" /><div className="h-4 w-48 animate-pulse rounded bg-slate-200" /></div>
        <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-4">{Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-[118px] animate-pulse rounded-md border border-slate-200 bg-white" />)}</div>
        <div className="grid gap-4 2xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,0.8fr)]"><div className="h-80 animate-pulse rounded-md border border-slate-200 bg-white" /><div className="h-80 animate-pulse rounded-md border border-slate-200 bg-white" /></div>
      </div>
    );
  }

  if (!data && error) {
    return (
      <div className="mx-auto flex min-h-[48vh] max-w-xl flex-col items-start justify-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.13em] text-teal-800">Operations</p>
        <h1 className="mt-1 text-[25px] font-semibold leading-tight text-[#0b1f33]">Operations overview</h1>
        <div role="alert" className="mt-5 w-full rounded-md border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
          <p>{error}</p>
          <button type="button" onClick={() => void loadDashboard()} className="mt-3 font-semibold underline underline-offset-2">Retry</button>
        </div>
      </div>
    );
  }

  const metrics = [
    { label: "Reports available", value: data?.readyReports ?? 0, detail: "Ready for patient access", icon: FileText, accent: "bg-teal-600" },
    { label: "Uploaded today", value: data?.todayUploads ?? 0, detail: "Reports added today · IST", icon: Upload, accent: "bg-blue-600" },
    { label: "New requests", value: newRequests, detail: "Awaiting first review", icon: ClipboardList, accent: "bg-amber-500" },
    { label: "Home collections today", value: data?.homeCollectionsToday ?? 0, detail: "Requests received today · IST", icon: Home, accent: "bg-emerald-600" },
  ];

  return (
    <div className="space-y-5 sm:space-y-6">
      {isPreview ? (
        <div role="status" className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-medium text-amber-950">
          Local UI preview · All figures and records below are synthetic examples. This page does not read or change live data.
        </div>
      ) : null}

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.13em] text-teal-800">Operations</p>
          <h1 className="mt-1 text-[25px] font-semibold leading-tight text-[#0b1f33] sm:text-[28px]">Operations overview</h1>
          <p className="mt-1.5 text-sm text-slate-500">{businessDate || "Vashi laboratory"} <span className="px-1 text-slate-300">·</span> Vashi laboratory</p>
        </div>
        <div className="flex w-full items-center gap-2 sm:w-auto">
          <button
            type="button"
            onClick={() => void loadDashboard()}
            disabled={refreshing}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:opacity-60"
            aria-label="Refresh dashboard data"
            title="Refresh dashboard data"
          >
            <RefreshCw className={`size-4 ${refreshing ? "animate-spin" : ""}`} aria-hidden="true" />
            <span className="sm:hidden">Refresh</span>
          </button>
          <Link href="/admin/reports/upload" className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-md bg-[#0b2b45] px-4 text-xs font-semibold text-white shadow-sm transition hover:bg-[#123d5e] sm:flex-none sm:px-5">
            <Upload className="size-4" aria-hidden="true" />
            Upload report
          </Link>
        </div>
      </div>

      {error ? (
        <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
          <span>{error}</span>
          <button type="button" onClick={() => void loadDashboard()} className="font-semibold underline underline-offset-2">Retry</button>
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-4">
        {metrics.map((metric) => <StatCard key={metric.label} {...metric} />)}
      </div>

      <div className="grid items-start gap-4 2xl:grid-cols-[minmax(0,1.68fr)_minmax(330px,0.82fr)]">
        <div className="min-w-0 space-y-4">
          <section className="overflow-hidden rounded-md border border-slate-200/80 bg-white shadow-[0_2px_12px_rgba(15,23,42,0.035)]">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-4 sm:px-5">
              <div className="flex items-center gap-3">
                <div>
                  <h2 className="text-[16px] font-semibold text-[#10263a]">Action required</h2>
                  <p className="mt-0.5 text-xs text-slate-500">New requests that have not been opened yet</p>
                </div>
                <span className={`rounded px-2 py-1 text-[11px] font-semibold tabular-nums ${newRequests ? "bg-amber-50 text-amber-800" : "bg-slate-100 text-slate-600"}`}>
                  {newRequests} {newRequests === 1 ? "item" : "items"}
                </span>
              </div>
              <Link href="#request-queues" className="inline-flex items-center gap-1 text-xs font-semibold text-teal-800 hover:text-teal-950">
                Queue breakdown <ArrowRight className="size-3.5" aria-hidden="true" />
              </Link>
            </div>
            {data?.actionQueue.length ? (
              <div className="divide-y divide-slate-100">
                {data.actionQueue.map((request) => {
                  const meta = REQUEST_META[request.type];
                  const Icon = meta.icon;
                  return (
                    <div key={`${request.type}-${request.id}`} className="grid gap-3 px-4 py-3.5 transition-colors hover:bg-slate-50/70 sm:grid-cols-[minmax(130px,0.85fr)_minmax(115px,0.7fr)_minmax(150px,1.2fr)_auto] sm:items-center sm:px-5">
                      <div className="flex min-w-0 items-center gap-3">
                        <span className={`flex size-8 shrink-0 items-center justify-center rounded-md ${meta.tone}`}><Icon className="size-4" aria-hidden="true" /></span>
                        <span className="min-w-0">
                          <span className="block truncate text-[13px] font-semibold text-slate-900">{request.full_name}</span>
                          <span className="block text-[11px] text-slate-500">{formatTime(request.created_at)}</span>
                        </span>
                      </div>
                      <span className={`w-fit rounded px-2 py-1 text-[10px] font-semibold ${meta.tone}`}>{meta.label}</span>
                      <span className="min-w-0 truncate text-xs text-slate-600">{request.summary}</span>
                      <Link href={request.href} className="inline-flex items-center gap-1 text-xs font-semibold text-[#0b2b45] hover:text-teal-800" aria-label={`Open ${meta.label} queue for ${request.full_name}`}>
                        Open queue <ArrowRight className="size-3.5" aria-hidden="true" />
                      </Link>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex min-h-36 flex-col items-center justify-center px-5 py-8 text-center">
                <CheckCircle2 className="size-6 text-emerald-600" aria-hidden="true" />
                <p className="mt-2 text-sm font-semibold text-slate-800">No new requests</p>
                <p className="mt-1 text-xs text-slate-500">New patient submissions will appear here.</p>
              </div>
            )}
          </section>

          <section className="overflow-hidden rounded-md border border-slate-200/80 bg-white shadow-[0_2px_12px_rgba(15,23,42,0.035)]">
            <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-4 sm:px-5">
              <div>
                <h2 className="text-[16px] font-semibold text-[#10263a]">Recent reports</h2>
                <p className="mt-0.5 text-xs text-slate-500">Latest report records added to the system</p>
              </div>
              <Link href="/admin/reports" className="inline-flex items-center gap-1 text-xs font-semibold text-teal-800 hover:text-teal-950">All reports <ArrowRight className="size-3.5" aria-hidden="true" /></Link>
            </div>
            {data?.recentReports.length ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[620px] text-left text-xs">
                  <thead className="bg-[#f8fafb] text-[10px] font-semibold uppercase tracking-[0.09em] text-slate-500">
                    <tr>
                      <th scope="col" className="px-5 py-3">Patient</th>
                      <th scope="col" className="px-4 py-3">Report no.</th>
                      <th scope="col" className="px-4 py-3">Test</th>
                      <th scope="col" className="px-4 py-3">Report date</th>
                      <th scope="col" className="px-4 py-3">Status</th>
                      <th scope="col" className="px-4 py-3 text-right">Downloads</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.recentReports.map((report) => (
                      <tr key={report.id} className="transition-colors hover:bg-slate-50/70">
                        <td className="px-5 py-3.5">
                          <Link href={`/admin/reports?id=${report.id}`} className="block min-w-0">
                            <span className="block truncate text-[12px] font-semibold text-slate-900">{report.patient_name}</span>
                          </Link>
                        </td>
                        <td className="px-4 py-3.5 font-mono text-[11px] text-slate-500">{report.report_number}</td>
                        <td className="max-w-[160px] truncate px-4 py-3.5 text-slate-700">{report.test_name}</td>
                        <td className="whitespace-nowrap px-4 py-3.5 text-slate-600">{formatDate(report.report_date)}</td>
                        <td className="px-4 py-3.5"><span className={`rounded px-2 py-1 text-[10px] font-semibold capitalize ${STATUS_TONE[report.status] ?? "bg-slate-100 text-slate-600"}`}>{report.status}</span></td>
                        <td className="px-4 py-3.5 text-right tabular-nums text-slate-600">{report.download_count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="px-5 py-12 text-center text-sm text-slate-500">No report records are available.</div>
            )}
          </section>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-1">
          <section id="request-queues" className="overflow-hidden rounded-md border border-slate-200/80 bg-white shadow-[0_2px_12px_rgba(15,23,42,0.035)]">
            <div className="border-b border-slate-200 px-4 py-4 sm:px-5">
              <h2 className="text-[16px] font-semibold text-[#10263a]">Request queues</h2>
              <p className="mt-0.5 text-xs text-slate-500">New items by request type</p>
            </div>
            <div className="divide-y divide-slate-100">
              {[
                { label: "Enquiries", value: data?.newEnquiries ?? 0, href: "/admin/enquiries", icon: ClipboardList, tone: "text-sky-800 bg-sky-50" },
                { label: "Prescription requests", value: data?.newPrescriptionRequests ?? 0, href: "/admin/prescription-requests", icon: ScrollText, tone: "text-violet-800 bg-violet-50" },
                { label: "Home collection requests", value: data?.newHomeCollections ?? 0, href: "/admin/home-collections", icon: Home, tone: "text-teal-800 bg-teal-50" },
              ].map(({ label, value, href, icon: Icon, tone }) => (
                <Link key={label} href={href} className="flex min-h-[58px] items-center gap-3 px-4 transition-colors hover:bg-slate-50 sm:px-5">
                  <span className={`flex size-8 items-center justify-center rounded-md ${tone}`}><Icon className="size-4" aria-hidden="true" /></span>
                  <span className="min-w-0 flex-1 truncate text-xs font-medium text-slate-700">{label}</span>
                  <span className={`min-w-7 text-right text-sm font-semibold tabular-nums ${value ? "text-[#0b1f33]" : "text-slate-400"}`}>{value}</span>
                  <ArrowRight className="size-3.5 text-slate-400" aria-hidden="true" />
                </Link>
              ))}
            </div>
          </section>

          <section className="overflow-hidden rounded-md border border-slate-200/80 bg-white shadow-[0_2px_12px_rgba(15,23,42,0.035)]">
            <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-4 sm:px-5">
              <div>
                <h2 className="text-[16px] font-semibold text-[#10263a]">Recent activity</h2>
                <p className="mt-0.5 text-xs text-slate-500">Request submissions and report uploads</p>
              </div>
              <Link href="/admin/activity" aria-label="View all activity" title="View all activity" className="flex size-8 items-center justify-center rounded-md text-teal-800 transition hover:bg-teal-50">
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
            {data?.activity.length ? (
              <div className="divide-y divide-slate-100">
                {data.activity.map((event) => {
                  const Icon = event.kind === "report" ? FileText : REQUEST_META[event.kind].icon;
                  const tone = event.kind === "report" ? "bg-blue-50 text-blue-800" : REQUEST_META[event.kind].tone;
                  return (
                    <Link key={event.id} href={event.href} className="flex gap-3 px-4 py-3 transition-colors hover:bg-slate-50/70 sm:px-5">
                      <span className={`mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md ${tone}`}><Icon className="size-3.5" aria-hidden="true" /></span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-baseline justify-between gap-2">
                          <span className="truncate text-[11px] font-semibold text-slate-800">{event.title}</span>
                          <time className="shrink-0 text-[10px] tabular-nums text-slate-500">{formatTime(event.created_at)}</time>
                        </span>
                        <span className="mt-0.5 block truncate text-[11px] text-slate-600">{event.person} · {event.detail}</span>
                      </span>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="px-5 py-10 text-center text-xs text-slate-500">No recent records to show.</div>
            )}
          </section>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200/80 pt-3 text-[10px] text-slate-500">
        <span className="inline-flex items-center gap-1.5"><Activity className="size-3.5 text-teal-700" aria-hidden="true" /> Live operational records · All times shown in India Standard Time</span>
        <span>{refreshing ? "Updating…" : lastUpdated ? `Updated ${lastUpdated}` : "Waiting for data"}</span>
      </div>
    </div>
  );
}
