"use client";

import { useEffect, useRef, useState } from "react";
import { AlertTriangle, CheckCircle, Copy, ExternalLink, FileText, Mail, MessageSquare, Phone, Search } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import type { HomeCollectionRequest } from "@/lib/supabase/types";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const STATUSES = [
  "New", "Viewed", "Called", "Confirmed",
  "Sample Collected", "Completed", "Cancelled", "No Response",
] as const;

const STATUS_CHIP: Record<string, string> = {
  New:               "bg-sky-100 text-sky-700",
  Viewed:            "bg-slate-100 text-slate-600",
  Called:            "bg-amber-100 text-amber-700",
  Confirmed:         "bg-teal-100 text-teal-700",
  "Sample Collected":"bg-violet-100 text-violet-700",
  Completed:         "bg-emerald-100 text-emerald-700",
  Cancelled:         "bg-rose-100 text-rose-700",
  "No Response":     "bg-orange-100 text-orange-700",
};

export default function HomeCollectionsPage() {
  const [rows, setRows] = useState<HomeCollectionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<HomeCollectionRequest | null>(null);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loadingUrl, setLoadingUrl] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Appointment confirmation fields
  const [confirmedDate, setConfirmedDate] = useState("");
  const [confirmedTimeSlot, setConfirmedTimeSlot] = useState("");
  const [confirmedAddress, setConfirmedAddress] = useState("");
  const [confirmedTestPackage, setConfirmedTestPackage] = useState("");
  const [fastingInstructions, setFastingInstructions] = useState("");
  const [patientInstructions, setPatientInstructions] = useState("");
  const [savingConfirmation, setSavingConfirmation] = useState(false);
  const [emailApptState, setEmailApptState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [waCopied, setWaCopied] = useState(false);

  async function load() {
    const { data } = await supabase
      .from("home_collection_requests")
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
    await supabase.from("home_collection_requests").update({ status }).eq("id", id);
    setRows((prev) => prev.map((r) => r.id === id ? { ...r, status } : r));
    if (selected?.id === id) setSelected((s) => s ? { ...s, status } : s);
  }

  async function saveNotes() {
    if (!selected) return;
    setSaving(true);
    await supabase.from("home_collection_requests").update({ staff_notes: notes }).eq("id", selected.id);
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
        `${SUPABASE_URL}/storage/v1/object/sign/home-collection-prescriptions/${filePath}`,
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

  function openDetail(row: HomeCollectionRequest) {
    setSelected(row);
    setNotes(row.staff_notes ?? "");
    setSignedUrl(null);
    setConfirmedDate(row.confirmed_date ?? "");
    setConfirmedTimeSlot(row.confirmed_time_slot ?? "");
    setConfirmedAddress(row.confirmed_address ?? "");
    setConfirmedTestPackage(row.confirmed_test_package ?? "");
    setFastingInstructions(row.fasting_instructions ?? "");
    setPatientInstructions(row.patient_instructions ?? "");
    setEmailApptState("idle");
    setWaCopied(false);
    if (row.status === "New") updateStatus(row.id, "Viewed");
  }

  async function saveConfirmation() {
    if (!selected) return;
    setSavingConfirmation(true);
    const updates = {
      confirmed_date: confirmedDate || null,
      confirmed_time_slot: confirmedTimeSlot || null,
      confirmed_address: confirmedAddress || null,
      confirmed_test_package: confirmedTestPackage || null,
      fasting_instructions: fastingInstructions || null,
      patient_instructions: patientInstructions || null,
    };
    await supabase.from("home_collection_requests").update(updates).eq("id", selected.id);
    setRows((prev) => prev.map((r) => r.id === selected.id ? { ...r, ...updates } : r));
    setSelected((s) => s ? { ...s, ...updates } : s);
    setSavingConfirmation(false);
  }

  function buildApptWhatsApp() {
    if (!selected) return "";
    const lines: string[] = [
      `Hello ${selected.full_name}, your home sample collection appointment at Nova Diagnostics has been confirmed.`,
      "",
    ];
    if (confirmedDate) lines.push(`📅 Date: ${new Date(confirmedDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}`);
    if (confirmedTimeSlot) lines.push(`🕐 Time: ${confirmedTimeSlot}`);
    if (confirmedAddress) lines.push(`📍 Address: ${confirmedAddress}`);
    if (confirmedTestPackage) lines.push(`🔬 Tests: ${confirmedTestPackage}`);
    if (fastingInstructions) lines.push(`⚠️ Fasting: ${fastingInstructions}`);
    if (patientInstructions) lines.push(`ℹ️ Note: ${patientInstructions}`);
    lines.push("", "Please be available 10 minutes before your scheduled time.", "", "Nova Diagnostics", "+91 8433706778");
    return lines.join("\n");
  }

  async function copyWaAppt() {
    await navigator.clipboard.writeText(buildApptWhatsApp());
    setWaCopied(true);
    setTimeout(() => setWaCopied(false), 3000);
  }

  async function sendApptEmail() {
    if (!selected?.email) return;
    setEmailApptState("sending");
    // Save confirmation fields before sending so the edge function reads fresh data
    const updates = {
      confirmed_date: confirmedDate || null,
      confirmed_time_slot: confirmedTimeSlot || null,
      confirmed_address: confirmedAddress || null,
      confirmed_test_package: confirmedTestPackage || null,
      fasting_instructions: fastingInstructions || null,
      patient_instructions: patientInstructions || null,
    };
    await supabase.from("home_collection_requests").update(updates).eq("id", selected.id);
    setRows((prev) => prev.map((r) => r.id === selected.id ? { ...r, ...updates } : r));
    setSelected((s) => s ? { ...s, ...updates } : s);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${SUPABASE_URL}/functions/v1/send-home-collection-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ requestId: selected.id }),
      });
      const data = await res.json();
      if (data.success) {
        setEmailApptState("sent");
        setSelected((s) => s ? { ...s, appointment_email_sent_at: new Date().toISOString() } : s);
        setTimeout(() => setEmailApptState("idle"), 6000);
      } else {
        setEmailApptState("error");
        setTimeout(() => setEmailApptState("idle"), 6000);
      }
    } catch {
      setEmailApptState("error");
      setTimeout(() => setEmailApptState("idle"), 6000);
    }
  }

  const filtered = rows.filter((r) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      r.full_name.toLowerCase().includes(q) ||
      r.mobile.includes(q) ||
      r.area_location.toLowerCase().includes(q) ||
      (r.test_package_required ?? "").toLowerCase().includes(q)
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
        <h1 className="text-2xl font-semibold text-slate-950">Home Collections</h1>
        <span className="text-sm text-slate-400">{rows.length} total</span>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
        <input
          className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400"
          placeholder="Search by name, mobile, or area…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="flex gap-5">
        {/* List */}
        <div className="card-premium min-w-0 flex-1 overflow-hidden">
          {filtered.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-slate-400">No home collection requests found.</p>
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
                          {r.mobile} · {r.area_location} · {date}
                        </p>
                        {r.test_package_required ? (
                          <p className="mt-0.5 text-xs text-slate-400 truncate">{r.test_package_required}</p>
                        ) : null}
                      </div>
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_CHIP[r.status] ?? STATUS_CHIP.Viewed}`}>
                        {r.status}
                      </span>
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
              <p className="text-xs text-slate-500">{selected.area_location}</p>
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
                <p><span className="font-medium text-slate-900">Area:</span> {selected.area_location}</p>
                {selected.preferred_date ? (
                  <p><span className="font-medium text-slate-900">Date:</span> {new Date(selected.preferred_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                ) : null}
                {selected.preferred_time_slot ? (
                  <p><span className="font-medium text-slate-900">Time:</span> {selected.preferred_time_slot}</p>
                ) : null}
                {selected.test_package_required ? (
                  <p><span className="font-medium text-slate-900">Tests:</span> {selected.test_package_required}</p>
                ) : null}
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

              {/* Appointment Confirmation */}
              <div className="space-y-2.5 rounded-lg border border-teal-100 bg-teal-50/50 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">Appointment Confirmation</p>

                <div className="grid grid-cols-2 gap-2">
                  <div className="col-span-1">
                    <label className="mb-0.5 block text-xs text-slate-500">Date</label>
                    <input
                      type="date"
                      className="w-full rounded border border-slate-200 bg-white px-2 py-1 text-xs outline-none focus:border-teal-400"
                      value={confirmedDate}
                      onChange={(e) => setConfirmedDate(e.target.value)}
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="mb-0.5 block text-xs text-slate-500">Time Slot</label>
                    <input
                      type="text"
                      className="w-full rounded border border-slate-200 bg-white px-2 py-1 text-xs outline-none focus:border-teal-400"
                      placeholder="e.g. 7:00–8:00 AM"
                      value={confirmedTimeSlot}
                      onChange={(e) => setConfirmedTimeSlot(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-0.5 block text-xs text-slate-500">Collection Address</label>
                  <textarea
                    className="w-full rounded border border-slate-200 bg-white px-2 py-1 text-xs outline-none focus:border-teal-400"
                    rows={2}
                    placeholder="Full address for phlebotomist…"
                    value={confirmedAddress}
                    onChange={(e) => setConfirmedAddress(e.target.value)}
                  />
                </div>

                <div>
                  <label className="mb-0.5 block text-xs text-slate-500">Tests / Package</label>
                  <input
                    type="text"
                    className="w-full rounded border border-slate-200 bg-white px-2 py-1 text-xs outline-none focus:border-teal-400"
                    placeholder="e.g. CBC, LFT, Blood Sugar"
                    value={confirmedTestPackage}
                    onChange={(e) => setConfirmedTestPackage(e.target.value)}
                  />
                </div>

                <div>
                  <label className="mb-0.5 block text-xs text-slate-500">Fasting Instructions</label>
                  <input
                    type="text"
                    className="w-full rounded border border-slate-200 bg-white px-2 py-1 text-xs outline-none focus:border-teal-400"
                    placeholder="e.g. 8 hours fasting required"
                    value={fastingInstructions}
                    onChange={(e) => setFastingInstructions(e.target.value)}
                  />
                </div>

                <div>
                  <label className="mb-0.5 block text-xs text-slate-500">Additional Instructions</label>
                  <textarea
                    className="w-full rounded border border-slate-200 bg-white px-2 py-1 text-xs outline-none focus:border-teal-400"
                    rows={2}
                    placeholder="Any other notes for patient…"
                    value={patientInstructions}
                    onChange={(e) => setPatientInstructions(e.target.value)}
                  />
                </div>

                <button
                  onClick={saveConfirmation}
                  disabled={savingConfirmation}
                  className="w-full rounded bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-teal-700 disabled:opacity-60"
                >
                  {savingConfirmation ? "Saving…" : "Save Confirmation Details"}
                </button>

                {/* Copy WhatsApp appointment message */}
                <button
                  onClick={copyWaAppt}
                  className="flex w-full items-center justify-center gap-1.5 rounded border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
                >
                  {waCopied ? <CheckCircle className="size-3.5" /> : <Copy className="size-3.5" />}
                  {waCopied ? "Copied!" : "Copy WhatsApp Appointment Message"}
                </button>

                {/* Send email */}
                {selected.email ? (
                  <div>
                    <button
                      onClick={sendApptEmail}
                      disabled={emailApptState === "sending" || emailApptState === "sent"}
                      className={`flex w-full items-center justify-center gap-1.5 rounded border px-3 py-1.5 text-xs font-semibold disabled:opacity-60 ${
                        emailApptState === "sent"
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : emailApptState === "error"
                          ? "border-rose-200 bg-rose-50 text-rose-600"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {emailApptState === "sending" ? (
                        <><span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" /> Sending…</>
                      ) : emailApptState === "sent" ? (
                        <><CheckCircle className="size-3.5" /> Email Sent!</>
                      ) : emailApptState === "error" ? (
                        <><AlertTriangle className="size-3.5" /> Failed — Try Again</>
                      ) : (
                        <><Mail className="size-3.5" /> Send Appointment Details via Email</>
                      )}
                    </button>
                    {selected.appointment_email_sent_at && (
                      <p className="mt-1 text-center text-xs text-slate-400">
                        Last sent {new Date(selected.appointment_email_sent_at).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-center text-xs text-slate-400">No email on file — email not available.</p>
                )}
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
