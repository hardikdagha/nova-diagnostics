import Image from "next/image";
import Link from "next/link";

export default function ReportLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="flex h-14 items-center px-4">
          <Link href="/">
            <Image
              src="/images/nova-logo-cropped.png"
              alt="Nova Diagnostics"
              width={120}
              height={53}
              className="h-7 w-auto object-contain"
              unoptimized
            />
          </Link>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
