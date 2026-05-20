"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { staffSupabase as supabase } from "@/lib/supabase/staffClient";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { inputClass, labelClass, errorClass } from "@/components/forms/formStyles";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError || !data.session) {
      setError("Invalid email or password.");
      setLoading(false);
      return;
    }

    // Verify user is staff or admin
    const { data: staffRow } = await supabase
      .from("staff_users")
      .select("id")
      .eq("user_id", data.session.user.id)
      .eq("active", true)
      .maybeSingle();

    if (!staffRow) {
      await supabase.auth.signOut({ scope: "local" });
      setError("You do not have staff access. Please contact the administrator.");
      setLoading(false);
      return;
    }

    router.replace("/admin/dashboard/");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex size-12 items-center justify-center rounded-xl bg-[#061A33] text-white">
            <Lock className="size-6" />
          </div>
          <h1 className="text-2xl font-semibold text-slate-950">Staff Login</h1>
          <p className="mt-1 text-sm text-slate-500">Nova Diagnostics — Staff Portal</p>
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
                placeholder="staff@novadiagnosticslab.com"
                autoComplete="email"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className={labelClass}>Password</label>
            <div className="relative mt-1.5">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`${inputClass} pr-10`}
                placeholder="••••••••"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}
              </button>
            </div>
          </div>

          {error && <p className={errorClass}>{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-400">
          Contact the lab administrator for access.
        </p>
      </div>
    </div>
  );
}
