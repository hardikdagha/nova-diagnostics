import type { Metadata } from "next";
import Link from "next/link";
import { FileUp, MessageCircle } from "lucide-react";
import { TestExplorer } from "@/components/TestExplorer";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { CTASection } from "@/components/ui/CTASection";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { tests } from "@/data/tests";
import { getWhatsappUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Tests in Vashi",
  description:
    "Search blood tests, diabetes tests, thyroid tests, vitamin tests, liver, kidney, fever and urine tests at Nova Diagnostics in Vashi, Navi Mumbai.",
  alternates: {
    canonical: "/tests",
  },
};

export default function TestsPage() {
  return (
    <>
      <section className="bg-[linear-gradient(135deg,#FAFCFD_0%,#E6F7FA_100%)] py-12 md:py-16">
        <div className="container-page">
          <Breadcrumbs items={[{ label: "Tests" }]} />
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <SectionHeading
              eyebrow="Test catalogue"
              level="h1"
              title="Search lab tests before you book"
              description="Browse routine blood tests, diabetes monitoring, thyroid profiles, vitamins, fever tests and more. Prices are intentionally marked as contact-based until Nova Diagnostics confirms the final rate card."
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <a href={getWhatsappUrl("Hello Nova Diagnostics, I would like help booking a test.")} className="btn-primary">
                <MessageCircle className="size-4" aria-hidden="true" />
                WhatsApp Book
              </a>
              <Link href="/upload-prescription" className="btn-secondary">
                <FileUp className="size-4" aria-hidden="true" />
                Upload Prescription
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section-pad">
        <div className="container-page">
          <TestExplorer tests={tests} />
        </div>
      </section>

      <CTASection
        title="Need help choosing the right test?"
        description="Upload a prescription or message Nova Diagnostics on WhatsApp for patient-friendly test list support."
        primaryHref="/upload-prescription"
        primaryLabel="Upload Prescription"
      />
    </>
  );
}
