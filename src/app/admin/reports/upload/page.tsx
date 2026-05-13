"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { CheckCircle, Copy, FileUp } from "lucide-react";
import { inputClass, labelClass, errorClass } from "@/components/forms/formStyles";

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{
    reportId: string;
    reportNumber: string;
    token: string;
    whatsappMessage: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) { setError("Please select a PDF file."); return; }
    if (file.size > 52_428_800) { setError("File must be under 50 MB."); return; }
    setLoading(true);
    setError("");

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const reportNumber = generateReportNumber();
      const { raw: token, hash: tokenHash } = await generateToken();

      // Upload PDF to private storage
      const filePath = `${reportNumber}/${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      const { error: uploadError } = await supabase.storage
        .from("reports")
        .upload(filePath, file, { contentType: "application/pdf", upsert: false });

      if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

      // Find or create patient record
      let patientId: string | null = null;
      const mobile = form.patientMobile.replace(/\D/g, "").slice(-10);
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
          .insert({ full_name: form.patientName, mobile, email: form.patientEmail || null })
          .select("id")
          .single();
        patientId = newPatient?.id ?? null;
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
        status: "ready",
        uploaded_by: session.user.id,
      }).select("id").single();

      if (insertError) {
        // Clean up uploaded file on insert failure
        await supabase.storage.from("reports").remove([filePath]);
        throw new Error(`Could not save report: ${insertError.message}`);
      }

      const reportUrl = `https://novadiagnosticslab.com/r/${token}`;
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
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle className="size-6 text-emerald-600" />
          </div>
          <h1 className="text-xl font-semibold text-slate-950">Report uploaded</h1>
          <p className="mt-1 text-sm text-slate-500">
            Report No: <strong>{result.reportNumber}</strong>
          </p>
          <p className="mt-0.5 text-xs text-slate-400">
            Share the WhatsApp message below with the patient.
          </p>
        </div>

        <div className="card-premium overflow-hidden">
          <div className="border-b border-slate-100 bg-slate-50 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
            WhatsApp Message
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
            onClick={() => { setResult(null); setForm({ patientName: "", patientMobile: "", patientEmail: "", testName: "", reportDate: new Date().toISOString().split("T")[0] }); setFile(null); }}
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
      <h1 className="mb-6 text-2xl font-semibold text-slate-950">Upload Report</h1>

      <form onSubmit={handleSubmit} className="card-premium space-y-5 p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={labelClass}>Patient full name *</label>
            <input className={`${inputClass} mt-1.5`} required value={form.patientName} onChange={set("patientName")} placeholder="e.g. Rahul Sharma" />
          </div>
          <div>
            <label className={labelClass}>Mobile number *</label>
            <input className={`${inputClass} mt-1.5`} required value={form.patientMobile} onChange={set("patientMobile")} placeholder="9876543210" maxLength={10} />
          </div>
          <div>
            <label className={labelClass}>Email <span className="font-normal text-slate-400">(optional)</span></label>
            <input className={`${inputClass} mt-1.5`} type="email" value={form.patientEmail} onChange={set("patientEmail")} placeholder="patient@email.com" />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Test name *</label>
            <input className={`${inputClass} mt-1.5`} required value={form.testName} onChange={set("testName")} placeholder="e.g. Complete Blood Count (CBC)" />
          </div>
          <div>
            <label className={labelClass}>Report date *</label>
            <input className={`${inputClass} mt-1.5`} type="date" required value={form.reportDate} onChange={set("reportDate")} />
          </div>
        </div>

        {/* File upload */}
        <div>
          <label className={labelClass}>Report PDF *</label>
          <label className="mt-1.5 flex cursor-pointer flex-col items-center gap-2 rounded-[8px] border-2 border-dashed border-slate-200 bg-slate-50 px-4 py-6 transition hover:border-teal-400 hover:bg-teal-50">
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
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </label>
        </div>

        {error && <p className={errorClass}>{error}</p>}

        <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60">
          {loading ? "Uploading…" : "Upload & Generate Link"}
        </button>
      </form>
    </div>
  );
}
