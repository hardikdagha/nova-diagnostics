"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { Mail } from "lucide-react";
import { inputClass, labelClass, errorClass } from "@/components/forms/formStyles";

export default function PatientLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/patient/dashboard`,
      },
    });

    if (authError) {
      setError("Could not send login link. Please check your email and try again.");
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
            We sent a login link to <strong>{email}</strong>. Tap it to sign in — no password needed.
          </p>
          <button onClick={() => setSent(false)} className="mt-6 text-sm text-slate-400 hover:text-slate-600">
            Use a different email
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold text-slate-950">Patient login</h1>
          <p className="mt-1 text-sm text-slate-500">
            Sign in to view your reports and health history
          </p>
        </div>

        <form onSubmit={handleLogin} className="card-premium space-y-4 p-6">
          <div>
            <label htmlFor="email" className={labelClass}>Email address</label>
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

          <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60">
            {loading ? "Sending link…" : "Send login link"}
          </button>

          <p className="text-center text-xs text-slate-400">
            We'll send a magic link to your email — no password required.
          </p>
        </form>

        <p className="mt-5 text-center text-sm text-slate-500">
          Don't have an account?{" "}
          <Link href="/patient/register" className="font-medium text-teal-600 hover:text-teal-700">
            Register
          </Link>
        </p>

        <p className="mt-4 text-center text-xs text-slate-400">
          Need your report without logging in?{" "}
          <Link href="/reports" className="underline">
            Find report
          </Link>
        </p>
      </div>
    </div>
  );
}
