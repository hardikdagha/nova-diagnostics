import type { Metadata } from "next";
import { CheckCircle2, HeartHandshake, MapPin, Microscope, Phone, Timer } from "lucide-react";
import { MedicalLeadership } from "@/components/people/MedicalLeadership";
import { TeamSection } from "@/components/people/TeamSection";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { CTASection } from "@/components/ui/CTASection";
import { PhotoPlaceholder } from "@/components/ui/PhotoPlaceholder";
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
                {siteConfig.tagline} is used as the guiding tone for this website: calm, helpful and easy for patients to act on.
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
              description="The website focuses on what patients need before a lab visit: test information, preparation, home collection, prescription support, contact details and directions."
            />
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <TrustBadge icon={Microscope} label="Quality-focused diagnostic services" />
              <TrustBadge icon={MapPin} label="Convenient Vashi location" />
              <TrustBadge icon={Timer} label="Timely reporting focus" />
              <TrustBadge icon={HeartHandshake} label="Patient-first support" />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <PhotoPlaceholder label="Add reception photo" />
            <PhotoPlaceholder label="Add sample collection area photo" />
            <PhotoPlaceholder label="Add lab exterior photo" />
            <PhotoPlaceholder label="Add team photo" />
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
            description="Medical claims, accreditations and credentials should only be expanded after Nova Diagnostics verifies and approves the exact wording."
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
