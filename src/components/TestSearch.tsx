"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import type { LabTest } from "@/data/tests";

export function TestSearch({ tests }: { tests: LabTest[] }) {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    if (!normalized) {
      return tests.slice(0, 6);
    }

    return tests
      .filter((test) =>
        `${test.name} ${test.category} ${test.description}`
          .toLowerCase()
          .includes(normalized),
      )
      .slice(0, 6);
  }, [query, tests]);

  return (
    <div className="card-premium p-4 md:p-5">
      <label className="relative block">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-teal-700" aria-hidden="true" />
        <span className="sr-only">Search tests</span>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="min-h-14 w-full rounded-[8px] border border-slate-200 bg-white pl-12 pr-4 text-base outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
          placeholder="Search CBC, Thyroid, Vitamin D, HbA1c, Lipid Profile..."
        />
      </label>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {results.map((test) => (
          <Link
            key={test.slug}
            href={`/tests/${test.slug}`}
            className="rounded-[8px] border border-slate-200 bg-slate-50 p-4 transition hover:border-teal-200 hover:bg-cyan-50"
          >
            <span className="block text-sm font-semibold text-slate-950">{test.name}</span>
            <span className="mt-1 block text-xs text-slate-500">
              {test.sampleType} / Fasting: {test.fasting}
            </span>
          </Link>
        ))}
      </div>
      <Link href="/tests" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-teal-800 hover:text-teal-950">
        View full test catalogue
        <ArrowRight className="size-4" aria-hidden="true" />
      </Link>
    </div>
  );
}
