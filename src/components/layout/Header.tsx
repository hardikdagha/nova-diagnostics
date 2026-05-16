"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  MapPin,
  Menu,
  Phone,
  User,
  X,
} from "lucide-react";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { siteConfig } from "@/config/site";
import { cn, getCallUrl } from "@/lib/utils";
import { supabase } from "@/lib/supabase/client";

/** Marketing navigation — same 6 items as before, no patient-portal link here */
const navigation = [
  { label: "Tests", href: "/tests" },
  { label: "Packages", href: "/packages" },
  { label: "Home Collection", href: "/home-sample-collection" },
  { label: "Upload Prescription", href: "/upload-prescription" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export function Header() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  /**
   * Auth-aware patient portal label.
   * Defaults to false (correct for all public visitors).
   * Switches after hydration once Supabase confirms a session.
   */
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    void supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });
    return () => subscription.unsubscribe();
  }, []);

  const patientHref  = isLoggedIn ? "/patient/dashboard" : "/patient/login";
  const patientLabel = isLoggedIn ? "My Reports" : "Patient Login";
  const isPatientRoute = pathname.startsWith("/patient") || pathname.startsWith("/auth");

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/92 shadow-sm shadow-slate-200/50 backdrop-blur-xl">
      {/* Top info bar */}
      <div className="border-b border-slate-100 bg-[#061A33] text-white">
        <div className="container-page flex min-h-9 flex-wrap items-center justify-center gap-x-5 gap-y-2 py-2 text-xs font-medium md:justify-between">
          <span className="inline-flex items-center gap-2">
            <MapPin className="size-3.5 text-cyan-200" aria-hidden="true" />
            {siteConfig.area}, {siteConfig.city}
          </span>
          <span className="hidden sm:inline">Home sample collection available</span>
          <a href={getCallUrl()} className="inline-flex items-center gap-2 hover:text-cyan-100">
            <Phone className="size-3.5 text-cyan-200" aria-hidden="true" />
            Call: {siteConfig.displayPhone}
          </a>
        </div>
      </div>

      {/* Main nav row */}
      <div className="container-page flex min-h-20 items-center justify-between gap-4">
        <BrandLogo variant="header" />

        {/* Desktop marketing nav — original items, whitespace-nowrap to prevent wrapping */}
        <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Main navigation">
          {navigation.map((item) => {
            const active =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "whitespace-nowrap rounded-[8px] px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-cyan-50 hover:text-teal-800",
                  active && "bg-[#061A33]/8 text-[#061A33]",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Desktop right-side: Patient Login only — hero has Book Test / WhatsApp */}
        <div className="hidden items-center lg:flex">
          <Link
            href={patientHref}
            className={cn(
              "flex items-center gap-1.5 whitespace-nowrap rounded-[8px] px-4 py-2 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-900",
              isPatientRoute && "bg-slate-100 text-slate-900",
            )}
          >
            <User className="size-4" aria-hidden="true" />
            {patientLabel}
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          className="inline-flex size-11 items-center justify-center rounded-[8px] border border-slate-200 text-slate-900 lg:hidden"
          onClick={() => setIsOpen((v) => !v)}
          aria-label="Toggle navigation menu"
          aria-expanded={isOpen}
        >
          {isOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="border-t border-slate-100 bg-white lg:hidden">
          <nav className="container-page grid gap-1 py-4" aria-label="Mobile navigation">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-[8px] px-3 py-3.5 text-sm font-semibold text-slate-700 hover:bg-cyan-50 hover:text-teal-800"
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </Link>
            ))}

            {/* Patient portal in mobile menu */}
            <Link
              href={patientHref}
              className={cn(
                "flex items-center gap-2 rounded-[8px] px-3 py-3.5 text-sm font-semibold text-teal-700 hover:bg-teal-50",
                isPatientRoute && "bg-teal-50",
              )}
              onClick={() => setIsOpen(false)}
            >
              <User className="size-4" aria-hidden="true" />
              {isLoggedIn ? "Patient Dashboard" : "Patient Login"}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
