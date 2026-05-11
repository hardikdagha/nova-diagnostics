import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

type Breadcrumb = {
  label: string;
  href?: string;
};

export function Breadcrumbs({
  items,
  tone = "light",
}: {
  items: Breadcrumb[];
  tone?: "light" | "dark";
}) {
  const isDark = tone === "dark";

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn(
        "mb-8 flex items-center gap-2 text-sm",
        isDark ? "text-cyan-100" : "text-slate-500",
      )}
    >
      <Link
        href="/"
        className={cn(
          "inline-flex items-center gap-1",
          isDark ? "hover:text-white" : "hover:text-teal-700",
        )}
      >
        <Home className="size-4" aria-hidden="true" />
        Home
      </Link>
      {items.map((item) => (
        <span key={item.label} className="inline-flex items-center gap-2">
          <ChevronRight
            className={cn("size-4", isDark ? "text-cyan-200" : "text-slate-400")}
            aria-hidden="true"
          />
          {item.href ? (
            <Link
              href={item.href}
              className={isDark ? "hover:text-white" : "hover:text-teal-700"}
            >
              {item.label}
            </Link>
          ) : (
            <span className={cn("font-medium", isDark ? "text-white" : "text-slate-800")}>
              {item.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}
