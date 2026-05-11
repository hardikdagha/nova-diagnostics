import type { Metadata } from "next";
import Link from "next/link";
import { FileUp, MessageCircle } from "lucide-react";
import { PackageCard } from "@/components/PackageCard";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { CTASection } from "@/components/ui/CTASection";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { packages } from "@/data/packages";
import { getWhatsappUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Health Packages in Vashi",
  description:
    "Explore preventive health packages at Nova Diagnostics in Vashi, including full body checkup, diabetes care, thyroid care, senior citizen and wellness packages.",
  alternates: {
    canonical: "/packages",
  },
};

export default function PackagesPage() {
  return (
    <>
      <section className="bg-[linear-gradient(135deg,#FAFCFD_0%,#E6F7FA_100%)] py-12 md:py-16">
        <div className="container-page">
          <Breadcrumbs items={[{ label: "Health Packages" }]} />
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <SectionHeading
              eyebrow="Health packages"
              level="h1"
              title="Preventive checkups for practical health screening"
              description="Choose from routine, diabetes, thyroid, senior citizen, heart health, women's wellness and vitamin deficiency checks. Confirm pricing and parameters with the lab before booking."
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <a href={getWhatsappUrl("Hello Nova Diagnostics, I would like to know about health packages.")} className="btn-primary">
                <MessageCircle className="size-4" aria-hidden="true" />
                WhatsApp
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
          <div className="grid gap-5 lg:grid-cols-3">
            {packages.map((healthPackage) => (
              <PackageCard key={healthPackage.slug} healthPackage={healthPackage} />
            ))}
          </div>
        </div>
      </section>

      <CTASection
        title="Want help choosing a package?"
        description="Share age, symptoms if any, and your prescription if available. Nova Diagnostics can help you shortlist practical package options."
        primaryHref="/contact"
        primaryLabel="Ask for Guidance"
      />
    </>
  );
}
