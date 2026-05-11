import type { Metadata } from "next";
import { CheckCircle2, ClipboardList, FileText, HeartHandshake, Home, MapPin, Microscope, Phone, Timer } from "lucide-react";
import { MedicalLeadership } from "@/components/people/MedicalLeadership";
import { TeamSection } from "@/components/people/TeamSection";
import { BrandLogo } from "@/components/ui/BrandLogo";
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
            <div className="card-premium p-6">
              <BrandLogo variant="feature" />
              <p className="mt-5 text-sm leading-6 text-slate-600">
                Nova Diagnostics is a pathology and diagnostics laboratory in Vashi, Navi Mumbai, focused on clear test information, patient support and quality diagnostic services.
              </p>
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
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="card-premium flex flex-col gap-3 p-6">
              <span className="flex size-11 items-center justify-center rounded-[8px] bg-cyan-50 text-teal-700">
                <Microscope className="size-6" aria-hidden="true" />
              </span>
              <h3 className="text-lg font-semibold text-slate-950">Diagnostic laboratory</h3>
              <p className="text-sm leading-6 text-slate-600">
                Blood tests, health packages and routine diagnostic services for patients in Vashi and nearby Navi Mumbai areas.
              </p>
            </div>
            <div className="card-premium flex flex-col gap-3 p-6">
              <span className="flex size-11 items-center justify-center rounded-[8px] bg-cyan-50 text-teal-700">
                <Home className="size-6" aria-hidden="true" />
              </span>
              <h3 className="text-lg font-semibold text-slate-950">Home sample collection</h3>
              <p className="text-sm leading-6 text-slate-600">
                Convenient home collection across selected Navi Mumbai areas including Vashi, Sanpada, Nerul and more.
              </p>
            </div>
            <div className="card-premium flex flex-col gap-3 p-6">
              <span className="flex size-11 items-center justify-center rounded-[8px] bg-cyan-50 text-teal-700">
                <FileText className="size-6" aria-hidden="true" />
              </span>
              <h3 className="text-lg font-semibold text-slate-950">Digital reports</h3>
              <p className="text-sm leading-6 text-slate-600">
                Reports can be shared digitally through defined lab processes for convenient access from home.
              </p>
            </div>
            <div className="card-premium flex flex-col gap-3 p-6">
              <span className="flex size-11 items-center justify-center rounded-[8px] bg-cyan-50 text-teal-700">
                <ClipboardList className="size-6" aria-hidden="true" />
              </span>
              <h3 className="text-lg font-semibold text-slate-950">Prescription support</h3>
              <p className="text-sm leading-6 text-slate-600">
                Upload your prescription and our team helps identify the required tests and assists with booking.
              </p>
            </div>
          </div>
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
          <div className="grid gap-4 sm:grid-cols-2">
            {focusAreas.map((item) => (
              <div key={item} className="card-premium flex items-center gap-3 p-5">
                <CheckCircle2 className="size-5 shrink-0 text-teal-700" aria-hidden="true" />
                <span className="font-semibold text-slate-950">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad">
        <div className="container-page grid gap-8 lg:grid-cols-2">
          <div className="card-premium p-6 md:p-8">
            <MapPin className="size-10 text-teal-700" aria-hidden="true" />
            <h2 className="mt-4 text-2xl font-semibold text-slate-950">
              Location and Accessibility
            </h2>
            <p className="mt-4 leading-7 text-slate-600">
              {siteConfig.address}
            </p>
          </div>
          <div className="card-premium p-6 md:p-8">
            <HeartHandshake className="size-10 text-teal-700" aria-hidden="true" />
            <h2 className="mt-4 text-2xl font-semibold text-slate-950">
              Support for local patients
            </h2>
            <p className="mt-4 leading-7 text-slate-600">
              Patients can call, WhatsApp, upload prescriptions, request home collection and get directions without navigating a complex portal.
            </p>
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
