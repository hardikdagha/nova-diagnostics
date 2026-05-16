import type { Metadata } from "next";
import { CheckCircle2, HeartHandshake, MapPin, Microscope, Phone, Timer } from "lucide-react";
import { MedicalLeadership } from "@/components/people/MedicalLeadership";
import { TeamSection } from "@/components/people/TeamSection";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { CTASection } from "@/components/ui/CTASection";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TrustBadge } from "@/components/ui/TrustBadge";
import { siteConfig } from "@/config/site";
import { getCallUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "About Nova Diagnostics",
  description:
    "Learn about Nova Diagnostics, a diagnostic laboratory in Vashi, Navi Mumbai focused on blood tests, health checkups, clear communication and patient support.",
  alternates: {
    canonical: "/about",
  },
};

const focusAreas = [
  "Careful sample handling",
  "Timely reporting focus",
  "Clean processes",
  "Clear communication",
  "Convenient testing",
];

export default function AboutPage() {
  return (
    <>
      <section className="bg-[linear-gradient(135deg,#FFFEFB_0%,#EAF8F9_100%)] py-12 md:py-16">
        <div className="container-page">
          <Breadcrumbs items={[{ label: "About" }]} />
          <div className="grid gap-8 lg:grid-cols-[1fr_0.75fr] lg:items-center">
            <div className="max-w-4xl">
              <p className="text-sm font-semibold uppercase text-teal-700">
                About Nova Diagnostics
              </p>
              <h1 className="mt-3 text-balance text-4xl font-semibold leading-tight text-slate-950 md:text-5xl">
                Diagnostic care shaped by trust, clarity and local accessibility
              </h1>
              <p className="mt-5 text-lg leading-8 text-slate-600">
                Nova Diagnostics supports families in Vashi and nearby Navi Mumbai areas with blood tests, health checkups, home sample collection and practical prescription support.
              </p>
              <a href={getCallUrl()} className="btn-primary mt-7">
                <Phone className="size-4" aria-hidden="true" />
                Call {siteConfig.displayPhone}
              </a>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-2">
              {[
                ["34+", "Years of service"],
                ["Vashi", "Navi Mumbai"],
                ["Home", "Sample collection"],
                ["Digital", "Report delivery"],
              ].map(([val, lbl]) => (
                <div key={lbl} className="rounded-xl border border-teal-100 bg-white/60 p-5 text-center backdrop-blur">
                  <p className="text-2xl font-bold text-[#061A33]">{val}</p>
                  <p className="mt-1 text-sm text-slate-600">{lbl}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section-pad">
        <div className="container-page grid gap-10 lg:grid-cols-[1fr_0.9fr] lg:items-center">
          <div>
            <SectionHeading
              eyebrow="Our Approach to Diagnostic Care"
              title="Simple booking, clear information and patient-first support"
              description="Our focus is on what patients need: clear test information, simple booking, prescription guidance, home collection and friendly support at every step."
            />
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <TrustBadge icon={Microscope} label="Quality-focused diagnostic services" />
              <TrustBadge icon={MapPin} label="Convenient Vashi location" />
              <TrustBadge icon={Timer} label="Timely reporting focus" />
              <TrustBadge icon={HeartHandshake} label="Patient-first support" />
            </div>
            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {[
                "Blood tests and routine diagnostics",
                "Health packages and preventive checkups",
                "Home sample collection",
                "Prescription support and test identification",
                "Digital report sharing",
                "Patient-friendly booking support",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 rounded-lg border border-slate-100 bg-white px-4 py-3 text-sm font-medium text-slate-700">
                  <CheckCircle2 className="size-4 shrink-0 text-teal-700" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="hidden lg:block" />
        </div>
      </section>

      <MedicalLeadership />

      <TeamSection />

      <section className="section-pad bg-white">
        <div className="container-page grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
          <SectionHeading
            eyebrow="Quality, Care and Patient Support"
            title="Built around calm processes and clear communication"
            description="At Nova Diagnostics, every process is shaped by patient comfort, careful sample handling, timely reporting and clear communication."
          />
          <div className="flex flex-wrap gap-2">
            {focusAreas.map((item) => (
              <span key={item} className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700">
                <CheckCircle2 className="size-3.5 shrink-0 text-teal-700" aria-hidden="true" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad">
        <div className="container-page">
          <div className="card-premium divide-y divide-slate-100 overflow-hidden">
            <div className="flex gap-6 p-6 md:p-8">
              <MapPin className="mt-1 size-8 shrink-0 text-teal-700" aria-hidden="true" />
              <div>
                <h2 className="text-xl font-semibold text-slate-950">
                  Location and Accessibility
                </h2>
                <p className="mt-3 leading-7 text-slate-600">
                  {siteConfig.address}
                </p>
              </div>
            </div>
            <div className="flex gap-6 p-6 md:p-8">
              <HeartHandshake className="mt-1 size-8 shrink-0 text-teal-700" aria-hidden="true" />
              <div>
                <h2 className="text-xl font-semibold text-slate-950">
                  Support for local patients
                </h2>
                <p className="mt-3 leading-7 text-slate-600">
                  Patients can call, WhatsApp, upload prescriptions, request home collection and get directions without navigating a complex portal.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <CTASection
        title="Visit or book with Nova Diagnostics"
        description="Use WhatsApp, call, booking forms or directions to connect with the lab team."
      />
    </>
  );
}
