import { AlertTriangle } from "lucide-react";

type DisclaimerBoxProps = {
  children?: React.ReactNode;
};

export function DisclaimerBox({ children }: DisclaimerBoxProps) {
  return (
    <aside className="rounded-[8px] border border-amber-200 bg-amber-50/80 p-5 text-sm leading-6 text-amber-950">
      <div className="flex gap-3">
        <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-700" aria-hidden="true" />
        <div>
          <p className="font-semibold">Medical information disclaimer</p>
          <p className="mt-1">
            {children ??
              "Information on this website is for general awareness only and should not replace advice from a qualified doctor."}
          </p>
        </div>
      </div>
    </aside>
  );
}
