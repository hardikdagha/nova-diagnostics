"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { TestCard } from "@/components/TestCard";
import { type LabTest, testCategories } from "@/data/tests";
import { cn } from "@/lib/utils";

export function TestExplorer({ tests }: { tests: LabTest[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<(typeof testCategories)[number]>("All");

  const visibleTests = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return tests.filter((test) => {
      const matchesCategory = category === "All" || test.category === category;
      const matchesQuery =
        !normalized ||
        `${test.name} ${test.category} ${test.description} ${test.sampleType}`
          .toLowerCase()
          .includes(normalized);

      return matchesCategory && matchesQuery;
    });
  }, [category, query, tests]);

  return (
    <div className="space-y-8">
      <div className="card-premium p-4 md:p-5">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-teal-700" aria-hidden="true" />
          <span className="sr-only">Search tests</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="min-h-14 w-full rounded-[8px] border border-slate-200 bg-white pl-12 pr-4 text-base outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
            placeholder="Search by test name, category or sample type"
          />
        </label>
        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {testCategories.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setCategory(item)}
              className={cn(
                "shrink-0 rounded-[8px] border px-4 py-2 text-sm font-semibold transition",
                category === item
                  ? "border-teal-700 bg-teal-700 text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:border-teal-200 hover:bg-cyan-50 hover:text-teal-800",
              )}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-medium text-slate-600">
          Showing {visibleTests.length} test{visibleTests.length === 1 ? "" : "s"}
        </p>
      </div>
      {visibleTests.length ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {visibleTests.map((test) => (
            <TestCard key={test.slug} test={test} />
          ))}
        </div>
      ) : (
        <div className="rounded-[8px] border border-slate-200 bg-white p-8 text-center">
          <p className="font-semibold text-slate-950">No tests found</p>
          <p className="mt-2 text-sm text-slate-600">
            Try a different search term or contact the lab with your prescription.
          </p>
        </div>
      )}
    </div>
  );
}
