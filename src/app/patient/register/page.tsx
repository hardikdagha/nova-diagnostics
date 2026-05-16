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
import { ArrowRight, Mail, Phone, User } from "lucide-react";
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
        emailRedirectTo: `${window.location.origin}/auth/callback/`,
        data: {
          full_name: form.fullName,
          // Mobile stored for future phone-OTP verification; not used for report matching yet
          mobile_unverified: form.mobile,
        },
      },
    });

    setLoading(false);

    if (authError) {
      if (authError.message.toLowerCase().includes("redirect")) {
        setError("Could not send confirmation email. Please contact Nova Diagnostics support.");
      } else if (authError.message.toLowerCase().includes("rate")) {
        setError("Too many attempts. Please wait a few minutes and try again.");
      } else {
        setError(`Could not create account: ${authError.message}`);
      }
      return;
    }

    setSent(true);
  };

  /* ── "Verify your email" state ────────────────────────────────────────── */
  if (sent) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="card-premium overflow-hidden">
            {/* Teal accent line */}
            <div className="h-1 bg-gradient-to-r from-teal-400 to-teal-600" />

            <div className="px-8 pb-8 pt-8 text-center">
              {/* Double-ring icon */}
              <div className="mx-auto mb-6 inline-flex size-20 items-center justify-center rounded-full bg-teal-50 ring-[6px] ring-teal-50/60">
                <div className="flex size-14 items-center justify-center rounded-full bg-teal-100">
                  <Mail className="size-7 text-teal-600" />
                </div>
              </div>

              <h1 className="text-2xl font-semibold text-slate-950">Verify your email</h1>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                A confirmation link has been sent to
              </p>
              <p className="mt-1.5 inline-block rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-800">
                {form.email}
              </p>

              {/* Numbered steps */}
              <div className="mt-8 space-y-3 text-left">
                {[
                  "Open the email from Nova Diagnostics",
                  "Tap the confirmation link",
                  "Your account will be created and you will be signed in",
                ].map((step, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#061A33] text-xs font-bold text-white">
                      {i + 1}
                    </span>
                    <p className="text-sm text-slate-600">{step}</p>
                  </div>
                ))}
              </div>

              {/* Spam folder notice */}
              <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-left">
                <p className="text-xs font-medium leading-5 text-amber-800">
                  Can&apos;t find the email? Check your spam or junk folder.
                </p>
              </div>
            </div>

            {/* Card footer */}
            <div className="border-t border-slate-100 bg-slate-50/80 px-8 py-4 text-center">
              <p className="text-sm text-slate-500">
                Need to use a different email?{" "}
                <button
                  onClick={() => setSent(false)}
                  className="font-semibold text-teal-600 hover:text-teal-700"
                >
                  Try again
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── Registration form ────────────────────────────────────────────────── */
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-4">

        {/* Page heading */}
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-teal-700">
            Patient Portal
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
            Create your account
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            Register to view reports linked to your verified email address.
          </p>
        </div>

        {/* Registration form card */}
        <div className="card-premium overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-teal-400 to-teal-600" />

          <form onSubmit={handleRegister} className="space-y-4 p-6">
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
              <p className="mt-1.5 text-xs text-slate-400">
                Collected for support and contact purposes. Report matching by mobile will be
                enabled only after phone verification is added.
              </p>
            </div>

            {error && <p className={errorClass}>{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center gap-2 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Creating account…
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="size-4" />
                </>
              )}
            </button>

            <p className="text-center text-xs text-slate-400">
              By registering, you consent to Nova Diagnostics processing your information
              for report delivery and patient support.
            </p>
          </form>
        </div>

        <p className="text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link href="/patient/login" className="font-semibold text-teal-600 hover:text-teal-700">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
