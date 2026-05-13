"use client";

/**
 * /auth/callback — Supabase magic-link / OTP callback handler.
 *
 * Static-export compatible (client-side only).
 *
 * Supabase sends patients here after they click the login link in their email.
 * With PKCE flow (default in @supabase/supabase-js v2):
 *   URL contains ?code=xxx  → call exchangeCodeForSession(code)
 * With implicit flow (legacy):
 *   URL hash contains #access_token=xxx → Supabase client auto-detects
 *
 * After session is established, redirect to /patient/dashboard.
 *
 * NOTE (MVP): Supabase's built-in email service is used for sending login links.
 * For production reliability, configure Zoho SMTP or another SMTP provider in
 * Supabase → Project Settings → Auth → SMTP Settings.
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { XCircle } from "lucide-react";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  useEffect(() => {
    void (async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      const errorParam = params.get("error");
      const errorDescription = params.get("error_description");

      if (errorParam) {
        // Await before setState so it isn't synchronous in the effect body
        await Promise.resolve();
        setError(errorDescription ?? "Authentication failed. Please try again.");
        return;
      }

      if (code) {
        // PKCE flow: exchange one-time code for a session
        const { error: err } = await supabase.auth.exchangeCodeForSession(code);
        if (err) {
          setError("This login link has expired or already been used. Please request a new one.");
        } else {
          router.replace("/patient/dashboard");
        }
      } else {
        // Implicit flow: Supabase client auto-reads access_token from URL hash
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          router.replace("/patient/dashboard");
        } else {
          setError("This login link has expired or already been used. Please request a new one.");
        }
      }
    })();
  }, [router]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-sm text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-rose-100">
            <XCircle className="size-8 text-rose-500" />
          </div>
          <h1 className="text-xl font-semibold text-slate-950">Link expired</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">{error}</p>
          <Link
            href="/patient/login"
            className="btn-primary mt-6 inline-flex items-center justify-center"
          >
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-[#061A33]" />
        <p className="mt-4 text-sm text-slate-500">Signing you in…</p>
      </div>
    </div>
  );
}
