import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Phone } from "lucide-react";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/**
 * Patient portal layout.
 * Minimal header: logo + "Patient Portal" status badge.
 * No marketing chrome (no footer, no sticky CTA).
 */
export default function PatientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f6f8fa]">
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur">
        <div className="container-page flex min-h-[68px] items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <Link href="/" aria-label="Nova Diagnostics home" className="shrink-0">
            <Image
              src="/images/nova-logo-cropped.webp"
              alt="Nova Diagnostics — Committed to Care!"
              width={800}
              height={353}
              sizes="(min-width: 640px) 168px, 142px"
              className="h-auto w-[128px] object-contain object-left sm:w-[156px]"
              priority
              unoptimized
            />
            </Link>
            <span className="hidden h-8 border-l border-slate-200 sm:block" aria-hidden="true" />
            <span className="hidden text-xs font-semibold text-slate-600 sm:block">Patient portal</span>
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-5">
            <a
              href={`tel:${siteConfig.phone}`}
              className="inline-flex size-10 items-center justify-center rounded-md text-slate-600 transition hover:bg-slate-100 hover:text-[#061a33] sm:h-auto sm:w-auto sm:gap-2 sm:px-2 sm:py-2"
              aria-label={`Call Nova Diagnostics at ${siteConfig.displayPhone}`}
              title={`Call ${siteConfig.displayPhone}`}
            >
              <Phone className="size-[17px] text-teal-700" aria-hidden="true" />
              <span className="hidden text-xs font-medium text-slate-600 sm:inline">{siteConfig.displayPhone}</span>
            </a>
            <Link
              href="/"
              aria-label="Visit the Nova Diagnostics main website"
              className="inline-flex min-h-10 items-center gap-1.5 rounded-md px-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-[#061a33]"
            >
              <span className="hidden sm:inline">Nova website</span>
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
