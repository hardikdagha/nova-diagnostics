"use client";

import { FormEvent, useState } from "react";
import { CalendarCheck } from "lucide-react";
import { isValidIndianMobile } from "@/lib/utils";
import { errorClass, inputClass, labelClass } from "./formStyles";

type FormState = {
  name: string;
  mobile: string;
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
  area: "",
  preferredDate: "",
  preferredTime: "Morning",
  testRequired: "",
  notes: "",
  consent: false,
};

export function HomeCollectionForm() {
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

    if (!form.area.trim()) {
      setError("Please enter your area or location.");
      return;
    }

    if (!form.consent) {
      setError("Please confirm consent before submitting.");
      return;
    }

    // TODO: Replace this UI-only placeholder with secure booking and prescription upload storage.
    if (process.env.NODE_ENV === "development") {
      console.info("Nova Diagnostics home collection request", {
        ...form,
        prescriptionFileName: fileName || null,
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
      <label className="space-y-2">
        <span className={labelClass}>Prescription upload optional</span>
        <input
          className={inputClass}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.webp"
          onChange={(event) => setFileName(event.target.files?.[0]?.name ?? "")}
        />
        {fileName ? <span className="text-xs text-slate-500">Selected: {fileName}</span> : null}
      </label>
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
          I consent to being contacted for home sample collection and understand that uploads are not stored until backend integration is completed.
        </span>
      </label>
      {error ? <p className={errorClass}>{error}</p> : null}
      <button type="submit" className="btn-primary w-full">
        <CalendarCheck className="size-4" aria-hidden="true" />
        Request Home Collection
      </button>
    </form>
  );
}
