import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  variant?: "header" | "footer" | "feature";
  className?: string;
};

export function BrandLogo({ variant = "header", className }: BrandLogoProps) {
  if (variant === "header") {
    const logo = (
      <span
        className={cn("inline-flex flex-col items-start", className)}
        role="img"
        aria-label="Nova Diagnostics logo"
      >
        <span className="relative block h-8 w-[130px] sm:h-9 sm:w-[158px]">
          <Image
            src="/images/nova-logo.jpg"
            alt="NOVA"
            fill
            sizes="(min-width: 640px) 158px, 130px"
            className="object-contain object-left"
            priority
            unoptimized
          />
        </span>
        <span
          aria-hidden="true"
          className="mt-0.5 block font-semibold uppercase leading-none tracking-[0.32em] text-slate-600 text-[10px] sm:text-[11px]"
        >
          Diagnostics
        </span>
        <span
          aria-hidden="true"
          className="hidden sm:flex mt-1 items-center gap-1.5 leading-none text-slate-400 text-[8px]"
        >
          <span className="h-px w-5 bg-slate-300" />
          Committed to Care!
          <span className="h-px w-5 bg-slate-300" />
        </span>
      </span>
    );

    return (
      <Link href="/" aria-label="Nova Diagnostics home" className="inline-flex">
        {logo}
      </Link>
    );
  }

  /* footer and feature — use the full stacked logo PNG */
  const sizes =
    variant === "feature"
      ? "(min-width: 640px) 260px, 220px"
      : "120px";
  const boxSize =
    variant === "feature"
      ? "w-[220px] sm:w-[260px]"
      : "w-[120px]";

  const logo = (
    <span
      className={cn("inline-block", boxSize, className)}
      role="img"
      aria-label="Nova Diagnostics – Committed to Care!"
    >
      <Image
        src="/images/nova-logo-full.png"
        alt="Nova Diagnostics – Committed to Care!"
        width={2000}
        height={2000}
        sizes={sizes}
        className="w-full object-contain"
        unoptimized
      />
    </span>
  );

  if (variant === "feature") {
    return logo;
  }

  return (
    <Link href="/" aria-label="Nova Diagnostics home" className="inline-flex">
      {logo}
    </Link>
  );
}
