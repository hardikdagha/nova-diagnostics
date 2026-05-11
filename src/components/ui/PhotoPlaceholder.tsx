import { Camera } from "lucide-react";

type PhotoPlaceholderProps = {
  label: string;
};

export function PhotoPlaceholder({ label }: PhotoPlaceholderProps) {
  return (
    <div className="flex min-h-48 items-center justify-center rounded-[8px] border border-cyan-100 bg-cyan-50/60 p-6 text-center">
      <div>
        <Camera className="mx-auto size-8 text-teal-600" aria-hidden="true" />
        <p className="mt-3 text-sm font-semibold text-slate-700">{label}</p>
      </div>
    </div>
  );
}
