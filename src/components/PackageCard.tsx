import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock, MessageCircle, Utensils } from "lucide-react";
import type { HealthPackage } from "@/data/packages";
import { getWhatsappUrl } from "@/lib/utils";

export function PackageCard({ healthPackage }: { healthPackage: HealthPackage }) {
  return (
    <article className="card-premium group flex h-full flex-col overflow-hidden">
      <div className="border-b border-slate-100 bg-white p-4">
        {healthPackage.highlight ? (
          <p className="mb-3 inline-flex rounded-[8px] bg-white px-3 py-1 text-xs font-semibold text-teal-800 shadow-sm">
            {healthPackage.highlight}
          </p>
        ) : null}
        <h3 className="text-2xl font-semibold text-slate-950">
          {healthPackage.name}
        </h3>
        <p className="mt-2 text-sm font-medium text-teal-800">
          Ideal for: {healthPackage.idealFor}
        </p>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p className="text-sm leading-6 text-slate-600">
          {healthPackage.description}
        </p>
        <div className="mt-5 grid gap-2 text-sm text-slate-700">
          {healthPackage.includedTests.slice(0, 4).map((item) => (
            <div key={item} className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-teal-700" aria-hidden="true" />
              <span>{item}</span>
            </div>
          ))}
          {healthPackage.includedTests.length > 4 && (
            <p className="text-xs text-slate-400 mt-1">+{healthPackage.includedTests.length - 4} more</p>
          )}
        </div>
        <dl className="mt-5 grid gap-3 rounded-[8px] bg-slate-50 p-4 text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <Utensils className="size-4 text-teal-700" aria-hidden="true" />
            <dt className="sr-only">Fasting</dt>
            <dd>Fasting: {healthPackage.fasting}</dd>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="size-4 text-teal-700" aria-hidden="true" />
            <dt className="sr-only">Report time</dt>
            <dd>{healthPackage.reportTime}</dd>
          </div>
          <div className="font-semibold text-slate-950">{healthPackage.price}</div>
        </dl>
        <div className="mt-auto grid gap-3 pt-6 sm:grid-cols-2">
          <Link href={`/packages/${healthPackage.slug}`} className="btn-secondary justify-center">
            View Package
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
          <a
            href={getWhatsappUrl(
              `Hello Nova Diagnostics, I would like to book the ${healthPackage.name}.`,
            )}
            className="btn-primary justify-center"
          >
            <MessageCircle className="size-4" aria-hidden="true" />
            Book
          </a>
        </div>
      </div>
    </article>
  );
}
