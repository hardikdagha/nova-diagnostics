import type { LucideIcon } from "lucide-react";

type TrustBadgeProps = {
  icon: LucideIcon;
  label: string;
  description?: string;
};

export function TrustBadge({ icon: Icon, label, description }: TrustBadgeProps) {
  return (
    <div className="flex items-start gap-3 rounded-[8px] border border-cyan-100 bg-white/85 p-4 shadow-sm shadow-slate-200/70 backdrop-blur">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-[8px] bg-cyan-50 text-teal-700">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <span>
        <span className="block text-sm font-semibold text-slate-950">{label}</span>
        {description ? (
          <span className="mt-1 block text-sm leading-5 text-slate-600">
            {description}
          </span>
        ) : null}
      </span>
    </div>
  );
}
