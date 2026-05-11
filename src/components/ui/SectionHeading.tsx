import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  level?: "h1" | "h2";
  className?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  level = "h2",
  className,
}: SectionHeadingProps) {
  const TitleTag = level;

  return (
    <div
      className={cn(
        "max-w-3xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      {eyebrow ? (
        <p className="mb-3 text-sm font-semibold uppercase text-teal-700">
          {eyebrow}
        </p>
      ) : null}
      <TitleTag className="text-balance text-3xl font-semibold leading-tight text-slate-950 md:text-4xl">
        {title}
      </TitleTag>
      {description ? (
        <p className="mt-4 text-pretty text-base leading-7 text-slate-600 md:text-lg">
          {description}
        </p>
      ) : null}
    </div>
  );
}
