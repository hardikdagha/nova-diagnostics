"use client";

import { useEffect, useRef, useState } from "react";
import { ExternalLink, FileText, MessageSquare, Phone, Search } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import type { PrescriptionRequest } from "@/lib/supabase/types";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const STATUSES = ["New", "Viewed", "Contacted", "Booked", "Completed", "Cancelled"] as const;

const STATUS_CHIP: Record<string, string> = {
  New:       "bg-sky-100 text-sky-700",
  Viewed:    "bg-slate-100 text-slate-600",
  Contacted: "bg-amber-100 text-amber-700",
  Booked:    "bg-teal-100 text-teal-700",
  Completed: "bg-emerald-100 text-emerald-700",
  Cancelled: "bg-rose-100 text-rose-700",
};

export default function PrescriptionRequestsPage() {
  const [rows, setRows] = useState<PrescriptionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<PrescriptionRequest | null>(null);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loadingUrl, setLoadingUrl] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  async function load() {
    const { data } = await supabase
      .from("prescription_requests")
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
    await supabase.from("prescription_requests").update({ status }).eq("id", id);
    setRows((prev) => prev.map((r) => r.id === id ? { ...r, status } : r));
    if (selected?.id === id) setSelected((s) => s ? { ...s, status } : s);
  }

  async function saveNotes() {
    if (!selected) return;
    setSaving(true);
    await supabase.from("prescription_requests").update({ staff_notes: notes }).eq("id", selected.id);
    setRows((prev) => prev.map((r) => r.id === selected.id ? { ...r, staff_notes: notes } : r));
    setSelected((s) => s ? { ...s, staff_notes: notes } : s);
    setSaving(false);
  }

  async function getSignedUrl(filePath: string) {
    setLoadingUrl(true);
    setSignedUrl(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(
        `${SUPABASE_URL}/storage/v1/object/sign/prescriptions/${filePath}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({ expiresIn: 300 }),
        }
      );
      const json = await res.json();
      if (json.signedURL) {
        setSignedUrl(`${SUPABASE_URL}/storage/v1${json.signedURL}`);
      }
    } catch {
      /* silent */
    } finally {
      setLoadingUrl(false);
    }
  }

  function openDetail(row: PrescriptionRequest) {
    setSelected(row);
    setNotes(row.staff_notes ?? "");
    setSignedUrl(null);
    if (row.status === "New") updateStatus(row.id, "Viewed");
  }

  const filtered = rows.filter((r) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      r.full_name.toLowerCase().includes(q) ||
      r.mobile.includes(q) ||
      (r.email ?? "").toLowerCase().includes(q) ||
      (r.area_location ?? "").toLowerCase().includes(q)
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
        <h1 className="text-2xl font-semibold text-slate-950">Prescription Requests</h1>
        <span className="text-sm text-slate-400">{rows.length} total</span>
      </div>

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
            <p className="px-5 py-10 text-center text-sm text-slate-400">No prescription requests found.</p>
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
                        <p className="mt-0.5 text-xs text-slate-500">
                          {r.mobile}
                          {r.area_location ? ` · ${r.area_location}` : ""}
                          {` · ${date}`}
                        </p>
                        {r.preferred_service ? (
                          <p className="mt-0.5 text-xs text-slate-400">Via: {r.preferred_service}</p>
                        ) : null}
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_CHIP[r.status] ?? STATUS_CHIP.Viewed}`}>
                          {r.status}
                        </span>
                        {r.prescription_file_path ? (
                          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-500">
                            📎 file
                          </span>
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
          <div className="card-premium hidden w-80 shrink-0 overflow-hidden lg:block">
            <div className="border-b border-slate-100 px-5 py-4">
              <p className="font-semibold text-slate-950">{selected.full_name}</p>
              <p className="text-xs text-slate-500">
                {selected.preferred_service ? `Prefers: ${selected.preferred_service}` : "Prescription request"}
              </p>
            </div>
            <div className="space-y-4 px-5 py-4 text-sm">
              {/* Contact buttons */}
              <div className="flex gap-2">
                <a href={`tel:${selected.mobile}`} className="btn-secondary flex-1 justify-center gap-1.5 text-xs">
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
                {selected.area_location ? <p><span className="font-medium text-slate-900">Area:</span> {selected.area_location}</p> : null}
                {selected.preferred_service ? <p><span className="font-medium text-slate-900">Contact via:</span> {selected.preferred_service}</p> : null}
                {selected.notes ? (
                  <div>
                    <p className="font-medium text-slate-900">Notes:</p>
                    <p className="mt-0.5 whitespace-pre-wrap">{selected.notes}</p>
                  </div>
                ) : null}
                <p><span className="font-medium text-slate-900">Received:</span> {new Date(selected.created_at).toLocaleString("en-IN")}</p>
              </div>

              {/* Prescription file */}
              {selected.prescription_file_path ? (
                <div>
                  <p className="mb-1.5 text-xs font-medium text-slate-700">Prescription file</p>
                  {signedUrl ? (
                    <a
                      href={signedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary w-full justify-center gap-1.5 text-xs"
                    >
                      <ExternalLink className="size-3.5" /> Open file
                    </a>
                  ) : (
                    <button
                      onClick={() => getSignedUrl(selected.prescription_file_path!)}
                      disabled={loadingUrl}
                      className="btn-secondary w-full justify-center gap-1.5 text-xs disabled:opacity-60"
                    >
                      <FileText className="size-3.5" />
                      {loadingUrl ? "Loading…" : "View prescription"}
                    </button>
                  )}
                </div>
              ) : null}

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
