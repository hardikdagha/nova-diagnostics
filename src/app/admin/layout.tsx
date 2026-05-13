"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Activity, FileText, LogOut, Menu, Upload, X } from "lucide-react";

const NAV = [
  { href: "/admin/dashboard", label: "Dashboard", icon: Activity },
  { href: "/admin/reports", label: "Reports", icon: FileText },
  { href: "/admin/reports/upload", label: "Upload Report", icon: Upload },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [staffEmail, setStaffEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        router.replace("/admin/login");
        return;
      }
      // Verify staff/admin role
      const { data } = await supabase
        .from("staff_users")
        .select("id")
        .eq("user_id", session.user.id)
        .eq("active", true)
        .maybeSingle();

      if (!data) {
        await supabase.auth.signOut();
        router.replace("/admin/login");
        return;
      }
      setStaffEmail(session.user.email ?? null);
      setChecking(false);
    });
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace("/admin/login");
  };

  // Login page renders without the chrome
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-[#061A33]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white shadow-sm">
        <div className="flex h-14 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3">
            <button
              className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 md:hidden"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
            <span className="font-semibold text-[#061A33]">Nova Diagnostics</span>
            <span className="hidden rounded bg-[#061A33]/10 px-2 py-0.5 text-xs font-semibold text-[#061A33] sm:inline">
              Staff Portal
            </span>
          </div>
          <div className="flex items-center gap-3">
            {staffEmail && (
              <span className="hidden text-xs text-slate-500 sm:inline">{staffEmail}</span>
            )}
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
            >
              <LogOut className="size-4" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
        {/* Mobile nav */}
        {menuOpen && (
          <nav className="border-t border-slate-100 bg-white px-4 py-2 md:hidden">
            {NAV.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium ${
                  pathname?.startsWith(href)
                    ? "bg-[#061A33]/5 text-[#061A33]"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Icon className="size-4" />
                {label}
              </Link>
            ))}
          </nav>
        )}
      </header>

      <div className="flex">
        {/* Sidebar — desktop */}
        <aside className="hidden w-56 shrink-0 border-r border-slate-200 bg-white md:flex md:flex-col">
          <nav className="flex flex-col gap-1 p-3 pt-4">
            {NAV.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  pathname?.startsWith(href)
                    ? "bg-[#061A33] text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Icon className="size-4" />
                {label}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Page content */}
        <main className="min-h-[calc(100vh-3.5rem)] flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
