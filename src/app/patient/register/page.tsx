"use client";

/**
 * /patient/register — Patient registration with magic-link verification.
 *
 * Collects: full name, email, mobile (stored but unverified).
 * Sends Supabase magic-link email; after the patient clicks it they land on
 * /auth/callback → /patient/dashboard.
 *
 * Mobile number is stored in user_metadata for future phone-OTP verification
 * but is NOT used to match reports until verified.
 *
 * NOTE (MVP): Supabase built-in email is used. For production reliability,
 * configure Zoho SMTP in Supabase → Settings → Authentication → SMTP.
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { Mail, Phone, User } from "lucide-react";
import { inputClass, labelClass, errorClass } from "@/components/forms/formStyles";

export default function PatientRegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ fullName: "", email: "", mobile: "" });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  // If already logged in, go straight to dashboard
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace("/patient/dashboard");
    });
  }, [router]);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error: authError } = await supabase.auth.signInWithOtp({
      email: form.email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: {
          full_name: form.fullName,
          // Mobile stored for future phone-OTP verification; not used for report matching yet
          mobile_unverified: form.mobile,
        },
      },
    });

    setLoading(false);

    if (authError) {
      setError("Could not create account. Please try again.");
      return;
    }

    setSent(true);
  };

  if (sent) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4 py-10">
        <div className="w-full max-w-sm text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-teal-100">
            <Mail className="size-8 text-teal-600" />
          </div>
          <h1 className="text-xl font-semibold text-slate-950">Check your inbox</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            We sent a confirmation link to{" "}
            <span className="font-semibold text-slate-800">{form.email}</span>. Tap
            the link to verify your email and access your account.
          </p>
          <p className="mt-4 text-xs text-slate-400">
            Didn&apos;t receive it? Check your spam folder or{" "}
            <button
              onClick={() => setSent(false)}
              className="underline hover:text-slate-600"
            >
              try again
            </button>
            .
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[70vh] items-start justify-center px-4 py-10">
      <div className="w-full max-w-sm space-y-4">
        {/* Title */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold text-slate-950">Patient Registration</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Create an account to view reports linked to your verified email address.
          </p>
        </div>

        <form onSubmit={handleRegister} className="card-premium space-y-4 p-6">
          {/* Full name */}
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
                autoComplete="name"
              />
            </div>
          </div>

          {/* Email */}
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

          {/* Mobile — stored but unverified */}
          <div>
            <label className={labelClass}>
              Mobile number{" "}
              <span className="ml-1 font-normal text-slate-400">(optional)</span>
            </label>
            <div className="relative mt-1.5">
              <Phone className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input
                type="tel"
                value={form.mobile}
                onChange={set("mobile")}
                className={`${inputClass} pl-9`}
                placeholder="10-digit mobile number"
                inputMode="tel"
                maxLength={10}
                autoComplete="tel"
              />
            </div>
            <p className="mt-1 text-xs text-slate-400">
              Collected for support and contact purposes. Report matching by mobile will be
              enabled only after phone verification is added.
            </p>
          </div>

          {error && <p className={errorClass}>{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full justify-center disabled:opacity-60"
          >
            {loading ? "Creating account…" : "Create Account"}
          </button>

          <p className="text-center text-xs text-slate-400">
            By registering, you consent to Nova Diagnostics processing your information
            for report delivery and patient support.
          </p>
        </form>

        <p className="text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link
            href="/patient/login"
            className="font-medium text-teal-600 hover:text-teal-700"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
