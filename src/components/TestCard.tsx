import Link from "next/link";
import { ArrowRight, Clock, Droplets, Home, MessageCircle, Utensils } from "lucide-react";
import type { LabTest } from "@/data/tests";
import { getWhatsappUrl } from "@/lib/utils";

export function TestCard({ test }: { test: LabTest }) {
  return (
    <article className="card-premium group flex h-full flex-col p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase text-teal-700">
            {test.category}
          </p>
          <h3 className="mt-2 text-xl font-semibold text-slate-950">
            {test.name}
          </h3>
        </div>
        <span className="rounded-[8px] bg-cyan-50 px-3 py-1 text-xs font-semibold text-teal-800">
          {test.price}
        </span>
      </div>
      <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
        {test.description}
      </p>
      <dl className="mt-5 grid gap-3 text-sm text-slate-600">
        <div className="flex items-center gap-2">
          <Droplets className="size-4 text-teal-700" aria-hidden="true" />
          <dt className="sr-only">Sample type</dt>
          <dd>{test.sampleType}</dd>
        </div>
        <div className="flex items-center gap-2">
          <Utensils className="size-4 text-teal-700" aria-hidden="true" />
          <dt className="sr-only">Fasting</dt>
          <dd>Fasting: {test.fasting}</dd>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="size-4 text-teal-700" aria-hidden="true" />
          <dt className="sr-only">Report time</dt>
          <dd>{test.reportTime}</dd>
        </div>
        {test.homeCollection ? (
          <div className="flex items-center gap-2">
            <Home className="size-4 text-teal-700" aria-hidden="true" />
            <dt className="sr-only">Home collection</dt>
            <dd>Home collection available</dd>
          </div>
        ) : null}
      </dl>
      <div className="mt-auto flex items-center justify-between gap-3 pt-5">
        <Link
          href={`/tests/${test.slug}`}
          className="flex items-center gap-1 text-sm font-semibold text-teal-700 hover:underline"
        >
          View Details
          <ArrowRight className="size-3.5" aria-hidden="true" />
        </Link>
        <a
          href={getWhatsappUrl(
            `Hello Nova Diagnostics, I would like to book ${test.name}.`,
          )}
          className="btn-primary px-4 py-2 text-sm"
        >
          <MessageCircle className="size-3.5" aria-hidden="true" />
          Book
        </a>
      </div>
    </article>
  );
}
