import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/**
 * Patient portal layout.
 * Minimal header: logo + "My Reports" label.
 * No marketing chrome (no footer, no sticky CTA).
 */
export default function PatientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="flex h-14 items-center justify-between px-4">
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
          <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            My Reports
          </span>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
