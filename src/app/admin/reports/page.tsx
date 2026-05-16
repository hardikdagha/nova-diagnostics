"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import type { Report } from "@/lib/supabase/types";
import {
  AlertTriangle, ArrowLeft, CheckCircle, Copy, Download,
  ExternalLink, Eye, FileText, Link2, Link2Off, Mail, MessageSquare, Plus, RefreshCw,
  Search, Trash2, XCircle,
} from "lucide-react";
import Link from "next/link";
import { inputClass } from "@/components/forms/formStyles";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const STATUS_CHIP: Record<string, string> = {
  ready:    "bg-emerald-100 text-emerald-700",
  draft:    "bg-amber-100 text-amber-700",
  revoked:  "bg-rose-100 text-rose-700",
  archived: "bg-slate-100 text-slate-600",
};

async function generateNewToken(reportId: string) {
  const buf = new Uint8Array(40);
  crypto.getRandomValues(buf);
  const raw = btoa(String.fromCharCode(...buf)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
  const hashBuf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(raw));
  const hash = Array.from(new Uint8Array(hashBuf)).map(b => b.toString(16).padStart(2, "0")).join("");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("reports")
    .update({ token_hash: hash, token: raw, revoked_at: null, status: "ready" })
    .eq("id", reportId);

  if (error) throw error;
  return raw;
}

function AdminReportsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const selectedId = searchParams.get("id");

  const [reports, setReports] = useState<Report[]>([]);
  const [selected, setSelected] = useState<Report | null>(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [emailState, setEmailState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [dlPhase, setDlPhase] = useState<"idle" | "loading" | "ready">("idle");
  const [dlUrl, setDlUrl] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  // newToken holds the raw token after a regeneration action in this session.
  const [newToken, setNewToken] = useState<string | null>(null);
  const activeToken = newToken ?? selected?.token ?? null;
  const [waExpanded, setWaExpanded] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("reports")
      .select("*")
      .order("created_at", { ascending: false });
    setReports(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    void Promise.resolve().then(() => load());
  }, [load]);

  useEffect(() => {
    void (async () => {
      await Promise.resolve();
      if (!selectedId) { setSelected(null); return; }
      const r = reports.find((r) => r.id === selectedId) ?? null;
      setSelected(r);
      // Reset per-report UI state when switching reports
      setDlPhase("idle");
      setDlUrl(null);
      setNewToken(null);
      setWaExpanded(true);
    })();
  }, [selectedId, reports]);

  const filtered = reports.filter((r) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      r.patient_name.toLowerCase().includes(q) ||
      r.report_number.toLowerCase().includes(q) ||
      r.test_name.toLowerCase().includes(q) ||
      r.patient_mobile.includes(q)
    );
  });

  const buildMessage = (r: Report, token: string) => {
    const url = `https://novadiagnosticslab.com/r/?t=${token}`;
    return `Hello ${r.patient_name}, your report from Nova Diagnostics is ready.\n\nReport No: ${r.report_number}\n\nDownload report:\n${url}\n\nNova Diagnostics\n+91 8433706778`;
  };

  const normalizeWhatsApp = (mobile: string) => {
    const digits = mobile.replace(/\D/g, "");
    const last10 = digits.slice(-10);
    return last10.length === 10 ? `91${last10}` : null;
  };

  const copyMessage = async () => {
    if (!selected || !activeToken) return;
    await navigator.clipboard.writeText(buildMessage(selected, activeToken));
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const revokeReport = async () => {
    if (!selected || !confirm("Revoke this report link? The patient will no longer be able to download it.")) return;
    setActionLoading(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from("reports").update({ status: "revoked", revoked_at: new Date().toISOString() }).eq("id", selected.id);
    await load();
    setActionLoading(false);
  };

  const handleSendEmail = async () => {
    if (!selected || !selected.patient_email || !activeToken) return;
    setEmailState("sending");
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${SUPABASE_URL}/functions/v1/send-report-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          patientEmail: selected.patient_email,
          patientName: selected.patient_name,
          reportNumber: selected.report_number,
          reportUrl: `https://novadiagnosticslab.com/r/?t=${activeToken}`,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setEmailState("sent");
        setTimeout(() => setEmailState("idle"), 5000);
      } else {
        setEmailState("error");
        setTimeout(() => setEmailState("idle"), 5000);
      }
    } catch {
      setEmailState("error");
      setTimeout(() => setEmailState("idle"), 5000);
    }
  };

  const regenerateLink = async () => {
    if (!selected) return;
    setActionLoading(true);
    try {
      const token = await generateNewToken(selected.id);
      setNewToken(token);
      await load();
    } catch {
      alert("Failed to regenerate link. Please try again.");
    }
    setActionLoading(false);
  };

  const handleStaffDownload = async () => {
    if (!selected) return;
    setDlPhase("loading");
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${SUPABASE_URL}/functions/v1/fallback-report-lookup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          reportNumber: selected.report_number,
          mobile: selected.patient_mobile,
        }),
      });
      const json = await res.json();
      if (json.signedUrl) {
        setDlUrl(json.signedUrl);
        setDlPhase("ready");
      } else {
        setDlPhase("idle");
      }
    } catch {
      setDlPhase("idle");
    }
  };

  const deleteReport = async (r: Report, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Delete report ${r.report_number} for ${r.patient_name}?\n\nThis cannot be undone.`)) return;
    setDeletingId(r.id);
    try {
      // Best-effort: remove file from storage
      if (r.file_path) {
        await supabase.storage.from("reports").remove([r.file_path]);
      }
      // Delete report row (DB cascade handles related rows)
      await supabase.from("reports").delete().eq("id", r.id);
      // If viewing this report's detail, go back to list
      if (selectedId === r.id) router.push("/admin/reports");
      await load();
    } finally {
      setDeletingId(null);
    }
  };

  // Detail panel
  if (selected) {
    return (
      <div className="mx-auto max-w-2xl space-y-5">
        <button onClick={() => router.push("/admin/reports")} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800">
          <ArrowLeft className="size-4" /> Back to reports
        </button>

        {/* Report metadata */}
        <div className="card-premium p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Report</p>
              <h1 className="mt-0.5 font-mono text-xl font-semibold text-slate-950">{selected.report_number}</h1>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_CHIP[selected.status]}`}>
              <span className="mr-1 inline-block size-1.5 rounded-full bg-current" />
              {selected.status}
            </span>
          </div>

          <dl className="mt-5 grid gap-y-3 gap-x-6 text-sm sm:grid-cols-2">
            {[
              ["Patient", selected.patient_name],
              ["Mobile", selected.patient_mobile],
              ["Email", selected.patient_email ?? "—"],
              ["Test", selected.test_name],
              ["Report Date", selected.report_date],
              ["Downloads", String(selected.download_count)],
            ].map(([k, v]) => (
              <div key={k} className="space-y-0.5">
                <dt className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{k}</dt>
                <dd className="font-medium text-slate-800">{v}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Link + WhatsApp message */}
        {activeToken ? (
          <div className="card-premium overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-5 py-3">
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <Link2 className="size-3.5" />
                {newToken ? "New link generated" : "Report link"}
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setWaExpanded(!waExpanded)}
                  className="text-xs font-medium text-slate-400 hover:text-slate-700"
                >
                  {waExpanded ? "Hide message" : "Show message"}
                </button>
                <a
                  href={`https://novadiagnosticslab.com/r/?t=${activeToken}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs font-medium text-teal-600 hover:text-teal-800"
                >
                  <ExternalLink className="size-3.5" /> Test link
                </a>
              </div>
            </div>
            {/* Shareable URL */}
            <div className="border-b border-slate-50 px-5 py-3">
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Shareable URL</p>
              <p className="break-all font-mono text-xs text-slate-700">
                {`https://novadiagnosticslab.com/r/?t=${activeToken}`}
              </p>
            </div>
            {waExpanded && (
              <pre className="whitespace-pre-wrap break-all border-b border-slate-50 px-5 py-4 text-sm leading-7 text-slate-700">
                {buildMessage(selected, activeToken)}
              </pre>
            )}
            <div className="space-y-3 border-t border-slate-100 px-5 py-4">
              {/* WhatsApp copy */}
              <button onClick={copyMessage} className="btn-primary w-full gap-2">
                {copied ? <CheckCircle className="size-4" /> : <Copy className="size-4" />}
                {copied ? "Copied!" : "Copy WhatsApp Message"}
              </button>

              {/* Send WhatsApp to Patient */}
              {(() => {
                const wa = normalizeWhatsApp(selected.patient_mobile);
                const msg = buildMessage(selected, activeToken!);
                return wa ? (
                  <a
                    href={`https://wa.me/${wa}?text=${encodeURIComponent(msg)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center gap-2 rounded-[8px] border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700 hover:bg-emerald-100"
                  >
                    <MessageSquare className="size-4" /> Send WhatsApp to Patient
                  </a>
                ) : (
                  <p className="text-center text-xs text-slate-400">
                    Mobile number invalid — WhatsApp not available.
                  </p>
                );
              })()}

              {/* Send Email */}
              {selected.patient_email ? (
                <div>
                  <button
                    onClick={handleSendEmail}
                    disabled={emailState === "sending" || emailState === "sent"}
                    className={`flex w-full items-center justify-center gap-2 rounded-[8px] border px-4 py-2.5 text-sm font-semibold transition-colors disabled:opacity-60 ${
                      emailState === "sent"
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : emailState === "error"
                        ? "border-rose-200 bg-rose-50 text-rose-600"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {emailState === "sending" ? (
                      <><span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" /> Sending…</>
                    ) : emailState === "sent" ? (
                      <><CheckCircle className="size-4" /> Email Sent!</>
                    ) : emailState === "error" ? (
                      <><AlertTriangle className="size-4" /> Failed — Try Again</>
                    ) : (
                      <><Mail className="size-4" /> Send Email to Patient</>
                    )}
                  </button>
                  <p className="mt-1.5 text-center text-xs text-slate-400">
                    Sends to <span className="font-medium text-slate-600">{selected.patient_email}</span> from contact@novadiagnosticslab.com
                  </p>
                </div>
              ) : (
                <p className="text-center text-xs text-slate-400">
                  No email on file — email delivery not available for this report.
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="card-premium p-5">
            <div className="flex items-start gap-3">
              {selected.status === "ready" ? (
                <>
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-amber-50">
                    <Link2 className="size-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Link active — URL not on file</p>
                    <p className="mt-0.5 text-xs leading-5 text-slate-500">
                      This report was uploaded before link storage was enabled. Click{" "}
                      <strong>Regenerate link</strong> to issue a new link.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-rose-50">
                    <Link2Off className="size-4 text-rose-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Link not active</p>
                    <p className="mt-0.5 text-xs leading-5 text-slate-500">
                      Status is <strong>{selected.status}</strong>. Regenerate to issue a new active link.
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          {/* Staff PDF download */}
          {dlPhase === "ready" && dlUrl ? (
            <a
              href={dlUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary flex items-center gap-2 text-sm"
            >
              <Download className="size-4" /> Open PDF
            </a>
          ) : (
            <button
              onClick={handleStaffDownload}
              disabled={dlPhase === "loading"}
              className="btn-primary flex items-center gap-2 text-sm disabled:opacity-60"
            >
              {dlPhase === "loading" ? (
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              ) : (
                <Download className="size-4" />
              )}
              {dlPhase === "loading" ? "Preparing…" : "Download PDF"}
            </button>
          )}

          <button onClick={regenerateLink} disabled={actionLoading} className="btn-secondary flex items-center gap-2 text-sm disabled:opacity-50">
            <RefreshCw className={`size-4 ${actionLoading ? "animate-spin" : ""}`} />
            {activeToken ? "Regenerate link" : "Generate link"}
          </button>

          {selected.status !== "revoked" && (
            <button onClick={revokeReport} disabled={actionLoading} className="flex items-center gap-2 rounded-[8px] border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-100 disabled:opacity-50">
              <XCircle className="size-4" /> Revoke link
            </button>
          )}
        </div>
      </div>
    );
  }

  // List view
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold text-slate-950">Reports</h1>
          {!loading && (
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-500">
              {filtered.length}
            </span>
          )}
        </div>
        <Link href="/admin/reports/upload" className="btn-primary text-sm">
          <Plus className="size-4" /> Upload
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
        <input
          className={`${inputClass} pl-9`}
          placeholder="Search by name, mobile, report number, test…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex min-h-48 items-center justify-center">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-slate-300 border-t-[#061A33]" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card-premium flex flex-col items-center gap-3 p-12 text-center">
          <FileText className="size-8 text-slate-200" />
          <p className="text-sm text-slate-400">
            {query ? "No reports match your search." : "No reports yet."}
          </p>
        </div>
      ) : (
        <div className="card-premium divide-y divide-slate-50 overflow-hidden">
          {filtered.map((r) => (
            <div key={r.id} className="flex w-full items-center gap-4 px-5 py-4 hover:bg-slate-50">
              {/* File icon avatar */}
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                <FileText className="size-4 text-slate-400" />
              </div>

              {/* Clickable report info */}
              <button
                onClick={() => router.push(`/admin/reports?id=${r.id}`)}
                className="min-w-0 flex-1 text-left"
              >
                <div className="flex items-center gap-2">
                  <p className="truncate font-medium text-slate-950">{r.patient_name}</p>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_CHIP[r.status]}`}>
                    <span className="mr-1 inline-block size-1.5 rounded-full bg-current" />
                    {r.status}
                  </span>
                </div>
                <p className="mt-0.5 font-mono text-xs text-slate-400">
                  {r.report_number} · {r.test_name} · {r.patient_mobile}
                </p>
              </button>

              {/* Row actions */}
              <div className="ml-2 flex shrink-0 items-center gap-3 text-xs text-slate-400">
                <span className="hidden items-center gap-1 sm:flex">
                  <Download className="size-3" />{r.download_count}
                </span>
                <button
                  onClick={() => router.push(`/admin/reports?id=${r.id}`)}
                  className="rounded p-1 hover:bg-slate-100"
                  title="View report"
                >
                  <Eye className="size-4 text-slate-300 hover:text-slate-500" />
                </button>
                <button
                  onClick={(e) => deleteReport(r, e)}
                  disabled={deletingId === r.id}
                  className="rounded p-1 text-slate-300 hover:bg-rose-50 hover:text-rose-500 disabled:opacity-40"
                  title="Delete report"
                >
                  {deletingId === r.id
                    ? <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-rose-400" />
                    : <Trash2 className="size-4" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminReportsPage() {
  return (
    <Suspense fallback={<div className="flex min-h-48 items-center justify-center"><div className="h-7 w-7 animate-spin rounded-full border-2 border-slate-300 border-t-[#061A33]" /></div>}>
      <AdminReportsContent />
    </Suspense>
  );
}
