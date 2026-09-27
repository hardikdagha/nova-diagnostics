"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Activity,
  CalendarDays,
  ChevronRight,
  ClipboardList,
  FileText,
  Home,
  LogOut,
  MapPin,
  Menu,
  Search,
  ScrollText,
  Upload,
  X,
  type LucideIcon,
} from "lucide-react";
import { siteConfig } from "@/config/site";
import { staffSupabase } from "@/lib/supabase/staffClient";

type QueueCounts = {
  homeCollections: number;
  prescriptions: number;
  enquiries: number;
};

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  countKey?: keyof QueueCounts;
};

const NAV_GROUPS: Array<{ label: string; items: NavItem[] }> = [
  {
    label: "Workspace",
    items: [
      { href: "/admin/dashboard", label: "Overview", icon: Activity },
      { href: "/admin/reports", label: "Reports", icon: FileText },
      { href: "/admin/reports/upload", label: "Upload report", icon: Upload },
    ],
  },
  {
    label: "Patient requests",
    items: [
      { href: "/admin/home-collections", label: "Home collections", icon: Home, countKey: "homeCollections" as const },
      { href: "/admin/prescription-requests", label: "Prescription requests", icon: ScrollText, countKey: "prescriptions" as const },
      { href: "/admin/enquiries", label: "Enquiries", icon: ClipboardList, countKey: "enquiries" as const },
    ],
  },
  {
    label: "Visibility",
    items: [{ href: "/admin/activity", label: "Activity", icon: CalendarDays }],
  },
];

function isActiveLink(href: string, pathname: string | null) {
  if (!pathname) return false;
  const path = pathname.replace(/\/$/, "");
  if (href === "/admin/reports") return path === href;
  return path === href || path.startsWith(`${href}/`);
}

function formatBusinessDate() {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());
}

export default function AdminLayoutShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const isPreviewRoute = process.env.NODE_ENV === "development" && pathname?.replace(/\/$/, "") === "/admin/dashboard-preview";
  const [checking, setChecking] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [staffEmail, setStaffEmail] = useState<string | null>(null);
  const [businessDate, setBusinessDate] = useState("");
  const [businessDateShort, setBusinessDateShort] = useState("");
  const [queueCounts, setQueueCounts] = useState<QueueCounts>({
    homeCollections: 0,
    prescriptions: 0,
    enquiries: 0,
  });

  useEffect(() => {
    let mounted = true;

    if (isPreviewRoute) {
      return () => {
        mounted = false;
      };
    }

    const verifyStaff = async (userId: string, email: string | undefined) => {
      const { data } = await staffSupabase
        .from("staff_users")
        .select("id")
        .eq("user_id", userId)
        .eq("active", true)
        .maybeSingle();

      if (!mounted) return;

      if (!data) {
        await staffSupabase.auth.signOut({ scope: "local" });
        router.replace("/admin/login/");
        setChecking(false);
        return;
      }

      setStaffEmail(email ?? null);
      setChecking(false);
    };

    const { data: { subscription } } = staffSupabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;

        if (
          session &&
          (event === "INITIAL_SESSION" || event === "SIGNED_IN" || event === "TOKEN_REFRESHED")
        ) {
          void verifyStaff(session.user.id, session.user.email);
        } else if (event === "INITIAL_SESSION" && !session) {
          setChecking(false);
          const currentPath = window.location.pathname.replace(/\/$/, "");
          if (currentPath !== "/admin/login") router.replace("/admin/login/");
        } else if (event === "SIGNED_OUT") {
          setStaffEmail(null);
          setChecking(false);
          router.replace("/admin/login/");
        }
      },
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [isPreviewRoute, router]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setBusinessDate(formatBusinessDate());
      setBusinessDateShort(new Intl.DateTimeFormat("en-IN", {
        timeZone: "Asia/Kolkata",
        weekday: "short",
        day: "numeric",
        month: "short",
      }).format(new Date()));
    }, 0);
    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!staffEmail || isPreviewRoute) return;
    let active = true;

    const loadQueueCounts = async () => {
      const [home, prescriptions, enquiries] = await Promise.all([
        staffSupabase.from("home_collection_requests").select("id", { count: "exact", head: true }).eq("status", "New"),
        staffSupabase.from("prescription_requests").select("id", { count: "exact", head: true }).eq("status", "New"),
        staffSupabase.from("contact_enquiries").select("id", { count: "exact", head: true }).eq("status", "New"),
      ]);

      if (!active || home.error || prescriptions.error || enquiries.error) return;
      setQueueCounts({
        homeCollections: home.count ?? 0,
        prescriptions: prescriptions.count ?? 0,
        enquiries: enquiries.count ?? 0,
      });
    };

    void loadQueueCounts();
    const interval = setInterval(() => void loadQueueCounts(), 60_000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [isPreviewRoute, staffEmail]);

  const handleSignOut = async () => {
    await staffSupabase.auth.signOut({ scope: "local" });
    router.replace("/admin/login/");
  };

  const normalizedPath = pathname?.replace(/\/$/, "") ?? "";
  const activePath = isPreviewRoute ? "/admin/dashboard" : pathname;
  const displayStaffEmail = isPreviewRoute ? "Local design preview" : staffEmail;
  if (normalizedPath === "/admin/login") return <>{children}</>;

  const navigation = (
    <nav className="space-y-7 px-3" aria-label="Staff navigation">
      {NAV_GROUPS.map((group) => (
        <div key={group.label}>
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
            {group.label}
          </p>
          <div className="space-y-1">
              {group.items.map(({ href, label, icon: Icon, countKey }) => {
              const active = isActiveLink(href, activePath);
              const count = countKey ? queueCounts[countKey] : 0;

              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={`group relative flex min-h-11 items-center gap-3 rounded-md px-3 text-[13px] font-medium transition-colors ${
                    active
                      ? "bg-white/10 text-white"
                      : "text-slate-300 hover:bg-white/[0.06] hover:text-white"
                  }`}
                >
                  {active ? <span className="absolute inset-y-2 left-0 w-[2px] rounded-r bg-teal-300" /> : null}
                  <Icon className={`size-[17px] shrink-0 ${active ? "text-teal-200" : "text-slate-400 group-hover:text-slate-200"}`} aria-hidden="true" />
                  <span className="min-w-0 flex-1 truncate">{label}</span>
                  {countKey ? (
                    <span className={`min-w-6 rounded px-1.5 py-0.5 text-center text-[11px] tabular-nums ${count > 0 ? "bg-teal-300/15 font-semibold text-teal-100" : "text-slate-500"}`}>
                      {count}
                    </span>
                  ) : null}
                  {active ? <ChevronRight className="size-3.5 text-slate-400" aria-hidden="true" /> : null}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );

  if (checking && !isPreviewRoute) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f6f8]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-teal-700" />
      </div>
    );
  }

  const emailInitial = displayStaffEmail?.trim()[0]?.toUpperCase() ?? "S";

  return (
    <div className="min-h-screen bg-[#f4f6f8] text-slate-900">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[264px] flex-col border-r border-white/5 bg-[#071a2b] text-white lg:flex">
        <div className="px-5 pb-6 pt-5">
          <div className="rounded-md bg-white px-3 py-2">
            <Image
              src="/images/nova-logo-cropped.webp"
              alt="Nova Diagnostics — Committed to Care!"
              width={800}
              height={353}
              sizes="212px"
              className="h-auto w-full object-contain"
              priority
              unoptimized
            />
          </div>
          <div className="mt-4 flex items-center justify-between px-1">
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-300">Staff workspace</span>
            <span className="size-1.5 rounded-full bg-emerald-400" aria-label="Connected" />
          </div>
        </div>

        <div className="mb-5 mx-4 h-px bg-white/10" />
        {navigation}

        <div className="mt-auto border-t border-white/10 px-4 py-4">
          <div className="flex items-center gap-3 rounded-md px-2 py-2">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-white/10 text-sm font-semibold text-white">
              {emailInitial}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-xs font-medium text-slate-200">{isPreviewRoute ? "Preview mode" : "Signed in"}</span>
              <span className="mt-0.5 block truncate text-[11px] text-slate-400">{displayStaffEmail}</span>
            </span>
            {isPreviewRoute ? null : <button
              type="button"
              onClick={handleSignOut}
              className="flex size-8 items-center justify-center rounded-md text-slate-400 transition hover:bg-white/10 hover:text-white"
              aria-label="Sign out"
              title="Sign out"
            >
              <LogOut className="size-4" aria-hidden="true" />
            </button>}
          </div>
          <p className="px-2 pt-2 text-[10px] text-slate-500">Nova Diagnostics · Vashi</p>
        </div>
      </aside>

      {menuOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/55"
            aria-label="Close navigation menu"
            onClick={() => setMenuOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 flex w-[min(84vw,300px)] flex-col bg-[#071a2b] text-white shadow-2xl">
            <div className="flex items-center justify-between px-4 pb-5 pt-4">
              <div className="w-[196px] rounded-md bg-white px-3 py-2">
                <Image src="/images/nova-logo-cropped.webp" alt="Nova Diagnostics — Committed to Care!" width={800} height={353} sizes="196px" className="h-auto w-full object-contain" unoptimized />
              </div>
              <button type="button" onClick={() => setMenuOpen(false)} className="flex size-10 items-center justify-center rounded-md text-slate-300 hover:bg-white/10 hover:text-white" aria-label="Close navigation menu">
                <X className="size-5" aria-hidden="true" />
              </button>
            </div>
            <div className="mb-5 mx-4 h-px bg-white/10" />
            {navigation}
            <div className="mt-auto border-t border-white/10 px-4 py-4">
              <p className="truncate text-xs text-slate-300">{displayStaffEmail}</p>
              {isPreviewRoute ? null : <button type="button" onClick={handleSignOut} className="mt-3 inline-flex items-center gap-2 text-xs font-medium text-slate-300 hover:text-white">
                <LogOut className="size-4" aria-hidden="true" /> Sign out
              </button>}
            </div>
          </aside>
        </div>
      ) : null}

      <div className="min-h-screen lg:pl-[264px]">
        <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/95 backdrop-blur">
          <div className="flex min-h-[72px] items-center gap-3 px-4 sm:px-6 xl:px-8">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="flex size-10 shrink-0 items-center justify-center rounded-md border border-slate-200 text-slate-700 hover:bg-slate-50 lg:hidden"
              aria-label="Open navigation menu"
              aria-expanded={menuOpen}
            >
              <Menu className="size-5" aria-hidden="true" />
            </button>

            <form action="/admin/reports" method="get" role="search" className="relative min-w-0 max-w-[620px] flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 size-[17px] -translate-y-1/2 text-slate-400" aria-hidden="true" />
              <input
                type="search"
                name="q"
                aria-label="Search patient, report number or test"
                placeholder="Search patient, report number or test…"
                className="h-11 w-full rounded-md border border-slate-200 bg-slate-50/70 pl-10 pr-4 text-[13px] text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:bg-white focus:ring-2 focus:ring-teal-600/10"
              />
            </form>

            <div className="hidden items-center gap-2 border-l border-slate-200 pl-4 text-[12px] font-medium text-slate-600 sm:flex">
              <MapPin className="size-4 text-teal-700" aria-hidden="true" />
              <span>{siteConfig.area}, {siteConfig.city}</span>
            </div>
            <div className="hidden items-center gap-2 border-l border-slate-200 pl-4 text-[12px] text-slate-500 xl:flex">
              <CalendarDays className="size-4 text-slate-500" aria-hidden="true" />
              <span>{businessDate || "Vashi laboratory"}</span>
            </div>
            <div className="ml-auto flex min-w-0 items-center gap-2 border-l border-slate-200 pl-3 sm:gap-3 sm:pl-4">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#0b2b45] text-xs font-semibold text-white">
                {emailInitial}
              </span>
              <span className="hidden min-w-0 sm:block">
                <span className="block text-xs font-semibold text-slate-800">{isPreviewRoute ? "Preview mode" : "Staff account"}</span>
                <span className="mt-0.5 block max-w-[190px] truncate text-[11px] text-slate-500">{displayStaffEmail}</span>
              </span>
              {isPreviewRoute ? null : <button type="button" onClick={handleSignOut} className="flex size-9 shrink-0 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 lg:hidden" aria-label="Sign out" title="Sign out">
                <LogOut className="size-4" aria-hidden="true" />
              </button>}
            </div>
          </div>
          <div className="flex items-center justify-between border-t border-slate-100 bg-[#fbfcfd] px-4 py-2 text-[11px] text-slate-500 sm:hidden">
            <span className="inline-flex items-center gap-1.5"><MapPin className="size-3.5 text-teal-700" aria-hidden="true" />{siteConfig.area}, {siteConfig.city}</span>
            <span className="whitespace-nowrap">{businessDateShort}</span>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1700px] px-4 py-6 sm:px-6 sm:py-7 xl:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
