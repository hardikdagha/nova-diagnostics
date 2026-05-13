"use client";

/**
 * /patient/login — Patient magic-link login.
 *
 * No password required. Supabase sends a secure login link to the patient's
 * email. After they click it, they land on /auth/callback which exchanges the
 * code for a session and redirects to /patient/dashboard.
 *
 * NOTE (MVP): Uses Supabase built-in email service.
 * Configure Zoho SMTP in Supabase dashboard for production reliability.
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { FileSearch, Mail } from "lucide-react";
import { inputClass, labelClass, errorClass } from "@/components/forms/formStyles";

export default function PatientLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  // If already logged in, go straight to dashboard
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace("/patient/dashboard");
    });
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setLoading(false);

    if (authError) {
      setError("Could not send login link. Please check your email and try again.");
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
            We sent a secure login link to{" "}
            <span className="font-semibold text-slate-800">{email}</span>. Tap the
            link in that email to sign in — no password needed.
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
          <h1 className="text-2xl font-semibold text-slate-950">Patient Login</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Login with your email to view reports linked to your Nova Diagnostics account.
          </p>
        </div>

        {/* Magic-link form */}
        <form onSubmit={handleLogin} className="card-premium space-y-4 p-6">
          <div>
            <label htmlFor="email" className={labelClass}>
              Email address
            </label>
            <div className="relative mt-1.5">
              <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`${inputClass} pl-9`}
                placeholder="you@email.com"
                autoComplete="email"
              />
            </div>
          </div>

          {error && <p className={errorClass}>{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full justify-center disabled:opacity-60"
          >
            {loading ? "Sending link…" : "Send Login Link"}
          </button>

          <p className="text-center text-xs text-slate-400">
            We&apos;ll email you a secure link — no password needed.
          </p>
        </form>

        {/* Secondary: report number lookup */}
        <div className="card-premium p-5">
          <div className="flex items-start gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-slate-100">
              <FileSearch className="size-4 text-slate-500" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-800">Have a report number?</p>
              <p className="mt-0.5 text-xs text-slate-500">
                Download your report directly using your report number and mobile number.
              </p>
              <Link
                href="/reports"
                className="btn-secondary mt-3 inline-flex text-sm"
              >
                Download Report
              </Link>
            </div>
          </div>
        </div>

        {/* WhatsApp note */}
        <p className="text-center text-xs text-slate-400">
          No account needed if you received a secure report link on WhatsApp.
          Just use that link directly.
        </p>

        {/* Register link */}
        <p className="text-center text-sm text-slate-500">
          New to Nova Diagnostics online?{" "}
          <Link
            href="/patient/register"
            className="font-medium text-teal-600 hover:text-teal-700"
          >
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
}
