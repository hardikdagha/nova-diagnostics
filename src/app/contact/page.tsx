import type { Metadata } from "next";
import { Mail, MapPin, MessageCircle, Phone, Timer, UserRound } from "lucide-react";
import { ContactForm } from "@/components/forms/ContactForm";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { DisclaimerBox } from "@/components/ui/DisclaimerBox";
import { MapBlock } from "@/components/ui/MapBlock";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { siteConfig } from "@/config/site";
import { getCallUrl, getDirectionsUrl, getDoctorCallUrl, getWhatsappUrl, safeJsonLd } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Contact Nova Diagnostics",
  description:
    "Contact Nova Diagnostics in Vashi, Navi Mumbai for test booking, home sample collection, prescription upload help, packages and directions.",
  alternates: {
    canonical: "/contact",
  },
};

const contactItems = [
  { label: "Address", value: siteConfig.address, icon: MapPin },
  { label: "Primary booking/contact", value: siteConfig.displayPhone, icon: Phone, href: getCallUrl() },
  { label: "WhatsApp", value: `Message Nova Diagnostics on ${siteConfig.displayPhone}`, icon: MessageCircle, href: getWhatsappUrl() },
  { label: "Email", value: siteConfig.email, icon: Mail },
  { label: "Timings", value: siteConfig.timings, icon: Timer },
];

export default function ContactPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MedicalBusiness",
    name: siteConfig.businessName,
    url: siteConfig.url,
    telephone: siteConfig.phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: siteConfig.address,
      addressLocality: "Navi Mumbai",
      addressRegion: siteConfig.state,
      postalCode: siteConfig.postalCode,
      addressCountry: siteConfig.country,
    },
    areaServed: siteConfig.serviceAreas,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
      />
      <section className="bg-[linear-gradient(135deg,#FAFCFD_0%,#E6F7FA_100%)] py-12 md:py-16">
        <div className="container-page">
          <Breadcrumbs items={[{ label: "Contact" }]} />
          <SectionHeading
            eyebrow="Contact / Visit Lab"
            level="h1"
            title="Book tests, get directions or request home collection"
            description="Use the main lab number for bookings, WhatsApp support, prescription help, package inquiries and home sample collection."
          />
          <div className="mt-7 flex flex-wrap gap-3">
            <a href={getCallUrl()} className="btn-primary">
              <Phone className="size-4" aria-hidden="true" />
              Call Nova Diagnostics
            </a>
            <a href={getWhatsappUrl()} className="btn-secondary">
              <MessageCircle className="size-4" aria-hidden="true" />
              WhatsApp Nova Diagnostics
            </a>
            <a href={getDirectionsUrl()} target="_blank" className="btn-secondary">
              <MapPin className="size-4" aria-hidden="true" />
              Get Directions
            </a>
          </div>
        </div>
      </section>

      <section className="section-pad">
        <div className="container-page grid gap-10 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-6">
            <div className="grid gap-4">
              {contactItems.map((item) => {
                const Icon = item.icon;
                const body = (
                  <div className="card-premium flex gap-4 p-5">
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-[8px] bg-cyan-50 text-teal-700">
                      <Icon className="size-5" aria-hidden="true" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold uppercase text-slate-500">
                        {item.label}
                      </p>
                      <p className="mt-1 font-semibold leading-6 text-slate-950">
                        {item.value}
                      </p>
                    </div>
                  </div>
                );

                return item.href ? (
                  <a key={item.label} href={item.href}>
                    {body}
                  </a>
                ) : (
                  <div key={item.label}>{body}</div>
                );
              })}
            </div>
            <div className="card-premium p-5">
              <div className="flex items-center gap-3">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-[8px] bg-cyan-50 text-teal-700">
                  <UserRound className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-semibold uppercase text-slate-500">
                    Medical Leadership
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    Doctor contact numbers are listed for appropriate medical leadership communication. Please use the main lab number for routine bookings.
                  </p>
                </div>
              </div>
              <div className="mt-5 grid gap-3">
                {siteConfig.doctors.map((doctor) => (
                  <a
                    key={doctor.name}
                    href={getDoctorCallUrl(doctor.phone)}
                    className="rounded-[8px] border border-slate-200 bg-white p-4 transition hover:border-teal-200 hover:bg-cyan-50"
                  >
                    <span className="block font-semibold text-slate-950">{doctor.name}</span>
                    <span className="mt-1 block text-sm text-slate-600">
                      {doctor.displayPhone}
                    </span>
                  </a>
                ))}
              </div>
            </div>
            <DisclaimerBox>
              Nova Diagnostics is a pathology and diagnostics service. For medical emergencies, please contact emergency medical services or visit the nearest hospital.
            </DisclaimerBox>
          </div>
          <ContactForm />
        </div>
      </section>

      <section className="section-pad bg-white">
        <div className="container-page grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <SectionHeading
            eyebrow="Directions"
            title="Visit the lab in Vashi"
            description="The full address is listed below. Add the exact Google Maps URL in the site configuration when available."
          />
          <MapBlock />
        </div>
      </section>
    </>
  );
}
