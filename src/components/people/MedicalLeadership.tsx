import { DoctorCard } from "@/components/people/DoctorCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { siteConfig } from "@/config/site";

export function MedicalLeadership({ preview = false }: { preview?: boolean }) {
  return (
    <section id="medical-leadership" className="section-pad bg-white">
      <div className="container-page">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            eyebrow="Medical Leadership"
            title="Doctor-guided diagnostic care."
            description={
              preview
                ? "Meet the doctors who guide Nova Diagnostics, bringing careful focus to diagnostic accuracy and patient care."
                : "Nova Diagnostics works with medical leadership focused on accurate diagnostics, clear processes, and patient-centred support."
            }
          />
        </div>
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {siteConfig.doctors.map((doctor) => (
            <DoctorCard key={doctor.name} doctor={doctor} />
          ))}
        </div>
      </div>
    </section>
  );
}
