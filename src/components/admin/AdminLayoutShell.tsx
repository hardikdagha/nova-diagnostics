"use client";

import { Fragment, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { staffSupabase } from "@/lib/supabase/staffClient";
import { Activity, ClipboardList, FileText, Home, LogOut, Menu, ScrollText, Upload, X } from "lucide-react";

/** Reports and Upload-Report share a prefix — only highlight "Reports" on the exact path. */
function isActiveLink(href: string, pathname: string | null): boolean {
  if (!pathname) return false;
  const path = pathname.replace(/\/$/, "");
  if (href === "/admin/reports") return path === "/admin/reports";
  return path.startsWith(href);
}

const NAV = [
  { href: "/admin/dashboard",             label: "Dashboard",             icon: Activity },
  { href: "/admin/reports",               label: "Reports",               icon: FileText },
  { href: "/admin/reports/upload",        label: "Upload Report",         icon: Upload },
  { href: "/admin/home-collections",      label: "Home Collections",      icon: Home },
  { href: "/admin/prescription-requests", label: "Prescription Requests", icon: ScrollText },
  { href: "/admin/enquiries",             label: "Enquiries",             icon: ClipboardList },
];

export default function AdminLayoutShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [staffEmail, setStaffEmail] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    // Verifies the signed-in user is an active staff member.
    // Called both on INITIAL_SESSION and SIGNED_IN events so that:
    //   1. Refresh/hard-load: existing session is checked immediately.
    //   2. Post-login navigation: SIGNED_IN fires and content loads without a
    //      manual page refresh (fixes the "spinner until refresh" bug).
    const verifyStaff = async (userId: string, email: string | undefined) => {
      const { data } = await staffSupabase
        .from("staff_users")
        .select("id")
        .eq("user_id", userId)
        .eq("active", true)
        .maybeSingle();

      if (!mounted) return;

      if (!data) {
        // Authenticated but not a staff member — sign out and redirect.
        await staffSupabase.auth.signOut();
        router.replace("/admin/login/");
        setChecking(false);
        return;
      }

      setStaffEmail(email ?? null);
      setChecking(false);
    };

    // onAuthStateChange fires INITIAL_SESSION synchronously on subscribe,
    // so we always get the initial state without a separate getSession() call.
    // It also fires SIGNED_IN after a successful login, which is what resolves
    // the loading bug: the effect runs once (on mount), and the listener
    // handles all subsequent auth transitions without needing a re-mount.
    const { data: { subscription } } = staffSupabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;

        if (
          session &&
          (event === "INITIAL_SESSION" ||
            event === "SIGNED_IN" ||
            event === "TOKEN_REFRESHED")
        ) {
          void verifyStaff(session.user.id, session.user.email);
        } else if (event === "INITIAL_SESSION" && !session) {
          // No staff session on first load.
          setChecking(false);
          const currentPath = (
            typeof window !== "undefined" ? window.location.pathname : ""
          ).replace(/\/$/, "");
          if (currentPath !== "/admin/login") {
            router.replace("/admin/login/");
          }
        } else if (event === "SIGNED_OUT") {
          setStaffEmail(null);
          setChecking(false);
          router.replace("/admin/login/");
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [router]);

  const handleSignOut = async () => {
    // Signs out only the staff session (nova-staff-auth).
    // The patient session (nova-patient-auth) is untouched.
    await staffSupabase.auth.signOut();
    router.replace("/admin/login/");
  };

  // Login page renders without the admin chrome.
  // Strip trailing slash for comparison because trailingSlash:true in next.config
  // makes usePathname() return "/admin/login/" (with slash) on static export.
  const normalizedPath = pathname?.replace(/\/$/, "") ?? "";
  if (normalizedPath === "/admin/login") {
    return <>{children}</>;
  }

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-[#061A33]" />
      </div>
    );
  }

  const emailInitial = staffEmail ? staffEmail[0].toUpperCase() : "S";

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white shadow-sm">
        <div className="flex h-14 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3">
            <button
              className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 md:hidden"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
            </button>
            <div className="flex items-center gap-2">
              <Activity className="size-4 text-[#061A33]" />
              <span className="font-semibold text-[#061A33]">Nova Diagnostics</span>
            </div>
            <span className="hidden rounded bg-[#061A33]/8 px-2 py-0.5 text-[11px] font-semibold text-[#061A33] sm:inline">
              Staff Portal
            </span>
          </div>
          <div className="flex items-center gap-3">
            {staffEmail && (
              <>
                <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#061A33] text-xs font-bold text-white">
                  {emailInitial}
                </div>
                <span className="hidden text-xs text-slate-500 sm:inline">{staffEmail}</span>
              </>
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
                  isActiveLink(href, pathname)
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
        <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-60 shrink-0 flex-col overflow-y-auto border-r border-slate-200 bg-white md:flex">
          <nav className="flex flex-col gap-1 p-3 pt-4">
            {NAV.map(({ href, label, icon: Icon }, i) => (
              <Fragment key={href}>
                {/* Visual separator before the "Requests" group */}
                {i === 3 && (
                  <div className="mx-1 mt-2 mb-1">
                    <div className="border-t border-slate-100" />
                    <p className="mt-2 px-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                      Requests
                    </p>
                  </div>
                )}
                <Link
                  href={href}
                  className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActiveLink(href, pathname)
                      ? "bg-[#061A33] text-white shadow-sm"
                      : "text-slate-600 hover:bg-[#061A33]/5 hover:text-[#061A33]"
                  }`}
                >
                  <Icon className="size-4" />
                  {label}
                </Link>
              </Fragment>
            ))}
          </nav>
          <div className="mt-auto border-t border-slate-100 p-3">
            {staffEmail && (
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-xs text-slate-400">{staffEmail}</span>
                <button
                  onClick={handleSignOut}
                  className="shrink-0 rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                  aria-label="Sign out"
                >
                  <LogOut className="size-3.5" aria-hidden="true" />
                </button>
              </div>
            )}
          </div>
        </aside>

        {/* Page content */}
        <main className="min-h-[calc(100vh-3.5rem)] flex-1 overflow-auto p-5 md:p-6">{children}</main>
      </div>
    </div>
  );
}
