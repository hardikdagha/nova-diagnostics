import type { Metadata } from "next";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import {
  CalendarCheck,
  CheckCircle2,
  ClipboardList,
  Home,
  MessageCircle,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { HomeCollectionForm } from "@/components/forms/HomeCollectionForm";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { FAQAccordion } from "@/components/ui/FAQAccordion";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TrustBadge } from "@/components/ui/TrustBadge";
import { siteConfig } from "@/config/site";
import { getWhatsappUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Blood Test at Home in Vashi",
  description:
    "Book convenient home sample collection for blood tests and health packages with Nova Diagnostics in Vashi and nearby Navi Mumbai areas.",
  alternates: {
    canonical: "/home-sample-collection",
  },
};

const whoShouldUse: Array<[string, LucideIcon]> = [
  ["Senior citizens", UserRound],
  ["Busy professionals", CalendarCheck],
  ["Families", Home],
  ["Patients needing regular monitoring", ClipboardList],
  ["People preferring convenience", ShieldCheck],
];

const checklist = [
  "Keep prescription ready if available",
  "Confirm fasting requirement",
  "Keep ID/contact details ready",
  "Drink water unless fasting instructions say otherwise",
];

const faqs = [
  {
    question: "Which areas do you cover for home collection?",
    answer:
      "Home collection can be requested in Vashi, Sanpada, Kopar Khairane, Turbhe, Ghansoli, Nerul, Juinagar, APMC area and nearby Navi Mumbai areas. Availability depends on slot and route.",
  },
  {
    question: "Can I book home collection without knowing test names?",
    answer:
      "Yes. Upload your prescription or describe the required tests, and the team can help coordinate the list.",
  },
  {
    question: "Do I need to fast before home collection?",
    answer:
      "Fasting requirements depend on the test. Lipid Profile requires 12–14 hours fasting, Full Body Checkup requires 12 hours fasting, and Post Prandial Blood Sugar is collected 2 hours after a meal. Many other routine tests do not require fasting. Our team will confirm exact preparation instructions before the visit.",
  },
  {
    question: "Are uploaded prescriptions stored?",
    answer:
      "Prescription details shared via the form are used only to assist with test identification and booking coordination.",
  },
];

export default function HomeSampleCollectionPage() {
  return (
    <>
      <section className="bg-[linear-gradient(135deg,#FAFCFD_0%,#E6F7FA_100%)] py-12 md:py-16">
        <div className="container-page">
          <Breadcrumbs items={[{ label: "Home Sample Collection" }]} />
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase text-teal-700">
              Home sample collection
            </p>
            <h1 className="mt-3 text-balance text-4xl font-semibold leading-tight text-slate-950 md:text-5xl">
              Blood tests at home, coordinated by Nova Diagnostics.
            </h1>
            <p className="mt-5 text-lg leading-8 text-slate-600">
              Request a home sample collection slot and our team will confirm availability before the visit. Available across Vashi and nearby Navi Mumbai areas.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a href={getWhatsappUrl("Hello Nova Diagnostics, I would like to book home sample collection.")} className="btn-primary">
                <MessageCircle className="size-4" aria-hidden="true" />
                WhatsApp Booking
              </a>
              <Link href="/upload-prescription" className="btn-secondary">
                Upload Prescription
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Steps strip */}
      <div className="border-b border-slate-100 bg-white">
        <div className="container-page">
          <div className="grid divide-x divide-slate-100 sm:grid-cols-3">
            {[
              ["1", "Request a slot", "Fill the form or WhatsApp with your test name or prescription."],
              ["2", "Team confirms", "Staff confirms slot availability and preparation instructions."],
              ["3", "Sample collected", "Phlebotomist visits and reports are shared digitally."],
            ].map(([n, title, desc]) => (
              <div key={n} className="px-6 py-6">
                <span className="inline-flex size-7 items-center justify-center rounded-full bg-[#061A33] text-xs font-bold text-white">{n}</span>
                <p className="mt-3 font-semibold text-slate-950">{title}</p>
                <p className="mt-1 text-sm leading-6 text-slate-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <section className="section-pad">
        <div className="container-page grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <SectionHeading
              eyebrow="Book a slot"
              title="Request home collection"
              description="Submit your details and the Nova Diagnostics team will confirm slot availability and coordinate your home collection appointment."
            />
            <div className="mt-8 grid gap-4">
              <h2 className="text-lg font-semibold text-slate-950">Service areas</h2>
              <div className="flex flex-wrap gap-2">
                {siteConfig.serviceAreas.map((area) => (
                  <span key={area} className="rounded-[8px] border border-cyan-200 bg-cyan-50 px-3 py-2 text-sm font-semibold text-teal-800">
                    {area}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <HomeCollectionForm />
        </div>
      </section>

      <section className="section-pad bg-white">
        <div className="container-page grid gap-10 lg:grid-cols-2">
          <div>
            <SectionHeading
              eyebrow="Who benefits"
              title="Convenient for routine monitoring and family care"
              description="Home collection is useful when travel is inconvenient, preparation needs coordination, or multiple family members need testing."
            />
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {whoShouldUse.map(([label, Icon]) => (
                <TrustBadge key={label as string} label={label as string} icon={Icon} />
              ))}
            </div>
          </div>
          <div className="card-premium flex flex-col p-6">
            <h2 className="text-2xl font-semibold text-slate-950">Preparation checklist</h2>
            <ul className="mt-5 grid gap-4">
              {checklist.map((item) => (
                <li key={item} className="flex gap-3 text-slate-600">
                  <CheckCircle2 className="mt-1 size-5 shrink-0 text-teal-700" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6 flex-1 rounded-[8px] bg-[#061A33]/5 p-4">
              <p className="text-sm font-semibold text-slate-950">Before your appointment</p>
              <p className="mt-1.5 text-sm leading-6 text-slate-600">
                Our team will confirm preparation instructions, fasting requirements, and expected report timelines when coordinating your home collection slot.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section-pad">
        <div className="container-page grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <SectionHeading
            eyebrow="FAQ"
            title="Home collection questions"
            description="Quick answers before you request a slot."
          />
          <FAQAccordion items={faqs} />
        </div>
      </section>
    </>
  );
}
