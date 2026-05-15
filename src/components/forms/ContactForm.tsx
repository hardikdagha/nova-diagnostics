"use client";

import { FormEvent, useState } from "react";
import { Send } from "lucide-react";
import { bookingReasons } from "@/config/site";
import { isValidIndianMobile } from "@/lib/utils";
import { supabase } from "@/lib/supabase/client";
import { errorClass, inputClass, labelClass } from "./formStyles";

type FormState = {
  name: string;
  mobile: string;
  email: string;
  reason: string;
  message: string;
  consent: boolean;
};

const initialState: FormState = {
  name: "",
  mobile: "",
  email: "",
  reason: bookingReasons[0],
  message: "",
  consent: false,
};

export function ContactForm() {
  const [form, setForm] = useState(initialState);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
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

    if (!form.consent) {
      setError("Please confirm consent before submitting.");
      return;
    }

    setSubmitting(true);
    try {
      const { error: insertError } = await supabase
        .from("contact_enquiries")
        .insert({
          full_name: form.name.trim(),
          mobile: form.mobile.replace(/\D/g, "").slice(-10),
          email: form.email.trim() || null,
          inquiry_type: form.reason,
          message: form.message.trim() || null,
        });

      if (insertError) {
        console.error("[ContactForm] Supabase insert error:", insertError.code, insertError.message, insertError.details);
        throw insertError;
      }

      setSuccess(true);
      setForm(initialState);
    } catch (err) {
      console.error("[ContactForm] Submit failed:", err);
      setError("Something went wrong. Please try again or call us directly at +91 8433706778.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className="card-premium space-y-5 p-5 md:p-6">
      {success ? (
        <div className="rounded-[8px] border border-teal-200 bg-teal-50 p-4 text-sm font-medium text-teal-900">
          Thank you. Your enquiry has been received. Our team will contact you shortly.
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
          Email <span className="font-normal text-slate-400">(optional)</span>
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
      <button type="submit" disabled={submitting} className="btn-primary w-full disabled:opacity-60">
        <Send className="size-4" aria-hidden="true" />
        {submitting ? "Submitting…" : "Submit Request"}
      </button>
    </form>
  );
}
