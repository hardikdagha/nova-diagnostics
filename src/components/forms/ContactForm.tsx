"use client";

import { FormEvent, useState } from "react";
import { Send } from "lucide-react";
import { bookingReasons } from "@/config/site";
import { isValidIndianMobile } from "@/lib/utils";
import { errorClass, inputClass, labelClass } from "./formStyles";

type FormState = {
  name: string;
  mobile: string;
  reason: string;
  message: string;
  consent: boolean;
};

const initialState: FormState = {
  name: "",
  mobile: "",
  reason: bookingReasons[0],
  message: "",
  consent: false,
};

export function ContactForm() {
  const [form, setForm] = useState(initialState);
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

    if (!form.consent) {
      setError("Please confirm consent before submitting.");
      return;
    }

    // TODO: Connect this request to a secure backend or CRM before collecting production inquiries.
    if (process.env.NODE_ENV === "development") {
      console.info("Nova Diagnostics contact inquiry", form);
    }

    setSuccess(true);
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
        <span className={labelClass}>Reason</span>
        <select
          className={inputClass}
          value={form.reason}
          onChange={(event) => setForm({ ...form, reason: event.target.value })}
        >
          {bookingReasons.map((reason) => (
            <option key={reason} value={reason}>
              {reason}
            </option>
          ))}
        </select>
      </label>
      <label className="space-y-2">
        <span className={labelClass}>Message</span>
        <textarea
          className={`${inputClass} min-h-32 resize-y`}
          value={form.message}
          onChange={(event) => setForm({ ...form, message: event.target.value })}
          placeholder="Tell us what you need help with"
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
          I agree that Nova Diagnostics may contact me about this inquiry and handle submitted information with care.
        </span>
      </label>
      {error ? <p className={errorClass}>{error}</p> : null}
      <button type="submit" className="btn-primary w-full">
        <Send className="size-4" aria-hidden="true" />
        Submit Request
      </button>
    </form>
  );
}
