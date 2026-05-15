"use client";

import { useEffect, useRef, useState } from "react";
import { MessageSquare, Phone, Search } from "lucide-react";
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-950">Enquiries</h1>
        <span className="text-sm text-slate-400">{rows.length} total</span>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
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
            <p className="px-5 py-10 text-center text-sm text-slate-400">No enquiries found.</p>
          ) : (
            <div className="divide-y divide-slate-50">
              {filtered.map((r) => {
                const date = new Date(r.created_at).toLocaleDateString("en-IN", {
                  day: "numeric", month: "short", year: "numeric",
                });
                return (
                  <button
                    key={r.id}
                    onClick={() => openDetail(r)}
                    className={`w-full px-5 py-3.5 text-left transition-colors hover:bg-slate-50 ${selected?.id === r.id ? "bg-teal-50" : ""}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-medium text-slate-950">{r.full_name}</p>
                        <p className="mt-0.5 text-xs text-slate-500">{r.mobile} · {r.inquiry_type ?? "—"} · {date}</p>
                      </div>
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_CHIP[r.status] ?? STATUS_CHIP.Viewed}`}>
                        {r.status}
                      </span>
                    </div>
                    {r.message ? (
                      <p className="mt-1 line-clamp-2 text-xs text-slate-400">{r.message}</p>
                    ) : null}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Detail panel */}
        {selected ? (
          <div className="card-premium hidden w-80 shrink-0 overflow-hidden lg:block">
            <div className="border-b border-slate-100 px-5 py-4">
              <p className="font-semibold text-slate-950">{selected.full_name}</p>
              <p className="text-xs text-slate-500">{selected.inquiry_type ?? "General enquiry"}</p>
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
                  className="btn-primary flex-1 justify-center gap-1.5 text-xs"
                >
                  <MessageSquare className="size-3.5" /> WhatsApp
                </a>
              </div>

              {/* Info */}
              <div className="space-y-1.5 text-xs text-slate-600">
                <p><span className="font-medium text-slate-900">Mobile:</span> {selected.mobile}</p>
                {selected.email ? <p><span className="font-medium text-slate-900">Email:</span> {selected.email}</p> : null}
                <p><span className="font-medium text-slate-900">Received:</span> {new Date(selected.created_at).toLocaleString("en-IN")}</p>
                {selected.message ? (
                  <div>
                    <p className="font-medium text-slate-900">Message:</p>
                    <p className="mt-0.5 whitespace-pre-wrap">{selected.message}</p>
                  </div>
                ) : null}
              </div>

              {/* Status */}
              <div>
                <p className="mb-1.5 text-xs font-medium text-slate-700">Status</p>
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
                <p className="mb-1.5 text-xs font-medium text-slate-700">Staff notes</p>
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
