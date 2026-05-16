"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { staffSupabase as supabase } from "@/lib/supabase/staffClient";
import { applyLetterhead } from "@/lib/pdf/applyLetterhead";
import { CheckCircle, Copy, FileUp, Layers, MessageSquare, UserCheck, X } from "lucide-react";
import { inputClass, labelClass, errorClass } from "@/components/forms/formStyles";
import type { Patient } from "@/lib/supabase/types";

function generateReportNumber() {
  const year = new Date().getFullYear();
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let rand = "";
  const buf = new Uint8Array(6);
  crypto.getRandomValues(buf);
  for (const b of buf) rand += chars[b % chars.length];
  return `NOVA-${year}-${rand}`;
}

async function generateToken(): Promise<{ raw: string; hash: string }> {
  const buf = new Uint8Array(40);
  crypto.getRandomValues(buf);
  const raw = btoa(String.fromCharCode(...buf))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");

  const hashBuf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(raw));
  const hash = Array.from(new Uint8Array(hashBuf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return { raw, hash };
}

export default function UploadReportPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    patientName: "",
    patientMobile: "",
    patientEmail: "",
    testName: "",
    reportDate: new Date().toISOString().split("T")[0],
  });
  const [file, setFile] = useState<File | null>(null);
  const [processedFile, setProcessedFile] = useState<File | null>(null);
  const [processingPdf, setProcessingPdf] = useState(false);
  const [letterheadApplied, setLetterheadApplied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{
    reportId: string;
    reportNumber: string;
    token: string;
    whatsappMessage: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  // Patient autocomplete
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<Patient[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const searchPatients = useCallback(async (query: string) => {
    const q = query.trim();
    if (q.length < 2) { setSuggestions([]); setShowSuggestions(false); return; }
    const { data } = await supabase
      .from("patients")
      .select("*")
      .or(`full_name.ilike.%${q}%,mobile.ilike.%${q}%,normalized_mobile.ilike.%${q}%,email.ilike.%${q}%`)
      .limit(6);
    setSuggestions(data ?? []);
    setShowSuggestions(true);
  }, []);

  function selectPatient(p: Patient) {
    setSelectedPatientId(p.id);
    setForm((f) => ({
      ...f,
      patientName: p.full_name,
      patientMobile: p.mobile,
      patientEmail: p.email ?? "",
    }));
    setSuggestions([]);
    setShowSuggestions(false);
  }

  function clearPatientSelection() {
    setSelectedPatientId(null);
    setForm((f) => ({ ...f, patientName: "", patientMobile: "", patientEmail: "" }));
  }

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    if (selectedPatientId) setSelectedPatientId(null);
  };

  // Debounced search — only called from onChange of name/mobile inputs (event handlers, not render)
  const triggerSearch = (value: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => void searchPatients(value), 280);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] ?? null;
    setFile(selected);
    setProcessedFile(null);
    setLetterheadApplied(false);
    if (!selected) return;

    setProcessingPdf(true);
    try {
      const { file: out, applied } = await applyLetterhead(selected);
      setProcessedFile(out);
      setLetterheadApplied(applied);
    } catch {
      // Processing failed — fall back to original
      setProcessedFile(selected);
    } finally {
      setProcessingPdf(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const uploadFile = processedFile ?? file;
    if (!uploadFile) { setError("Please select a PDF file."); return; }
    if (processingPdf) { setError("Please wait — PDF is still being processed."); return; }
    if (uploadFile.size > 52_428_800) { setError("File must be under 50 MB."); return; }
    setLoading(true);
    setError("");

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const reportNumber = generateReportNumber();
      const { raw: token, hash: tokenHash } = await generateToken();

      // Upload PDF to private storage
      const filePath = `${reportNumber}/${uploadFile.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      const { error: uploadError } = await supabase.storage
        .from("reports")
        .upload(filePath, uploadFile, { contentType: "application/pdf", upsert: false });

      if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

      // Find or create patient record
      const mobile = form.patientMobile.replace(/\D/g, "").slice(-10);
      let patientId: string | null = selectedPatientId;

      if (!patientId) {
        const { data: existing } = await supabase
          .from("patients")
          .select("id")
          .eq("mobile", mobile)
          .maybeSingle();

        if (existing) {
          patientId = existing.id;
        } else {
          const { data: newPatient } = await supabase
            .from("patients")
            .insert({
              full_name: form.patientName,
              mobile,
              email: form.patientEmail || null,
              normalized_mobile: mobile,
              source: "report_upload",
            })
            .select("id")
            .single();
          patientId = newPatient?.id ?? null;
        }
      }

      // Insert report — select id so we can link to the detail page
      const { data: inserted, error: insertError } = await supabase.from("reports").insert({
        report_number: reportNumber,
        patient_id: patientId,
        patient_name: form.patientName,
        patient_mobile: mobile,
        patient_email: form.patientEmail || null,
        test_name: form.testName,
        report_date: form.reportDate,
        file_path: filePath,
        token_hash: tokenHash,
        token,
        status: "ready",
        uploaded_by: session.user.id,
      }).select("id").single();

      if (insertError) {
        // Clean up uploaded file on insert failure
        await supabase.storage.from("reports").remove([filePath]);
        throw new Error(`Could not save report: ${insertError.message}`);
      }

      const reportUrl = `https://novadiagnosticslab.com/r/?t=${token}`;
      const whatsappMessage = `Hello ${form.patientName}, your report from Nova Diagnostics is ready.\n\nReport No: ${reportNumber}\n\nDownload report:\n${reportUrl}\n\nNova Diagnostics\n+91 8433706778`;

      setResult({ reportId: inserted?.id ?? "", reportNumber, token, whatsappMessage });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyMessage = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result.whatsappMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  if (result) {
    return (
      <div className="mx-auto max-w-lg space-y-5">
        <div className="card-premium p-6 text-center">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle className="size-7 text-emerald-600" />
          </div>
          <h1 className="text-xl font-semibold text-slate-950">Report uploaded</h1>
          <p className="mt-1 font-mono text-sm text-slate-600">
            {result.reportNumber}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Share the WhatsApp message below with the patient.
          </p>
        </div>

        <div className="card-premium overflow-hidden">
          <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-5 py-3">
            <MessageSquare className="size-3.5 text-slate-400" />
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">WhatsApp Message</span>
          </div>
          <pre className="whitespace-pre-wrap break-all px-5 py-4 text-sm leading-7 text-slate-700">
            {result.whatsappMessage}
          </pre>
          <div className="border-t border-slate-100 px-5 py-3">
            <button onClick={copyMessage} className="btn-primary w-full gap-2">
              {copied ? <CheckCircle className="size-4" /> : <Copy className="size-4" />}
              {copied ? "Copied!" : "Copy WhatsApp Message"}
            </button>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => { setResult(null); setForm({ patientName: "", patientMobile: "", patientEmail: "", testName: "", reportDate: new Date().toISOString().split("T")[0] }); setFile(null); setProcessedFile(null); setLetterheadApplied(false); }}
            className="btn-secondary flex-1 text-sm"
          >
            Upload another
          </button>
          {result?.reportId && (
            <button onClick={() => router.push(`/admin/reports?id=${result.reportId}`)} className="btn-primary flex-1 text-sm">
              View Report
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-950">Upload Report</h1>
        <p className="mt-0.5 text-sm text-slate-500">Create a secure patient report link</p>
      </div>

      <form onSubmit={handleSubmit} className="card-premium space-y-6 p-6">
        {/* Patient Information */}
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Patient Information</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={labelClass}>Patient full name *</label>
              <div className="relative mt-1.5">
                {selectedPatientId ? (
                  <div className="flex items-center gap-2 rounded-[8px] border border-teal-300 bg-teal-50 px-3 py-2.5">
                    <UserCheck className="size-4 shrink-0 text-teal-600" />
                    <span className="flex-1 text-sm font-medium text-teal-800">{form.patientName}</span>
                    <button
                      type="button"
                      onClick={clearPatientSelection}
                      className="text-teal-500 hover:text-teal-700"
                      title="Clear selection"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                ) : (
                  <input
                    className={inputClass}
                    required
                    value={form.patientName}
                    onChange={(e) => { set("patientName")(e); triggerSearch(e.target.value); }}
                    onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                    placeholder="e.g. Rahul Sharma"
                    autoComplete="off"
                  />
                )}

                {/* Suggestions dropdown */}
                {showSuggestions && suggestions.length > 0 && !selectedPatientId && (
                  <div className="absolute left-0 right-0 top-full z-10 mt-1 overflow-hidden rounded-[8px] border border-slate-200 bg-white shadow-lg">
                    {suggestions.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onMouseDown={() => selectPatient(p)}
                        className="flex w-full items-start gap-3 px-3 py-2.5 text-left hover:bg-teal-50"
                      >
                        <UserCheck className="mt-0.5 size-4 shrink-0 text-teal-500" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-900">{p.full_name}</p>
                          <p className="text-xs text-slate-400">{p.mobile}{p.email ? ` · ${p.email}` : ""}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className={labelClass}>Mobile number *</label>
              <input
                className={`${inputClass} mt-1.5`}
                required
                value={form.patientMobile}
                onChange={(e) => { set("patientMobile")(e); triggerSearch(e.target.value); }}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                placeholder="9876543210"
                maxLength={10}
                readOnly={!!selectedPatientId}
              />
            </div>
            <div>
              <label className={labelClass}>Email <span className="font-normal text-slate-400">(optional)</span></label>
              <input
                className={`${inputClass} mt-1.5`}
                type="email"
                value={form.patientEmail}
                onChange={set("patientEmail")}
                placeholder="patient@email.com"
                readOnly={!!selectedPatientId}
              />
            </div>
          </div>
        </div>

        {/* Test Details */}
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Test Details</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={labelClass}>Test name *</label>
              <input className={`${inputClass} mt-1.5`} required value={form.testName} onChange={set("testName")} placeholder="e.g. Complete Blood Count (CBC)" />
            </div>
            <div>
              <label className={labelClass}>Report date *</label>
              <input className={`${inputClass} mt-1.5`} type="date" required value={form.reportDate} onChange={set("reportDate")} />
            </div>
          </div>
        </div>

        {/* Report PDF */}
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Report PDF</p>
          <label className={`flex cursor-pointer flex-col items-center gap-2 rounded-[8px] border-2 border-dashed px-4 py-6 transition ${letterheadApplied ? "border-teal-300 bg-teal-50" : "border-slate-200 bg-slate-50 hover:border-teal-400 hover:bg-teal-50"}`}>
            <FileUp className="size-7 text-slate-400" />
            {file ? (
              <span className="text-sm font-medium text-slate-700">{file.name}</span>
            ) : (
              <span className="text-sm text-slate-500">Click to select PDF (max 50 MB)</span>
            )}
            <input
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>

          {/* Letterhead processing status */}
          {processingPdf && (
            <p className="mt-2 flex items-center gap-2 text-xs text-slate-500">
              <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
              Applying Nova letterhead…
            </p>
          )}
          {!processingPdf && letterheadApplied && (
            <p className="mt-2 flex items-center gap-2 text-xs font-medium text-teal-700">
              <Layers className="size-3.5 shrink-0" />
              Nova letterhead applied — final PDF ready to upload
            </p>
          )}
          {!processingPdf && file && !letterheadApplied && processedFile && (
            <p className="mt-2 text-xs text-slate-400">
              Letterhead not configured — uploading original PDF.{" "}
              <span className="text-slate-500">Add <code className="font-mono">/public/assets/letterhead.png</code> to enable overlay.</span>
            </p>
          )}
        </div>

        {error && <p className={errorClass}>{error}</p>}

        <button type="submit" disabled={loading || processingPdf} className="btn-primary w-full disabled:opacity-60">
          {loading ? "Uploading…" : processingPdf ? "Processing PDF…" : "Upload & Generate Link"}
        </button>
      </form>
    </div>
  );
}
