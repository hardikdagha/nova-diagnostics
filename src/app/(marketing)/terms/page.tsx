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
    body: "For cancellation or rescheduling requests, please contact Nova Diagnostics directly via call or WhatsApp. Refund decisions are subject to lab policy.",
  },
  {
    title: "Digital report delivery",
    body: "Reports may be delivered digitally through secure links sent to your registered mobile number or email via WhatsApp. Secure report links are private — do not share them unless you wish another person to access your report. Nova Diagnostics is not responsible for unauthorised access arising from sharing of report links.",
  },
  {
    title: "Patient portal",
    body: "The patient portal allows registered patients to view and download their reports online. Access requires a valid email address registered at the time of testing. Nova Diagnostics staff can assist with portal access issues.",
  },
  {
    title: "Data and consent",
    body: "By using Nova Diagnostics services, you consent to Nova Diagnostics processing your name, phone number, email, and test details for report delivery and patient support. Access to reports is logged for security purposes. Please review our Privacy Policy for full details.",
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
          description="Please read these terms before booking tests, using home collection or uploading prescriptions through this website."
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
