"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { Mail, User } from "lucide-react";
import { inputClass, labelClass, errorClass } from "@/components/forms/formStyles";

export default function PatientRegisterPage() {
  const [form, setForm] = useState({ fullName: "", email: "" });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error: authError } = await supabase.auth.signInWithOtp({
      email: form.email,
      options: {
        data: { full_name: form.fullName },
        emailRedirectTo: `${window.location.origin}/patient/dashboard`,
      },
    });

    if (authError) {
      setError("Could not create account. Please try again.");
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  };

  if (sent) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-teal-100">
            <Mail className="size-7 text-teal-600" />
          </div>
          <h1 className="text-xl font-semibold text-slate-950">Check your email</h1>
          <p className="mt-2 text-sm text-slate-500">
            We sent a confirmation link to <strong>{form.email}</strong>. Tap it to complete registration.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold text-slate-950">Create account</h1>
          <p className="mt-1 text-sm text-slate-500">Register to access your reports online</p>
        </div>

        <form onSubmit={handleRegister} className="card-premium space-y-4 p-6">
          <div>
            <label className={labelClass}>Full name</label>
            <div className="relative mt-1.5">
              <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                required
                value={form.fullName}
                onChange={set("fullName")}
                className={`${inputClass} pl-9`}
                placeholder="Your full name"
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Email address</label>
            <div className="relative mt-1.5">
              <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                value={form.email}
                onChange={set("email")}
                className={`${inputClass} pl-9`}
                placeholder="you@email.com"
                autoComplete="email"
              />
            </div>
          </div>

          {error && <p className={errorClass}>{error}</p>}

          <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60">
            {loading ? "Creating account…" : "Create account"}
          </button>

          <p className="text-center text-xs text-slate-400">
            By registering, you consent to Nova Diagnostics processing your information for report delivery and patient support.
          </p>
        </form>

        <p className="mt-5 text-center text-sm text-slate-500">
          Already registered?{" "}
          <Link href="/patient/login" className="font-medium text-teal-600 hover:text-teal-700">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
