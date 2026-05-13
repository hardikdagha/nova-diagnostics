import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, MapPinned, MessageCircle } from "lucide-react";
import { PackageCard } from "@/components/PackageCard";
import { TestCard } from "@/components/TestCard";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { FAQAccordion } from "@/components/ui/FAQAccordion";
import { MapBlock } from "@/components/ui/MapBlock";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { packages } from "@/data/packages";
import { getTestBySlug } from "@/data/tests";
import { siteConfig } from "@/config/site";
import { getDirectionsUrl, getWhatsappUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Pathology Lab in Vashi, Navi Mumbai",
  description:
    "Nova Diagnostics is a pathology lab in Vashi, Navi Mumbai for blood tests, health packages, home sample collection, prescription upload support and digital reports.",
  alternates: {
    canonical: "/pathology-lab-in-vashi",
  },
};

const faqs = [
  {
    question: "Does Nova Diagnostics offer blood tests in Vashi?",
    answer:
      "Yes. Nova Diagnostics supports routine blood tests, health packages and prescription-based testing requests in Vashi.",
  },
  {
    question: "Can I request home sample collection near Vashi?",
    answer:
      "Home sample collection can be requested in Vashi and nearby Navi Mumbai areas, subject to slot availability.",
  },
  {
    question: "Can I get directions to the lab?",
    answer:
      "Yes. Use the Get Directions button to open the lab location in Google Maps and get turn-by-turn directions.",
  },
  {
    question: "Are digital reports available?",
    answer:
      "Digital report sharing can be coordinated through Nova Diagnostics' defined lab process.",
  },
];

export default function PathologyLabInVashiPage() {
  const highlightedTests = [
    "cbc",
    "thyroid-profile",
    "hba1c",
    "lipid-profile",
    "vitamin-d",
    "urine-routine",
  ]
    .flatMap((slug) => {
      const test = getTestBySlug(slug);
      return test ? [test] : [];
    });

  return (
    <>
      <section className="bg-[linear-gradient(135deg,#FAFCFD_0%,#E6F7FA_100%)] py-12 md:py-16">
        <div className="container-page">
          <Breadcrumbs items={[{ label: "Pathology Lab in Vashi" }]} />
          <div className="max-w-4xl">
            <p className="text-sm font-semibold uppercase text-teal-700">
              Local pathology lab
            </p>
            <h1 className="mt-3 text-balance text-4xl font-semibold leading-tight text-slate-950 md:text-5xl">
              Pathology Lab in Vashi, Navi Mumbai
            </h1>
            <p className="mt-5 text-lg leading-8 text-slate-600">
              Nova Diagnostics helps local patients book blood tests, health packages, prescription-based testing and home sample collection in Vashi and nearby Navi Mumbai areas.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a href={getWhatsappUrl("Hello Nova Diagnostics, I am looking for a pathology lab in Vashi.")} className="btn-primary">
                <MessageCircle className="size-4" aria-hidden="true" />
                WhatsApp
              </a>
              <a href={getDirectionsUrl()} target="_blank" className="btn-secondary">
                <MapPinned className="size-4" aria-hidden="true" />
                Get Directions
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="section-pad">
        <div className="container-page grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <SectionHeading
            eyebrow="What you can book"
            title="Tests, packages and home collection from one local lab website"
            description="The page is written naturally for local search without keyword stuffing or unsupported claims."
          />
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              "Blood tests and routine profiles",
              "Health packages and full body checkups",
              "Home sample collection in nearby areas",
              "Digital reports through defined lab process",
              "Prescription upload request support",
              "Directions and walk-in contact information",
            ].map((item) => (
              <div key={item} className="card-premium flex gap-3 p-5">
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-teal-700" aria-hidden="true" />
                <span className="font-semibold text-slate-950">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad bg-white">
        <div className="container-page">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <SectionHeading
              eyebrow="Popular tests in Vashi"
              title="Common tests patients search for"
            />
            <Link href="/tests" className="btn-secondary w-fit">
              View all tests
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {highlightedTests.map((test) => (
              <TestCard key={test.slug} test={test} />
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad">
        <div className="container-page">
          <SectionHeading
            eyebrow="Health packages"
            title="Preventive checkups for local families"
          />
          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {packages.slice(0, 3).map((healthPackage) => (
              <PackageCard key={healthPackage.slug} healthPackage={healthPackage} />
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad bg-white">
        <div className="container-page grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <SectionHeading
            eyebrow="Location"
            title="Nova Diagnostics in Vashi"
            description={`Areas served include ${siteConfig.serviceAreas.join(", ")}.`}
          />
          <MapBlock />
        </div>
      </section>

      <section className="section-pad">
        <div className="container-page grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <SectionHeading
            eyebrow="FAQ"
            title="Local search questions"
            description="Useful answers for people searching for a pathology lab near Vashi."
          />
          <FAQAccordion items={faqs} />
        </div>
      </section>
    </>
  );
}
