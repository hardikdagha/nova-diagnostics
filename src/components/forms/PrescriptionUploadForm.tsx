"use client";

import { FormEvent, useState } from "react";
import { UploadCloud } from "lucide-react";
import { isValidIndianMobile } from "@/lib/utils";
import { errorClass, inputClass, labelClass } from "./formStyles";

type FormState = {
  name: string;
  mobile: string;
  email: string;
  contactMethod: string;
  notes: string;
  consent: boolean;
};

const initialState: FormState = {
  name: "",
  mobile: "",
  email: "",
  contactMethod: "WhatsApp",
  notes: "",
  consent: false,
};

export function PrescriptionUploadForm() {
  const [form, setForm] = useState(initialState);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!form.name.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!isValidIndianMobile(form.mobile)) {
      setError("Please enter a valid Indian mobile number.");
      return;
    }

    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!fileName) {
      setError("Please select your prescription file.");
      return;
    }

    if (!form.consent) {
      setError("Please confirm consent before submitting.");
      return;
    }

    // TODO: Implement secure private file upload storage before production use.
    if (process.env.NODE_ENV === "development") {
      console.info("Nova Diagnostics prescription request", {
        ...form,
        prescriptionFileName: fileName,
      });
    }

    setSuccess(true);
    setFileName("");
    setForm(initialState);
  }

  return (
    <form onSubmit={submit} className="card-premium space-y-5 p-5 md:p-6">
      {success ? (
        <div className="rounded-[8px] border border-teal-200 bg-teal-50 p-4 text-sm font-medium text-teal-900">
          Thank you. Our team will contact you shortly.
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
        <span className={labelClass}>Email optional</span>
        <input
          className={inputClass}
          value={form.email}
          onChange={(event) => setForm({ ...form, email: event.target.value })}
          placeholder="name@example.com"
          autoComplete="email"
          inputMode="email"
        />
      </label>
      <label className="space-y-2">
        <span className={labelClass}>Upload prescription</span>
        <input
          className={inputClass}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.webp"
          onChange={(event) => setFileName(event.target.files?.[0]?.name ?? "")}
        />
        <span className="block text-xs leading-5 text-slate-500">
          Accepted formats: PDF, JPG, PNG. Max one file per request.
        </span>
      </label>
      <label className="space-y-2">
        <span className={labelClass}>Preferred contact method</span>
        <select
          className={inputClass}
          value={form.contactMethod}
          onChange={(event) => setForm({ ...form, contactMethod: event.target.value })}
        >
          <option>WhatsApp</option>
          <option>Phone call</option>
          <option>Email</option>
        </select>
      </label>
      <label className="space-y-2">
        <span className={labelClass}>Notes</span>
        <textarea
          className={`${inputClass} min-h-28 resize-y`}
          value={form.notes}
          onChange={(event) => setForm({ ...form, notes: event.target.value })}
          placeholder="Tell us if you need home collection, preferred timing, or package guidance"
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
          I consent to Nova Diagnostics reviewing my prescription request and contacting me about tests and booking options.
        </span>
      </label>
      {error ? <p className={errorClass}>{error}</p> : null}
      <button type="submit" className="btn-primary w-full">
        <UploadCloud className="size-4" aria-hidden="true" />
        Upload Prescription Request
      </button>
    </form>
  );
}
