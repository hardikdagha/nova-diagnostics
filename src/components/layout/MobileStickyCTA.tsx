import Link from "next/link";
import { CalendarCheck, MapPinned, MessageCircle, Phone } from "lucide-react";
import { getCallUrl, getDirectionsUrl, getWhatsappUrl } from "@/lib/utils";

export function MobileStickyCTA() {
  const items = [
    { label: "Call", href: getCallUrl(), icon: Phone },
    { label: "WhatsApp", href: getWhatsappUrl(), icon: MessageCircle },
    { label: "Book", href: "/contact", icon: CalendarCheck },
    { label: "Directions", href: getDirectionsUrl(), icon: MapPinned, external: true },
  ];

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 shadow-2xl shadow-slate-900/15 backdrop-blur-xl lg:hidden">
      <div className="grid grid-cols-4">
        {items.map((item) => {
          const Icon = item.icon;
          const className =
            "flex min-h-16 flex-col items-center justify-center gap-1 text-xs font-semibold text-slate-700 hover:bg-cyan-50 hover:text-teal-800";

          if (item.external) {
            return (
              <a key={item.label} href={item.href} target="_blank" className={className}>
                <Icon className="size-5" aria-hidden="true" />
                {item.label}
              </a>
            );
          }

          if (item.href.startsWith("/")) {
            return (
              <Link key={item.label} href={item.href} className={className}>
                <Icon className="size-5" aria-hidden="true" />
                {item.label}
              </Link>
            );
          }

          return (
            <a key={item.label} href={item.href} className={className}>
              <Icon className="size-5" aria-hidden="true" />
              {item.label}
            </a>
          );
        })}
      </div>
    </div>
  );
}
