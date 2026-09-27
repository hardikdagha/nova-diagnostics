"use client";

/**
 * Patient sign-in remains email-based and passwordless. Supabase sends the
 * existing one-time login link, which returns through /auth/callback.
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { patientSupabase as supabase } from "@/lib/supabase/patientClient";
import { ArrowRight, CheckCircle2, FileSearch, LockKeyhole, Mail, Phone, ShieldCheck } from "lucide-react";
import { siteConfig } from "@/config/site";
import { inputClass, labelClass, errorClass } from "@/components/forms/formStyles";

const signInSteps = [
  { title: "Enter your email", detail: "Use the address you shared with Nova Diagnostics." },
  { title: "Open your secure link", detail: "We will send a one-time sign-in link to your inbox." },
  { title: "View your reports", detail: "Return here to access reports linked to that email." },
];

export default function PatientLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace("/patient/dashboard");
    });
  }, [router]);

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { error: authError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: "https://novadiagnosticslab.com/auth/callback/",
        },
      });

      if (authError) {
        if (authError.message.toLowerCase().includes("redirect")) {
          setError("Login link could not be sent. Please contact Nova Diagnostics support.");
        } else if (authError.message.toLowerCase().includes("rate")) {
          setError("Too many attempts. Please wait a few minutes and try again.");
        } else {
          setError(`Could not send login link: ${authError.message}`);
        }
        return;
      }

      setSent(true);
    } catch {
      setError("We could not connect just now. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto grid min-h-[calc(100svh-4.25rem)] max-w-6xl grid-cols-1 items-center gap-8 px-4 py-6 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:py-12">
      <section className="hidden flex-col justify-center lg:flex">
        <div className="max-w-xl">
          <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-teal-800">
            <span className="h-px w-6 bg-teal-600" aria-hidden="true" />
            Patient access
          </p>
          <h2 className="mt-4 max-w-lg text-[34px] font-semibold leading-[1.14] text-[#061a33] sm:text-[42px]">
            Your reports, in one clear place.
          </h2>
          <p className="mt-4 max-w-lg text-[15px] leading-7 text-slate-600">
            Sign in with your email to view and download reports linked to your Nova Diagnostics account.
          </p>

          <ol className="mt-8 space-y-5">
            {signInSteps.map((step, index) => (
              <li key={step.title} className="flex items-start gap-3.5">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-md border border-teal-100 bg-white text-xs font-semibold tabular-nums text-teal-800">
                  0{index + 1}
                </span>
                <span className="pt-0.5">
                  <span className="block text-sm font-semibold text-slate-800">{step.title}</span>
                  <span className="mt-1 block text-xs leading-5 text-slate-500">{step.detail}</span>
                </span>
              </li>
            ))}
          </ol>

          <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-slate-200 pt-5">
            <span className="inline-flex items-center gap-2 text-xs font-medium text-slate-500">
              <ShieldCheck className="size-4 text-teal-700" aria-hidden="true" />
              Password-free sign-in
            </span>
            <a href={`tel:${siteConfig.phone}`} className="inline-flex items-center gap-2 text-xs font-semibold text-[#0b2b45] hover:text-teal-800">
              <Phone className="size-3.5 text-teal-700" aria-hidden="true" />
              Need help? {siteConfig.displayPhone}
            </a>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[470px] lg:order-2" aria-label="Patient sign in">
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_18px_50px_rgba(6,26,51,0.08)]">
          <div className="h-1 bg-teal-600" />
          <div className="p-5 sm:p-8">
            {sent ? (
              <div role="status" aria-live="polite" className="py-1">
                <div className="flex size-12 items-center justify-center rounded-md bg-teal-50 text-teal-800">
                  <Mail className="size-6" aria-hidden="true" />
                </div>
                <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.1em] text-teal-800">Email sent</p>
                <h1 className="mt-2 text-[25px] font-semibold leading-tight text-[#061a33]">Check your inbox</h1>
                <p className="mt-2 text-sm leading-6 text-slate-600">Your secure sign-in link was sent to:</p>
                <p className="mt-3 break-all rounded-md border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm font-semibold text-slate-800">{email}</p>

                <div className="mt-6 space-y-3">
                  {[
                    "Open the email from Nova Diagnostics.",
                    "Tap the sign-in link in that message.",
                    "You will return here signed in.",
                  ].map((step) => (
                    <p key={step} className="flex items-start gap-2.5 text-xs leading-5 text-slate-600">
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-teal-700" aria-hidden="true" />
                      {step}
                    </p>
                  ))}
                </div>

                <p className="mt-5 border-l-2 border-amber-300 bg-amber-50 px-3 py-2.5 text-xs leading-5 text-amber-900">
                  If it is not in your inbox, check your spam or junk folder.
                </p>
                <button
                  type="button"
                  onClick={() => setSent(false)}
                  className="mt-5 min-h-10 text-sm font-semibold text-teal-800 underline decoration-teal-200 underline-offset-4 hover:text-teal-950"
                >
                  Use a different email
                </button>
              </div>
            ) : (
              <>
                <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-teal-800">Secure patient portal</p>
                <h1 className="mt-2 text-[25px] font-semibold leading-tight text-[#061a33]">Access your reports</h1>
                <p className="mt-2 text-sm leading-6 text-slate-500">We will email you a one-time link. No password needed.</p>

                <form onSubmit={handleLogin} className="mt-6">
                  <label htmlFor="patient-email" className={labelClass}>Email address</label>
                  <div className="relative mt-2">
                    <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                    <input
                      id="patient-email"
                      type="email"
                      required
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      className={`${inputClass} pl-10`}
                      placeholder="you@example.com"
                      autoComplete="email"
                      inputMode="email"
                    />
                  </div>

                  {error ? <p role="alert" className={`${errorClass} mt-3`}>{error}</p> : null}

                  <button type="submit" disabled={loading} className="btn-primary mt-5 w-full justify-center gap-2 disabled:cursor-wait disabled:opacity-60">
                    {loading ? (
                      <>
                        <span className="inline-block size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                        Sending link…
                      </>
                    ) : (
                      <>
                        Email me a sign-in link
                        <ArrowRight className="size-4" aria-hidden="true" />
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-5 flex items-start gap-2.5 border-t border-slate-100 pt-4 text-xs leading-5 text-slate-500">
                  <LockKeyhole className="mt-0.5 size-4 shrink-0 text-teal-700" aria-hidden="true" />
                  <p>Use the same email address you shared with the lab so your reports can be matched to your account.</p>
                </div>
              </>
            )}
          </div>
        </div>

        {!sent ? (
          <>
            <div className="mt-3 flex flex-col gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3.5 sm:flex-row sm:items-center">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-slate-50 text-slate-600">
                <FileSearch className="size-[18px]" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-slate-800">Have a report number?</span>
                <span className="mt-0.5 block text-xs text-slate-500">Find a report without signing in.</span>
              </span>
              <Link href="/reports" className="btn-secondary min-h-10 w-full px-3 py-2 text-xs sm:w-auto">
                Find a report
                <ArrowRight className="size-3.5" aria-hidden="true" />
              </Link>
            </div>
            <p className="mt-5 text-center text-xs text-slate-600">
              New patient? <Link href="/patient/register" className="font-semibold text-teal-800 underline decoration-teal-200 underline-offset-4 hover:text-teal-950">Create an account</Link>
            </p>
            <p className="mt-3 text-center text-xs text-slate-600">
              Need help? <a href={`tel:${siteConfig.phone}`} className="font-semibold text-teal-800 underline decoration-teal-200 underline-offset-4">Call {siteConfig.displayPhone}</a>
            </p>
          </>
        ) : null}
      </section>
    </div>
  );
}
