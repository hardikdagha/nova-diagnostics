import { ClipboardCheck, Headphones, Home, Microscope } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { teamMembers } from "@/data/team";

const roleIcons = {
  "Lab Team": Microscope,
  "Sample Collection Team": Home,
  "Patient Support": Headphones,
  "Reporting and Coordination": ClipboardCheck,
};

export function TeamSection() {
  const visibleMembers = teamMembers.filter((member) => member.showOnWebsite);

  return (
    <section className="section-pad">
      <div className="container-page">
        <SectionHeading
          eyebrow="Our Team"
          title="Careful coordination behind every report"
          description="Behind every report is a team focused on careful sample handling, clear communication, and patient support."
          align="center"
        />
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {visibleMembers.map((member) => {
            const Icon = roleIcons[member.role as keyof typeof roleIcons] ?? Microscope;

            return (
              <article key={member.role} className="card-premium p-5">
                <span className="flex size-12 items-center justify-center rounded-[8px] bg-cyan-50 text-teal-700">
                  <Icon className="size-6" aria-hidden="true" />
                </span>
                <h3 className="mt-5 text-lg font-semibold text-slate-950">
                  {member.role}
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {member.shortBio}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
