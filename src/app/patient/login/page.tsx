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
import { patientSupabase as supabase } from "@/lib/supabase/patientClient";
import { ArrowRight, CheckCircle2, EyeOff, FileSearch, Mail, ShieldCheck } from "lucide-react";
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

    // Hardcoded to production URL — do NOT use window.location.origin here.
    // window.location.origin returns http://localhost:3000 in local dev,
    // which Supabase then embeds in the magic-link email. The production
    // URL must be whitelisted in Supabase → Authentication → URL Configuration.
    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: "https://novadiagnosticslab.com/auth/callback/",
      },
    });

    setLoading(false);

    if (authError) {
      // Surface the actual Supabase error so configuration issues are visible
      if (authError.message.toLowerCase().includes("redirect")) {
        setError("Login link could not be sent. The site may need Supabase redirect URL configuration — please contact Nova Diagnostics support.");
      } else if (authError.message.toLowerCase().includes("rate")) {
        setError("Too many attempts. Please wait a few minutes and try again.");
      } else {
        setError(`Could not send login link: ${authError.message}`);
      }
      return;
    }

    setSent(true);
  };

  /* ── "Check your inbox" state ─────────────────────────────────────────── */
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

              <h1 className="text-2xl font-semibold text-slate-950">Check your inbox</h1>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                A secure login link has been sent to
              </p>
              <p className="mt-1.5 inline-block rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-800">
                {email}
              </p>

              {/* Numbered steps */}
              <div className="mt-8 space-y-3 text-left">
                {[
                  "Open the email from Nova Diagnostics",
                  "Tap the secure login link",
                  "You will be signed in automatically",
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
                Sent to the wrong address?{" "}
                <button
                  onClick={() => setSent(false)}
                  className="font-semibold text-teal-600 hover:text-teal-700"
                >
                  Try a different email
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── Login form ───────────────────────────────────────────────────────── */
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-4">

        {/* Page heading */}
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-teal-700">
            Patient Portal
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
            Access your reports
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            Enter your email to receive a secure login link.
            <br className="hidden sm:block" />
            No password needed.
          </p>
        </div>

        {/* Login form card */}
        <div className="card-premium overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-teal-400 to-teal-600" />

          <form onSubmit={handleLogin} className="p-6">
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

            {error && <p className={`${errorClass} mt-3`}>{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary mt-5 w-full justify-center gap-2 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Sending link…
                </>
              ) : (
                <>
                  Send Login Link
                  <ArrowRight className="size-4" />
                </>
              )}
            </button>
          </form>

          {/* Trust strip */}
          <div className="grid grid-cols-3 divide-x divide-slate-100 border-t border-slate-100 bg-slate-50">
            {[
              { icon: ShieldCheck, label: "Secure link" },
              { icon: CheckCircle2, label: "No password" },
              { icon: EyeOff, label: "Private & safe" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-1.5 py-3.5">
                <Icon className="size-4 text-teal-600" aria-hidden="true" />
                <span className="text-xs font-medium text-slate-500">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Secondary: report number download */}
        <div className="card-premium p-4">
          <div className="flex items-center gap-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-slate-100">
              <FileSearch className="size-5 text-slate-500" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-800">Have a report number?</p>
              <p className="mt-0.5 text-xs text-slate-500">
                Download directly without signing in.
              </p>
            </div>
            <Link
              href="/reports"
              className="shrink-0 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            >
              Download
            </Link>
          </div>
        </div>

        {/* WhatsApp note */}
        <p className="text-center text-xs text-slate-400">
          Received a report link on WhatsApp? Use that link directly — no sign-in needed.
        </p>

        {/* Register link */}
        <p className="text-center text-sm text-slate-500">
          New patient?{" "}
          <Link href="/patient/register" className="font-semibold text-teal-600 hover:text-teal-700">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
