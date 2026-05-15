"use client";

import { useEffect, useRef, useState } from "react";
import { ClipboardList, MessageSquare, Phone, Search, X } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import type { ContactEnquiry } from "@/lib/supabase/types";

const STATUSES = ["New", "Viewed", "Contacted", "Resolved", "Closed", "Spam"] as const;

const STATUS_CHIP: Record<string, string> = {
  New:       "bg-sky-100 text-sky-700",
  Viewed:    "bg-slate-100 text-slate-600",
  Contacted: "bg-amber-100 text-amber-700",
  Resolved:  "bg-emerald-100 text-emerald-700",
  Closed:    "bg-slate-100 text-slate-500",
  Spam:      "bg-rose-100 text-rose-700",
};

export default function EnquiriesPage() {
  const [rows, setRows] = useState<ContactEnquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<ContactEnquiry | null>(null);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  async function load() {
    const { data } = await supabase
      .from("contact_enquiries")
      .select("*")
      .order("created_at", { ascending: false });
    setRows(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    intervalRef.current = setInterval(load, 30_000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  async function updateStatus(id: string, status: string) {
    await supabase.from("contact_enquiries").update({ status }).eq("id", id);
    setRows((prev) => prev.map((r) => r.id === id ? { ...r, status } : r));
    if (selected?.id === id) setSelected((s) => s ? { ...s, status } : s);
  }

  async function saveNotes() {
    if (!selected) return;
    setSaving(true);
    await supabase.from("contact_enquiries").update({ staff_notes: notes }).eq("id", selected.id);
    setRows((prev) => prev.map((r) => r.id === selected.id ? { ...r, staff_notes: notes } : r));
    setSelected((s) => s ? { ...s, staff_notes: notes } : s);
    setSaving(false);
  }

  function openDetail(row: ContactEnquiry) {
    setSelected(row);
    setNotes(row.staff_notes ?? "");
    // Auto-mark as Viewed if still New
    if (row.status === "New") updateStatus(row.id, "Viewed");
  }

  const filtered = rows.filter((r) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      r.full_name.toLowerCase().includes(q) ||
      r.mobile.includes(q) ||
      (r.email ?? "").toLowerCase().includes(q) ||
      (r.inquiry_type ?? "").toLowerCase().includes(q)
    );
  });

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-slate-300 border-t-[#061A33]" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-semibold text-slate-950">Enquiries</h1>
        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-500">
          {rows.length}
        </span>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
        <input
          className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400"
          placeholder="Search by name, mobile, or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="flex gap-5">
        {/* List */}
        <div className="card-premium min-w-0 flex-1 overflow-hidden">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-3 px-5 py-12 text-center">
              <ClipboardList className="size-8 text-slate-200" />
              <p className="text-sm text-slate-400">No enquiries yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {filtered.map((r) => {
                const date = new Date(r.created_at).toLocaleDateString("en-IN", {
                  day: "numeric", month: "short", year: "numeric",
                });
                const initial = r.full_name?.[0]?.toUpperCase() ?? "?";
                const isSelected = selected?.id === r.id;
                return (
                  <button
                    key={r.id}
                    onClick={() => openDetail(r)}
                    className={`w-full px-5 py-3.5 text-left transition-colors hover:bg-slate-50 ${isSelected ? "border-l-2 border-[#061A33] bg-[#061A33]/5" : ""}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-600">
                        {initial}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate font-medium text-slate-950">{r.full_name}</p>
                          <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_CHIP[r.status] ?? STATUS_CHIP.Viewed}`}>
                            <span className="mr-1 inline-block size-1.5 rounded-full bg-current" />
                            {r.status}
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs text-slate-500">{r.mobile} · {r.inquiry_type ?? "—"} · {date}</p>
                        {r.message ? (
                          <p className="mt-1 line-clamp-2 text-xs text-slate-400">{r.message}</p>
                        ) : null}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Detail panel */}
        {selected ? (
          <div className="card-premium hidden w-80 shrink-0 overflow-hidden lg:block xl:w-96">
            {/* Sticky panel header */}
            <div className="flex items-start justify-between border-b border-slate-100 px-5 py-4">
              <div className="min-w-0">
                <p className="truncate font-semibold text-slate-950">{selected.full_name}</p>
                <span className={`mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_CHIP[selected.status] ?? STATUS_CHIP.Viewed}`}>
                  <span className="mr-1 inline-block size-1.5 rounded-full bg-current" />
                  {selected.status}
                </span>
              </div>
              <button
                onClick={() => setSelected(null)}
                aria-label="Close enquiry detail"
                className="ml-3 shrink-0 rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </div>
            <div className="space-y-4 px-5 py-4 text-sm">
              {/* Contact buttons */}
              <div className="flex gap-2">
                <a
                  href={`tel:${selected.mobile}`}
                  className="btn-secondary flex-1 justify-center gap-1.5 text-xs"
                >
                  <Phone className="size-3.5" /> Call
                </a>
                <a
                  href={`https://wa.me/91${selected.mobile.replace(/\D/g, "").slice(-10)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-[8px] bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
                >
                  <MessageSquare className="size-3.5" /> WhatsApp
                </a>
              </div>

              {/* Info */}
              <dl className="space-y-2 text-xs">
                <div className="grid grid-cols-[6rem_1fr] gap-1">
                  <dt className="font-semibold text-slate-500">Mobile</dt>
                  <dd className="text-slate-700">{selected.mobile}</dd>
                </div>
                {selected.email ? (
                  <div className="grid grid-cols-[6rem_1fr] gap-1">
                    <dt className="font-semibold text-slate-500">Email</dt>
                    <dd className="break-all text-slate-700">{selected.email}</dd>
                  </div>
                ) : null}
                <div className="grid grid-cols-[6rem_1fr] gap-1">
                  <dt className="font-semibold text-slate-500">Received</dt>
                  <dd className="text-slate-700">{new Date(selected.created_at).toLocaleString("en-IN")}</dd>
                </div>
                {selected.message ? (
                  <div>
                    <dt className="mb-0.5 font-semibold text-slate-500">Message</dt>
                    <dd className="whitespace-pre-wrap text-slate-700">{selected.message}</dd>
                  </div>
                ) : null}
              </dl>

              {/* Status */}
              <div>
                <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Update status</p>
                <div className="flex flex-wrap gap-1.5">
                  {STATUSES.map((s) => (
                    <button
                      key={s}
                      onClick={() => updateStatus(selected.id, s)}
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold transition-opacity ${STATUS_CHIP[s]} ${selected.status === s ? "ring-2 ring-offset-1 ring-teal-400" : "opacity-60 hover:opacity-100"}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Staff notes */}
              <div>
                <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Staff notes</p>
                <textarea
                  className="w-full rounded-lg border border-slate-200 p-2 text-xs outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400"
                  rows={4}
                  placeholder="Internal notes…"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
                <button
                  onClick={saveNotes}
                  disabled={saving}
                  className="btn-primary mt-1.5 w-full text-xs disabled:opacity-60"
                >
                  {saving ? "Saving…" : "Save notes"}
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
