import { Camera } from "lucide-react";

type PhotoPlaceholderProps = {
  label: string;
};

export function PhotoPlaceholder({ label }: PhotoPlaceholderProps) {
  return (
    <div className="flex min-h-48 items-center justify-center rounded-[8px] border border-dashed border-cyan-200 bg-cyan-50/70 p-6 text-center">
      <div>
        <Camera className="mx-auto size-8 text-teal-700" aria-hidden="true" />
        <p className="mt-3 text-sm font-semibold text-slate-950">{label}</p>
        <p className="mt-1 text-xs leading-5 text-slate-500">
          Replace with real lab photography after the new location shoot.
        </p>
      </div>
    </div>
  );
}
