"use client";

import { FormEvent, useRef, useState } from "react";
import { CalendarCheck } from "lucide-react";
import { isValidIndianMobile } from "@/lib/utils";
import { supabase } from "@/lib/supabase/client";
import { errorClass, inputClass, labelClass } from "./formStyles";

const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB

type FormState = {
  name: string;
  mobile: string;
  email: string;
  area: string;
  preferredDate: string;
  preferredTime: string;
  testRequired: string;
  notes: string;
  consent: boolean;
};

const initialState: FormState = {
  name: "",
  mobile: "",
  email: "",
  area: "",
  preferredDate: "",
  preferredTime: "Morning",
  testRequired: "",
  notes: "",
  consent: false,
};

export function HomeCollectionForm() {
  const [form, setForm] = useState(initialState);
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    setFileError("");
    const selected = event.target.files?.[0] ?? null;
    if (!selected) { setFile(null); return; }

    if (!ALLOWED_TYPES.includes(selected.type)) {
      setFileError("Only PDF, JPG, PNG, or WEBP files are accepted.");
      event.target.value = "";
      setFile(null);
      return;
    }
    if (selected.size > MAX_FILE_BYTES) {
      setFileError("File must be under 5 MB.");
      event.target.value = "";
      setFile(null);
      return;
    }
    setFile(selected);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setFileError("");

    if (!form.name.trim()) { setError("Please enter your full name."); return; }
    if (!isValidIndianMobile(form.mobile)) { setError("Please enter a valid Indian mobile number."); return; }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!form.area.trim()) { setError("Please enter your area or location."); return; }
    if (!form.consent) { setError("Please confirm consent before submitting."); return; }

    setSubmitting(true);
    try {
      let prescriptionFilePath: string | null = null;

      // Upload prescription file if provided
      if (file) {
        const ext = file.name.split(".").pop() ?? "bin";
        const mobile = form.mobile.replace(/\D/g, "").slice(-10);
        const fileName = `${Date.now()}_${mobile}.${ext}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("home-collection-prescriptions")
          .upload(fileName, file, { contentType: file.type, upsert: false });

        if (uploadError) {
          console.error("[HomeCollectionForm] Storage upload error:", uploadError.message, uploadError);
          throw new Error(`File upload failed: ${uploadError.message}`);
        }
        prescriptionFilePath = uploadData.path;
      }

      const { error: insertError } = await supabase
        .from("home_collection_requests")
        .insert({
          full_name: form.name.trim(),
          mobile: form.mobile.replace(/\D/g, "").slice(-10),
          email: form.email.trim() || null,
          area_location: form.area.trim(),
          preferred_date: form.preferredDate || null,
          preferred_time_slot: form.preferredTime,
          test_package_required: form.testRequired.trim() || null,
          notes: form.notes.trim() || null,
          prescription_file_path: prescriptionFilePath,
        });

      if (insertError) {
        console.error("[HomeCollectionForm] Supabase insert error:", insertError.code, insertError.message, insertError.details);
        // Clean up uploaded file on insert failure
        if (prescriptionFilePath) {
          await supabase.storage
            .from("home-collection-prescriptions")
            .remove([prescriptionFilePath]);
        }
        throw insertError;
      }

      setSuccess(true);
      setFile(null);
      setForm(initialState);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      console.error("[HomeCollectionForm] Submit failed:", err);
      setError("Something went wrong. Please try again or call us directly at +91 8433706778.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className="card-premium space-y-5 p-5 md:p-6">
      {success ? (
        <div className="rounded-[8px] border border-teal-200 bg-teal-50 p-4 text-sm font-medium text-teal-900">
          Thank you. Your home collection request has been received. Our team will contact you shortly to confirm availability.
        </div>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2">
          <span className={labelClass}>Full name</span>
          <input
            className={inputClass}
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            placeholder="Your name"
            autoComplete="name"
          />
        </label>
        <label className="space-y-2">
          <span className={labelClass}>Mobile number</span>
          <input
            className={inputClass}
            value={form.mobile}
            onChange={(event) => setForm({ ...form, mobile: event.target.value })}
            placeholder="9876543210"
            autoComplete="tel"
            inputMode="tel"
          />
        </label>
      </div>
      <label className="space-y-2">
        <span className={labelClass}>
          Email <span className="font-normal text-slate-400">(optional — for appointment confirmation)</span>
        </span>
        <input
          className={inputClass}
          type="email"
          value={form.email}
          onChange={(event) => setForm({ ...form, email: event.target.value })}
          placeholder="you@example.com"
          autoComplete="email"
          inputMode="email"
        />
      </label>
      <label className="space-y-2">
        <span className={labelClass}>Area/location</span>
        <input
          className={inputClass}
          value={form.area}
          onChange={(event) => setForm({ ...form, area: event.target.value })}
          placeholder="Vashi, Sanpada, Nerul..."
        />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2">
          <span className={labelClass}>Preferred date</span>
          <input
            className={inputClass}
            type="date"
            value={form.preferredDate}
            onChange={(event) => setForm({ ...form, preferredDate: event.target.value })}
          />
        </label>
        <label className="space-y-2">
          <span className={labelClass}>Preferred time slot</span>
          <select
            className={inputClass}
            value={form.preferredTime}
            onChange={(event) => setForm({ ...form, preferredTime: event.target.value })}
          >
            <option>Morning</option>
            <option>Afternoon</option>
            <option>Evening</option>
            <option>As available</option>
          </select>
        </label>
      </div>
      <label className="space-y-2">
        <span className={labelClass}>Test/package required</span>
        <input
          className={inputClass}
          value={form.testRequired}
          onChange={(event) => setForm({ ...form, testRequired: event.target.value })}
          placeholder="CBC, Thyroid Profile, Full Body Checkup..."
        />
      </label>
      <div className="space-y-2">
        <span className={labelClass}>Prescription upload <span className="font-normal text-slate-400">(optional)</span></span>
        <input
          ref={fileInputRef}
          className={inputClass}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.webp"
          onChange={handleFileChange}
        />
        {file && !fileError ? (
          <span className="block text-xs text-teal-700">Selected: {file.name}</span>
        ) : null}
        {fileError ? <p className={errorClass}>{fileError}</p> : null}
        <span className="block text-xs text-slate-500">PDF, JPG, PNG, WEBP · Max 5 MB</span>
      </div>
      <label className="space-y-2">
        <span className={labelClass}>Notes</span>
        <textarea
          className={`${inputClass} min-h-28 resize-y`}
          value={form.notes}
          onChange={(event) => setForm({ ...form, notes: event.target.value })}
          placeholder="Any instructions, patient age, fasting preference, landmark..."
        />
      </label>
      <label className="flex items-start gap-3 text-sm leading-6 text-slate-600">
        <input
          type="checkbox"
          className="mt-1 size-4 rounded border-slate-300 text-teal-700"
          checked={form.consent}
          onChange={(event) => setForm({ ...form, consent: event.target.checked })}
        />
        <span>
          I consent to Nova Diagnostics contacting me for home sample collection scheduling.
        </span>
      </label>
      {error ? <p className={errorClass}>{error}</p> : null}
      <button type="submit" disabled={submitting} className="btn-primary w-full disabled:opacity-60">
        <CalendarCheck className="size-4" aria-hidden="true" />
        {submitting ? "Submitting…" : "Request Home Collection"}
      </button>
    </form>
  );
}
