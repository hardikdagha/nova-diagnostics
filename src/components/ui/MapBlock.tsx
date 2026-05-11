import Link from "next/link";
import { MapPin, Navigation } from "lucide-react";
import { siteConfig } from "@/config/site";
import { getDirectionsUrl } from "@/lib/utils";

export function MapBlock({ compact = false }: { compact?: boolean }) {
  return (
    <div className="overflow-hidden rounded-[8px] border border-slate-200 bg-white shadow-sm shadow-slate-200/70">
      <div className={compact ? "p-5" : "p-6 md:p-8"}>
        <div className="flex items-start gap-4">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-[8px] bg-cyan-50 text-teal-700">
            <MapPin className="size-6" aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-semibold uppercase text-teal-700">
              Visit the lab
            </p>
            <h3 className="mt-1 text-xl font-semibold text-slate-950">
              Nova Diagnostics, Vashi
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {siteConfig.address}
            </p>
          </div>
        </div>
      </div>
      <div className="map-grid flex min-h-64 items-center justify-center border-y border-slate-200 bg-cyan-50/70 p-6 text-center">
        <div>
          <p className="font-semibold text-slate-950">Google Maps embed placeholder</p>
          <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">
            The exact map embed can be added later. Directions currently use the lab address as a safe fallback.
          </p>
        </div>
      </div>
      <div className={compact ? "p-5" : "p-6"}>
        <Link href={getDirectionsUrl()} className="btn-primary w-full" target="_blank">
          <Navigation className="size-4" aria-hidden="true" />
          Get Directions
        </Link>
      </div>
    </div>
  );
}
