"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  CalendarCheck,
  MapPin,
  Menu,
  MessageCircle,
  Phone,
  X,
} from "lucide-react";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { siteConfig } from "@/config/site";
import { cn, getCallUrl, getWhatsappUrl } from "@/lib/utils";

const navigation = [
  { label: "Home", href: "/" },
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

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/92 shadow-sm shadow-slate-200/50 backdrop-blur-xl">
      <div className="border-b border-slate-100 bg-[#061A33] text-white">
        <div className="container-page flex min-h-9 flex-wrap items-center justify-center gap-x-5 gap-y-2 py-2 text-xs font-medium md:justify-between">
          <span className="inline-flex items-center gap-2">
            <MapPin className="size-3.5 text-cyan-200" aria-hidden="true" />
            {siteConfig.area}, {siteConfig.city}
          </span>
          <span>Home sample collection available</span>
          <a href={getCallUrl()} className="inline-flex items-center gap-2 hover:text-cyan-100">
            <Phone className="size-3.5 text-cyan-200" aria-hidden="true" />
            Call: {siteConfig.displayPhone}
          </a>
        </div>
      </div>
      <div className="container-page flex min-h-20 items-center justify-between gap-4">
        <BrandLogo variant="header" />

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main navigation">
          {navigation.map((item) => {
            const active =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-[8px] px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-cyan-50 hover:text-teal-800",
                  active && "bg-cyan-50 text-teal-800",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <a href={getWhatsappUrl()} className="btn-secondary">
            <MessageCircle className="size-4" aria-hidden="true" />
            WhatsApp
          </a>
          <Link href="/contact" className="btn-primary">
            <CalendarCheck className="size-4" aria-hidden="true" />
            Book Test
          </Link>
        </div>

        <button
          type="button"
          className="inline-flex size-11 items-center justify-center rounded-[8px] border border-slate-200 text-slate-900 lg:hidden"
          onClick={() => setIsOpen((value) => !value)}
          aria-label="Toggle navigation menu"
          aria-expanded={isOpen}
        >
          {isOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {isOpen ? (
        <div className="border-t border-slate-100 bg-white lg:hidden">
          <nav className="container-page grid gap-1 py-4" aria-label="Mobile navigation">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-[8px] px-3 py-3 text-sm font-semibold text-slate-700 hover:bg-cyan-50 hover:text-teal-800"
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <a href={getWhatsappUrl()} className="btn-secondary justify-center">
                <MessageCircle className="size-4" aria-hidden="true" />
                WhatsApp
              </a>
              <Link href="/contact" className="btn-primary justify-center" onClick={() => setIsOpen(false)}>
                <CalendarCheck className="size-4" aria-hidden="true" />
                Book Test
              </Link>
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
