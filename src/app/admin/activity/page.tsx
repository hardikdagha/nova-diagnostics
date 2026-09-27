"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  ClipboardList,
  FileText,
  Home,
  RefreshCw,
  ScrollText,
  Search,
} from "lucide-react";
import { staffSupabase as supabase } from "@/lib/supabase/staffClient";

type ActivityKind = "report" | "home_collection" | "prescription" | "enquiry";
type FilterKind = "all" | ActivityKind;

type ActivityEntry = {
  id: string;
  kind: ActivityKind;
  title: string;
  person: string;
  detail: string;
  status: string;
  created_at: string;
  href: string;
};

const KIND_META: Record<ActivityKind, { label: string; icon: typeof Activity; color: string; href: string }> = {
  report: { label: "Report", icon: FileText, color: "bg-blue-50 text-blue-800", href: "/admin/reports" },
  home_collection: { label: "Home collection", icon: Home, color: "bg-teal-50 text-teal-800", href: "/admin/home-collections" },
  prescription: { label: "Prescription", icon: ScrollText, color: "bg-violet-50 text-violet-800", href: "/admin/prescription-requests" },
  enquiry: { label: "Enquiry", icon: ClipboardList, color: "bg-sky-50 text-sky-800", href: "/admin/enquiries" },
};

const FILTERS: Array<{ key: FilterKind; label: string }> = [
  { key: "all", label: "All activity" },
  { key: "report", label: "Reports" },
  { key: "home_collection", label: "Home collections" },
  { key: "prescription", label: "Prescriptions" },
  { key: "enquiry", label: "Enquiries" },
];

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function AdminActivityPage() {
  const [entries, setEntries] = useState<ActivityEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<FilterKind>("all");
  const [query, setQuery] = useState("");

  const loadEntries = useCallback(async () => {
    setRefreshing(true);
    setError("");
    try {
      const [reportsRes, homeRes, prescriptionRes, enquiriesRes] = await Promise.all([
        supabase.from("reports").select("id, report_number, patient_name, test_name, status, created_at").order("created_at", { ascending: false }).limit(40),
        supabase.from("home_collection_requests").select("id, full_name, status, area_location, test_package_required, created_at").order("created_at", { ascending: false }).limit(40),
        supabase.from("prescription_requests").select("id, full_name, status, preferred_service, created_at").order("created_at", { ascending: false }).limit(40),
        supabase.from("contact_enquiries").select("id, full_name, status, inquiry_type, created_at").order("created_at", { ascending: false }).limit(40),
      ]);

      const failed = [reportsRes, homeRes, prescriptionRes, enquiriesRes].find((response) => response.error);
      if (failed?.error) throw failed.error;

      const merged: ActivityEntry[] = [
        ...(reportsRes.data ?? []).map((record) => ({
          id: `report-${record.id}`,
          kind: "report" as const,
          title: "Report uploaded",
          person: record.patient_name,
          detail: `${record.test_name} · ${record.report_number}`,
          status: record.status,
          created_at: record.created_at,
          href: `/admin/reports?id=${record.id}`,
        })),
        ...(homeRes.data ?? []).map((record) => ({
          id: `home-${record.id}`,
          kind: "home_collection" as const,
          title: "Home collection request received",
          person: record.full_name,
          detail: record.area_location || record.test_package_required || "Home collection request",
          status: record.status,
          created_at: record.created_at,
          href: KIND_META.home_collection.href,
        })),
        ...(prescriptionRes.data ?? []).map((record) => ({
          id: `prescription-${record.id}`,
          kind: "prescription" as const,
          title: "Prescription request received",
          person: record.full_name,
          detail: record.preferred_service ? `Preferred contact: ${record.preferred_service}` : "Prescription upload request",
          status: record.status,
          created_at: record.created_at,
          href: KIND_META.prescription.href,
        })),
        ...(enquiriesRes.data ?? []).map((record) => ({
          id: `enquiry-${record.id}`,
          kind: "enquiry" as const,
          title: "Enquiry received",
          person: record.full_name,
          detail: record.inquiry_type || "General enquiry",
          status: record.status,
          created_at: record.created_at,
          href: KIND_META.enquiry.href,
        })),
      ];

      merged.sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at));
      setEntries(merged);
    } catch (caught) {
      console.error("[AdminActivity] Could not load records:", caught);
      setError("Activity records could not be loaded. Try again in a moment.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => void loadEntries(), 0);
    const interval = setInterval(() => void loadEntries(), 60_000);
    return () => {
      window.clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [loadEntries]);

  const filteredEntries = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return entries.filter((entry) => {
      if (filter !== "all" && entry.kind !== filter) return false;
      if (!needle) return true;
      return `${entry.person} ${entry.detail} ${entry.title} ${entry.status}`.toLowerCase().includes(needle);
    });
  }, [entries, filter, query]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.13em] text-teal-800">Visibility</p>
          <h1 className="mt-1 text-[25px] font-semibold leading-tight text-[#0b1f33] sm:text-[28px]">Activity</h1>
          <p className="mt-1.5 text-sm text-slate-500">Recent request submissions and report records, shown in India Standard Time.</p>
        </div>
        <button
          type="button"
          onClick={() => void loadEntries()}
          disabled={refreshing}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:opacity-60"
          aria-label="Refresh activity"
        >
          <RefreshCw className={`size-4 ${refreshing ? "animate-spin" : ""}`} aria-hidden="true" />
          Refresh
        </button>
      </div>

      {error ? <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900"><span>{error}</span><button type="button" onClick={() => void loadEntries()} className="font-semibold underline underline-offset-2">Retry</button></div> : null}

      <section className="overflow-hidden rounded-md border border-slate-200/80 bg-white shadow-[0_2px_12px_rgba(15,23,42,0.035)]">
        <div className="flex flex-col gap-4 border-b border-slate-200 px-4 py-4 sm:px-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-[#10263a]">Latest records</h2>
              <p className="mt-0.5 text-xs text-slate-500">Up to 40 recent entries per workflow</p>
            </div>
            <span className="text-xs tabular-nums text-slate-500">{filteredEntries.length.toLocaleString("en-IN")} shown</span>
          </div>
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex max-w-full gap-1 overflow-x-auto pb-1" role="tablist" aria-label="Filter activity by type">
              {FILTERS.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  role="tab"
                  aria-selected={filter === item.key}
                  onClick={() => setFilter(item.key)}
                  className={`shrink-0 rounded px-3 py-2 text-xs font-semibold transition ${filter === item.key ? "bg-[#0b2b45] text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"}`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <label className="relative block w-full xl:max-w-[320px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Filter by patient or details"
                aria-label="Filter activity by patient or details"
                className="h-10 w-full rounded-md border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:bg-white focus:ring-2 focus:ring-teal-600/10"
              />
            </label>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3 p-5" aria-busy="true">{Array.from({ length: 7 }).map((_, index) => <div key={index} className="h-14 animate-pulse rounded bg-slate-100" />)}</div>
        ) : filteredEntries.length ? (
          <div className="divide-y divide-slate-100">
            {filteredEntries.map((entry) => {
              const meta = KIND_META[entry.kind];
              const Icon = meta.icon;
              return (
                <div key={entry.id} className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-slate-50/70 sm:px-5">
                  <span className={`flex size-9 shrink-0 items-center justify-center rounded-md ${meta.color}`}><Icon className="size-4" aria-hidden="true" /></span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <p className="truncate text-xs font-semibold text-slate-900">{entry.person}</p>
                      <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${meta.color}`}>{meta.label}</span>
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium capitalize text-slate-600">{entry.status}</span>
                    </div>
                    <p className="mt-1 truncate text-xs text-slate-600">{entry.title} <span className="text-slate-300">·</span> {entry.detail}</p>
                  </div>
                  <time className="hidden shrink-0 text-[11px] tabular-nums text-slate-500 md:block">{formatDateTime(entry.created_at)}</time>
                  <Link href={entry.href} className="flex size-8 shrink-0 items-center justify-center rounded-md text-slate-400 transition hover:bg-teal-50 hover:text-teal-800" aria-label={`Open ${meta.label} queue`} title={`Open ${meta.label} queue`}>
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </Link>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex min-h-48 flex-col items-center justify-center px-5 py-10 text-center">
            <Activity className="size-6 text-slate-300" aria-hidden="true" />
            <p className="mt-3 text-sm font-semibold text-slate-800">No matching records</p>
            <p className="mt-1 text-xs text-slate-500">Adjust the filter or search term to see other activity.</p>
          </div>
        )}
      </section>

      <p className="text-[11px] leading-5 text-slate-500">This view reports record creation times and current statuses. It does not represent a complete audit trail of staff edits.</p>
    </div>
  );
}
