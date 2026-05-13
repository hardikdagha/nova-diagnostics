"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import type { Report } from "@/lib/supabase/types";
import {
  AlertTriangle, ArrowLeft, CheckCircle, Copy, Download,
  ExternalLink, Eye, Link2, Link2Off, Plus, RefreshCw, Search, XCircle,
} from "lucide-react";
import Link from "next/link";
import { inputClass } from "@/components/forms/formStyles";

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
    .update({ token_hash: hash, revoked_at: null, status: "ready" })
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
  const [logs, setLogs] = useState<Array<{ action: string; success: boolean; access_method: string | null; created_at: string }>>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [newToken, setNewToken] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("reports")
      .select("*")
      .order("created_at", { ascending: false });
    setReports(data ?? []);
    setLoading(false);
  }, []);

  // Defer load() into a microtask so setState inside it isn't synchronous in the effect body
  useEffect(() => {
    void Promise.resolve().then(() => load());
  }, [load]);

  useEffect(() => {
    void (async () => {
      await Promise.resolve(); // yield before setState
      if (!selectedId) { setSelected(null); return; }
      const r = reports.find((r) => r.id === selectedId) ?? null;
      setSelected(r);
      if (r) {
        const { data } = await supabase
          .from("report_access_logs")
          .select("action, success, access_method, created_at")
          .eq("report_id", r.id)
          .order("created_at", { ascending: false })
          .limit(20);
        setLogs(data ?? []);
      }
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
    const url = `https://novadiagnosticslab.com/r/${token}`;
    return `Hello ${r.patient_name}, your report from Nova Diagnostics is ready.\n\nReport No: ${r.report_number}\n\nDownload report:\n${url}\n\nNova Diagnostics\n+91 8433706778`;
  };

  const copyMessage = async () => {
    if (!selected || !newToken) return;
    await navigator.clipboard.writeText(buildMessage(selected, newToken));
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

  // Detail panel
  if (selected) {
    return (
      <div className="mx-auto max-w-2xl space-y-5">
        <button onClick={() => router.push("/admin/reports")} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800">
          <ArrowLeft className="size-4" /> Back to reports
        </button>

        <div className="card-premium p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Report</p>
              <h1 className="mt-0.5 text-xl font-semibold text-slate-950">{selected.report_number}</h1>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_CHIP[selected.status]}`}>
              {selected.status}
            </span>
          </div>

          <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
            {[
              ["Patient", selected.patient_name],
              ["Mobile", selected.patient_mobile],
              ["Email", selected.patient_email ?? "—"],
              ["Test", selected.test_name],
              ["Report Date", selected.report_date],
              ["Downloads", String(selected.download_count)],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="text-slate-400">{k}</dt>
                <dd className="font-medium text-slate-800">{v}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Link status + WhatsApp message */}
        {newToken ? (
          /* After regeneration — show WhatsApp message and test link */
          <div className="card-premium overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 bg-emerald-50 px-5 py-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-emerald-700">
                <Link2 className="size-3.5" /> New link generated
              </div>
              <a
                href={`https://novadiagnosticslab.com/r/${newToken}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs font-medium text-teal-600 hover:text-teal-800"
              >
                <ExternalLink className="size-3.5" /> Test link
              </a>
            </div>
            <pre className="whitespace-pre-wrap break-all px-5 py-4 text-sm leading-7 text-slate-700">
              {buildMessage(selected, newToken)}
            </pre>
            <div className="border-t border-slate-100 px-5 py-3">
              <button onClick={copyMessage} className="btn-primary w-full gap-2">
                {copied ? <CheckCircle className="size-4" /> : <Copy className="size-4" />}
                {copied ? "Copied!" : "Copy WhatsApp Message"}
              </button>
              <p className="mt-2 text-center text-xs text-slate-400">
                Send this message to the patient via WhatsApp.
              </p>
            </div>
          </div>
        ) : (
          /* No newToken yet — explain the link status */
          <div className="card-premium p-5">
            <div className="flex items-start gap-3">
              {selected.status === "ready" ? (
                <>
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50">
                    <Link2 className="size-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Link is active</p>
                    <p className="mt-0.5 text-xs leading-5 text-slate-500">
                      This report has an active download link. The raw URL is not stored for security reasons.
                      Click <strong>Regenerate</strong> below to create a fresh link and get the WhatsApp message.
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
          <button onClick={regenerateLink} disabled={actionLoading} className="btn-secondary flex items-center gap-2 text-sm disabled:opacity-50">
            <RefreshCw className={`size-4 ${actionLoading ? "animate-spin" : ""}`} />
            {newToken ? "Regenerate again" : "Regenerate link"}
          </button>
          {selected.status !== "revoked" && (
            <button onClick={revokeReport} disabled={actionLoading} className="flex items-center gap-2 rounded-[8px] border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-100 disabled:opacity-50">
              <XCircle className="size-4" /> Revoke link
            </button>
          )}
        </div>

        {/* Access logs */}
        {logs.length > 0 && (
          <div className="card-premium overflow-hidden">
            <div className="border-b border-slate-100 px-5 py-3 text-sm font-semibold text-slate-800">
              Access Log
            </div>
            <div className="divide-y divide-slate-50">
              {logs.map((log, i) => (
                <div key={i} className="flex items-center justify-between px-5 py-2.5 text-xs">
                  <div className="flex items-center gap-2">
                    {log.success
                      ? <CheckCircle className="size-3.5 text-emerald-500" />
                      : <AlertTriangle className="size-3.5 text-amber-500" />}
                    <span className="font-medium text-slate-700">{log.action}</span>
                    <span className="text-slate-400">{log.access_method}</span>
                  </div>
                  <span className="text-slate-400">{new Date(log.created_at).toLocaleString("en-IN")}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // List view
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-slate-950">Reports</h1>
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
        <div className="card-premium p-10 text-center text-sm text-slate-400">
          {query ? "No reports match your search." : "No reports yet."}
        </div>
      ) : (
        <div className="card-premium divide-y divide-slate-50 overflow-hidden">
          {filtered.map((r) => (
            <button
              key={r.id}
              onClick={() => router.push(`/admin/reports?id=${r.id}`)}
              className="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-slate-50"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="truncate font-medium text-slate-950">{r.patient_name}</p>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_CHIP[r.status]}`}>
                    {r.status}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-slate-400">
                  {r.report_number} · {r.test_name} · {r.patient_mobile}
                </p>
              </div>
              <div className="ml-4 flex shrink-0 items-center gap-3 text-xs text-slate-400">
                <span className="hidden sm:flex items-center gap-1">
                  <Download className="size-3" />{r.download_count}
                </span>
                <Eye className="size-4 text-slate-300" />
              </div>
            </button>
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
