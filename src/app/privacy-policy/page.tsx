import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Privacy policy template for Nova Diagnostics covering inquiry details, booking preferences and prescription upload requests.",
  alternates: {
    canonical: "/privacy-policy",
  },
};

const sections = [
  {
    title: "Information we may collect",
    body: "Nova Diagnostics may collect name, phone number, email address, test inquiry details, prescription upload requests, booking preferences and home sample collection details.",
  },
  {
    title: "How information is used",
    body: "Information may be used to respond to inquiries, book tests, coordinate home sample collection, identify prescription-based test lists and provide diagnostic services.",
  },
  {
    title: "Health-related information",
    body: "Health-related information should be handled with care. Users should avoid uploading unnecessary sensitive information that is not required for test booking.",
  },
  {
    title: "Prescription uploads",
    body: "The current website implementation includes upload UI placeholders. Secure private storage and staff workflows should be connected before production file collection.",
  },
  {
    title: "Privacy requests",
    body: `For privacy questions or correction requests, contact Nova Diagnostics at ${siteConfig.email}. Replace this placeholder with the final privacy contact before launch.`,
  },
  {
    title: "Template notice",
    body: "This privacy policy is a starter template and should be reviewed by a qualified legal professional before public launch.",
  },
];

export default function PrivacyPolicyPage() {
  return (
    <section className="section-pad">
      <div className="container-page max-w-4xl">
        <Breadcrumbs items={[{ label: "Privacy Policy" }]} />
        <SectionHeading
          eyebrow="Privacy Policy"
          level="h1"
          title="How Nova Diagnostics handles website inquiries"
          description="This page is a practical template and not final legal advice."
        />
        <div className="mt-10 space-y-8">
          {sections.map((section) => (
            <section key={section.title} className="card-premium p-6">
              <h2 className="text-xl font-semibold text-slate-950">{section.title}</h2>
              <p className="mt-3 leading-7 text-slate-600">{section.body}</p>
            </section>
          ))}
        </div>
      </div>
    </section>
  );
}
