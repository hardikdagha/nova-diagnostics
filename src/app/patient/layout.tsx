import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

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
    <div className="min-h-screen bg-[#F8FAFB]">
      <header className="border-b border-slate-200 bg-white shadow-sm">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/images/nova-logo-cropped.webp"
              alt="Nova Diagnostics"
              width={120}
              height={53}
              className="h-7 w-auto object-contain"
              unoptimized
            />
          </Link>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-200 bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-700">
            <span className="size-1.5 rounded-full bg-teal-500" aria-hidden="true" />
            Patient Portal
          </span>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
