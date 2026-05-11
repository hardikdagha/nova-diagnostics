import { Star } from "lucide-react";

export function ReviewCTA() {
  return (
    <div className="rounded-[8px] border border-cyan-100 bg-gradient-to-br from-white to-cyan-50 p-6 shadow-sm shadow-slate-200/70">
      <div className="flex items-center gap-2 text-amber-500" aria-hidden="true">
        {Array.from({ length: 5 }).map((_, index) => (
          <Star key={index} className="size-5 fill-current" />
        ))}
      </div>
      <h3 className="mt-4 text-xl font-semibold text-slate-950">
        Visited Nova Diagnostics?
      </h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        Share your experience on Google once the public listing for the new lab location is ready.
      </p>
    </div>
  );
}
