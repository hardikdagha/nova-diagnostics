"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type FAQItem = {
  question: string;
  answer: string;
};

export function FAQAccordion({ items }: { items: FAQItem[] }) {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="divide-y divide-slate-200 overflow-hidden rounded-[8px] border border-slate-200 bg-white shadow-sm shadow-slate-200/60">
      {items.map((item, index) => {
        const isOpen = openIndex === index;

        return (
          <div key={item.question}>
            <button
              type="button"
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-base font-semibold text-slate-950 transition hover:bg-slate-50"
              onClick={() => setOpenIndex(isOpen ? -1 : index)}
              aria-expanded={isOpen}
            >
              <span>{item.question}</span>
              <ChevronDown
                className={cn(
                  "size-5 shrink-0 text-teal-700 transition-transform",
                  isOpen && "rotate-180",
                )}
                aria-hidden="true"
              />
            </button>
            {isOpen ? (
              <div className="px-5 pb-5 text-sm leading-6 text-slate-600">
                {item.answer}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
