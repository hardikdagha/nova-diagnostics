import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { DisclaimerBox } from "@/components/ui/DisclaimerBox";
import { SectionHeading } from "@/components/ui/SectionHeading";

export const metadata: Metadata = {
  title: "Terms and Refund Policy",
  description:
    "Terms, booking, cancellation and refund policy template for Nova Diagnostics in Vashi, Navi Mumbai.",
  alternates: {
    canonical: "/terms",
  },
};

const terms = [
  {
    title: "Website information",
    body: "Information on this website is for general awareness and should not be treated as medical advice.",
  },
  {
    title: "Medical decisions",
    body: "Medical decisions should be taken with qualified doctors. Nova Diagnostics does not provide emergency medical care through this website.",
  },
  {
    title: "Booking confirmation",
    body: "Booking requests are subject to confirmation by the lab team, test availability, location and time slot.",
  },
  {
    title: "Prices",
    body: "Prices may change and should be confirmed with the lab before sample collection or visit.",
  },
  {
    title: "Home collection",
    body: "Home collection availability depends on patient location, route planning and available slots.",
  },
  {
    title: "Refunds and cancellations",
    body: "The final refund and cancellation policy should be finalized by Nova Diagnostics before public launch. This page is a starter policy template.",
  },
];

export default function TermsPage() {
  return (
    <section className="section-pad">
      <div className="container-page max-w-4xl">
        <Breadcrumbs items={[{ label: "Terms" }]} />
        <SectionHeading
          eyebrow="Terms and Refund Policy"
          level="h1"
          title="Website, booking and cancellation terms"
          description="A practical starter policy for the current marketing and booking website."
        />
        <div className="mt-10 space-y-8">
          {terms.map((section) => (
            <section key={section.title} className="card-premium p-6">
              <h2 className="text-xl font-semibold text-slate-950">{section.title}</h2>
              <p className="mt-3 leading-7 text-slate-600">{section.body}</p>
            </section>
          ))}
          <DisclaimerBox>
            For medical emergencies, please contact emergency medical services or visit the nearest hospital.
          </DisclaimerBox>
        </div>
      </div>
    </section>
  );
}
