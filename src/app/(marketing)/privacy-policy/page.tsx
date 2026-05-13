import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { SectionHeading } from "@/components/ui/SectionHeading";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Privacy policy for Nova Diagnostics covering patient data, report delivery, and digital services.",
  alternates: {
    canonical: "/privacy-policy",
  },
};

const sections = [
  {
    title: "Information we collect",
    body: "Nova Diagnostics may collect your name, phone number, email address, test inquiry details, prescription uploads, booking preferences, home collection requests, and diagnostic report files. When using our digital report service, we also collect technical information such as access timestamps and device information for security purposes.",
  },
  {
    title: "How we use your information",
    body: "Information is used to respond to inquiries, book tests, coordinate home sample collection, identify prescription-based test lists, generate diagnostic reports, deliver reports securely, and provide patient support. We do not sell or share your personal information with third parties for marketing.",
  },
  {
    title: "Digital report delivery",
    body: "When a report is ready, Nova Diagnostics may send a secure private link to your registered mobile number via WhatsApp. This link allows you to download your report PDF directly. Report links use secure random tokens and are not guessable. Access to reports is logged for security and support purposes. Secure links should not be shared unless you wish another person to access your report.",
  },
  {
    title: "Report access and security",
    body: "Report PDFs are stored securely and are not publicly accessible. Downloads are provided through short-lived signed links that expire after a limited period. We maintain access logs to protect patient privacy and detect unauthorised access. Staff can revoke report links if needed.",
  },
  {
    title: "Health-related information",
    body: "Diagnostic reports and prescription information are sensitive health data. We handle this information with care and use it only for the purpose of providing diagnostic services. Users should avoid sharing report links or prescription details unnecessarily.",
  },
  {
    title: "Consent",
    body: "By using Nova Diagnostics services — including booking, prescription uploads, home collection, and digital report access — you consent to Nova Diagnostics processing the provided information for report delivery and patient support.",
  },
  {
    title: "Data retention",
    body: "Patient and report records are retained as needed for medical record-keeping. You may contact us to request access to or correction of your personal information.",
  },
  {
    title: "Privacy requests",
    body: "For privacy questions, data correction requests, or report access issues, contact Nova Diagnostics directly by phone, WhatsApp, or email using the details on the Contact page.",
  },
  {
    title: "Policy scope",
    body: "This privacy policy applies to the Nova Diagnostics website and digital services, including the online report delivery system, patient portal, contact forms, and booking requests. For specific legal queries, please contact us directly.",
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
          title="How Nova Diagnostics handles your information"
          description="Updated to reflect digital report delivery and the patient portal."
        />
        <div className="mt-10 space-y-6">
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
