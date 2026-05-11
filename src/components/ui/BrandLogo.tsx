import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  variant?: "header" | "footer" | "feature";
  className?: string;
};

const logoStyles = {
  header: {
    wrapper: "w-[158px] sm:w-[190px]",
    wordmark: "h-8 sm:h-9",
    diagnostics: "text-[11px] sm:text-[13px]",
    tagline: "hidden text-[8px] sm:flex",
    sizes: "(min-width: 640px) 190px, 158px",
  },
  footer: {
    wrapper: "w-[235px]",
    wordmark: "h-12",
    diagnostics: "text-lg",
    tagline: "flex text-xs",
    sizes: "235px",
  },
  feature: {
    wrapper: "w-[300px] max-w-full sm:w-[360px]",
    wordmark: "h-16 sm:h-20",
    diagnostics: "text-2xl sm:text-3xl",
    tagline: "flex text-sm sm:text-base",
    sizes: "(min-width: 640px) 360px, 300px",
  },
};

export function BrandLogo({ variant = "header", className }: BrandLogoProps) {
  const style = logoStyles[variant];

  const logo = (
    <span
      className={cn("inline-flex flex-col items-start", style.wrapper, className)}
      role="img"
      aria-label="Nova Diagnostics logo"
    >
      <span className={cn("relative block w-full overflow-hidden", style.wordmark)}>
        <Image
          src={siteConfig.logoImage}
          alt="Nova Diagnostics logo"
          fill
          sizes={style.sizes}
          className="object-contain object-left"
          priority={variant === "header"}
          unoptimized
        />
      </span>
      <span
        aria-hidden="true"
        className={cn(
          "mt-0.5 block w-full font-medium uppercase leading-none text-[#655963] tracking-[0.34em]",
          style.diagnostics,
        )}
      >
        Diagnostics
      </span>
      <span
        aria-hidden="true"
        className={cn(
          "mt-1 items-center gap-2 font-medium leading-none text-[#655963]",
          style.tagline,
        )}
      >
        <span className="h-px w-8 bg-[#655963]/35" />
        {siteConfig.tagline}
        <span className="h-px w-8 bg-[#655963]/35" />
      </span>
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
