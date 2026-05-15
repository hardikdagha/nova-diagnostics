"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Download, FileSearch, MessageCircle, Phone } from "lucide-react";
import { inputClass, labelClass, errorClass } from "@/components/forms/formStyles";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

interface ReportResult {
  reportNumber: string;
  patientName: string;
  testName: string;
  reportDate: string;
  signedUrl: string;
}

export default function ReportLookupPage() {
  const [reportNumber, setReportNumber] = useState("");
  const [mobile, setMobile] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ReportResult | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/fallback-report-lookup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({ reportNumber: reportNumber.trim(), mobile: mobile.trim() }),
      });

      const json = await res.json();

      if (json.error === "revoked") {
        setError("This report link has been deactivated. Please contact Nova Diagnostics.");
      } else if (json.error === "expired") {
        setError("This report link has expired. Please contact Nova Diagnostics.");
      } else if (json.error) {
        setError("No report found with the provided details. Please check the information or contact Nova Diagnostics.");
      } else {
        setResult(json as ReportResult);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Minimal header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="flex h-14 items-center px-4">
          <Link href="/">
            <Image
              src="/images/nova-logo-cropped.webp"
              alt="Nova Diagnostics"
              width={120}
              height={53}
              className="h-7 w-auto object-contain"
              unoptimized
            />
          </Link>
        </div>
      </header>

      <main className="flex min-h-[calc(100vh-3.5rem)] items-start justify-center px-4 py-10">
        <div className="w-full max-w-md">
          {!result ? (
            <>
              <div className="mb-8 text-center">
                <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-[#061A33]/5">
                  <FileSearch className="size-7 text-[#061A33]" />
                </div>
                <h1 className="text-2xl font-semibold text-slate-950">Find your report</h1>
                <p className="mt-2 text-sm text-slate-500">
                  Enter your report number and registered mobile to download your report.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="card-premium space-y-4 p-6">
                <div>
                  <label className={labelClass}>Report number</label>
                  <input
                    className={`${inputClass} mt-1.5 uppercase`}
                    required
                    value={reportNumber}
                    onChange={(e) => setReportNumber(e.target.value.toUpperCase())}
                    placeholder="NOVA-2026-XXXXXX"
                    autoComplete="off"
                  />
                </div>

                <div>
                  <label className={labelClass}>Registered mobile number</label>
                  <input
                    className={`${inputClass} mt-1.5`}
                    required
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="10-digit mobile number"
                    maxLength={10}
                    inputMode="tel"
                    autoComplete="tel"
                  />
                </div>

                {error && <p className={errorClass}>{error}</p>}

                <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60">
                  {loading ? "Searching…" : "Find Report"}
                </button>

                <p className="text-center text-xs text-slate-400">
                  Both report number and mobile number are required to access your report.
                </p>
              </form>

              <p className="mt-5 text-center text-sm text-slate-500">
                Got a WhatsApp link? Use that instead — it&apos;s faster.
              </p>
            </>
          ) : (
            <div className="space-y-4">
              <div className="card-premium overflow-hidden">
                <div className="bg-[#061A33] px-6 py-5 text-white">
                  <p className="text-xs font-semibold uppercase tracking-widest text-cyan-300">Nova Diagnostics</p>
                  <h1 className="mt-1 text-2xl font-semibold">Report found</h1>
                </div>
                <div className="px-6 py-5">
                  <dl className="space-y-3">
                    {[
                      ["Patient", result.patientName],
                      ["Test", result.testName],
                      ["Report No.", result.reportNumber],
                      ["Report Date", new Date(result.reportDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })],
                    ].map(([label, value]) => (
                      <div key={label} className="flex justify-between gap-4 text-sm">
                        <dt className="text-slate-400">{label}</dt>
                        <dd className="font-medium text-slate-800 text-right">{value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
                <div className="border-t border-slate-100 px-6 py-5">
                  <a
                    href={result.signedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary flex w-full items-center justify-center gap-2 py-3.5 text-base"
                  >
                    <Download className="size-5" />
                    Download Report
                  </a>
                  <p className="mt-2 text-center text-xs text-slate-400">
                    This download link is valid for 8 minutes.
                  </p>
                </div>
              </div>

              <button
                onClick={() => { setResult(null); setReportNumber(""); setMobile(""); }}
                className="btn-secondary w-full text-sm"
              >
                Search another report
              </button>
            </div>
          )}

          {/* Patient login nudge — secondary option, does not weaken lookup security */}
          <div className="mt-4 rounded-xl border border-slate-200 bg-white p-5 text-center">
            <p className="text-sm font-medium text-slate-700">Prefer to login?</p>
            <p className="mt-1 text-xs text-slate-500">
              View all reports linked to your verified email address after logging in.
            </p>
            <Link
              href="/patient/login"
              className="btn-secondary mt-3 inline-flex justify-center text-sm"
            >
              Patient Login
            </Link>
          </div>

          {/* Help */}
          <div className="mt-4 text-center">
            <p className="mb-2 text-xs text-slate-400">Need help?</p>
            <div className="flex justify-center gap-3">
              <a href="tel:+918433706778" className="btn-secondary text-sm">
                <Phone className="size-4" /> Call
              </a>
              <a href="https://wa.me/918433706778" className="btn-primary text-sm">
                <MessageCircle className="size-4" /> WhatsApp
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
