import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  ClipboardList,
  FileUp,
  HeartHandshake,
  Home,
  MapPinned,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Timer,
} from "lucide-react";
import { MedicalLeadership } from "@/components/people/MedicalLeadership";
import { PackageCard } from "@/components/PackageCard";
import { TestCard } from "@/components/TestCard";
import { HeroSection } from "@/components/sections/HeroSection";
import { CTASection } from "@/components/ui/CTASection";
import { FAQAccordion } from "@/components/ui/FAQAccordion";
import { MapBlock } from "@/components/ui/MapBlock";
import { ReviewCTA } from "@/components/ui/ReviewCTA";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TrustBadge } from "@/components/ui/TrustBadge";
import { TestSearch } from "@/components/TestSearch";
import { packages } from "@/data/packages";
import { getTestBySlug, tests } from "@/data/tests";
import { siteConfig } from "@/config/site";
import { safeJsonLd } from "@/lib/utils";

export const metadata: Metadata = {
  title: {
    absolute:
      "Nova Diagnostics | Blood Tests and Health Checkups in Vashi, Navi Mumbai",
  },
  description:
    "Book blood tests, health packages, prescription support and home sample collection with Nova Diagnostics in Vashi, Navi Mumbai.",
  alternates: {
    canonical: "/",
  },
};

const homeFaqs = [
  {
    question: "Do I need fasting for all blood tests?",
    answer:
      "No. Many routine tests do not need fasting, while some sugar or lipid tests may need preparation. Confirm fasting instructions while booking.",
  },
  {
    question: "Do you provide home sample collection?",
    answer:
      "Yes, home sample collection can be requested in Vashi and nearby Navi Mumbai areas based on slot availability.",
  },
  {
    question: "How do I book a test?",
    answer:
      "You can call, WhatsApp, use the booking form, or upload your prescription for test-list assistance.",
  },
  {
    question: "Can I upload my prescription?",
    answer:
      "Yes. The upload page currently works as a safe request form placeholder until secure backend storage is connected.",
  },
  {
    question: "When will I receive my reports?",
    answer:
      "Report timing depends on the test. Many routine tests are same day or next day, while some tests may take longer.",
  },
  {
    question: "Can reports be shared on WhatsApp?",
    answer:
      "Digital report sharing can be coordinated through the lab's defined process. Confirm your preferred contact method while booking.",
  },
  {
    question: "Which areas do you serve?",
    answer:
      "Nova Diagnostics serves Vashi, Sanpada, Kopar Khairane, Turbhe, Ghansoli, Nerul, Juinagar, APMC area and nearby Navi Mumbai areas.",
  },
  {
    question: "Where is Nova Diagnostics located?",
    answer:
      "Nova Diagnostics is located at Sungrace CHS, 1st Floor, F1/C2, above Ribbons and Balloons Cake Shop, Juhu Nagar, Sector 10, Vashi, Navi Mumbai - 400703.",
  },
];

const whyCards = [
  { label: "Clear test guidance", icon: ClipboardList, description: "Patient-friendly help with tests, preparation and next steps." },
  { label: "Convenient Vashi location", icon: MapPinned, description: "Built for local walk-ins and nearby home collection requests." },
  { label: "Home sample collection", icon: Home, description: "Request collection from home across selected Navi Mumbai areas." },
  { label: "Digital reports", icon: FileUp, description: "Reports can be shared digitally through defined lab processes." },
  { label: "Clear communication", icon: ShieldCheck, description: "Simple explanations around booking, preparation and report timing." },
  { label: "Patient-first support", icon: HeartHandshake, description: "Calls, WhatsApp and practical help for local families." },
  { label: "Clean environment", icon: Sparkles, description: "A calm diagnostic experience designed around comfort and clarity." },
  { label: "WhatsApp support", icon: MessageCircle, description: "Quick support for booking, prescriptions and directions." },
];

export default function HomePage() {
  const popularTests = siteConfig.popularTests
    .flatMap((slug) => {
      const test = getTestBySlug(slug);
      return test ? [test] : [];
    })
    .slice(0, 10);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MedicalBusiness",
    name: siteConfig.businessName,
    url: siteConfig.url,
    telephone: siteConfig.phone,
    image: `${siteConfig.url}/images/nova-lab-hero.jpg`,
    address: {
      "@type": "PostalAddress",
      streetAddress: siteConfig.address,
      addressLocality: "Navi Mumbai",
      addressRegion: siteConfig.state,
      postalCode: siteConfig.postalCode,
      addressCountry: siteConfig.country,
    },
    areaServed: siteConfig.serviceAreas,
    medicalSpecialty: "Pathology",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
      />
      <HeroSection />

      <section className="section-pad bg-white">
        <div className="container-page">
          <SectionHeading
            eyebrow="Quick test search"
            title="Find routine tests without calling first"
            description="Search commonly requested blood tests, profiles and health checkup options before booking."
            align="center"
          />
          <div className="mt-8">
            <TestSearch tests={tests} />
          </div>
        </div>
      </section>

      <section className="section-pad">
        <div className="container-page">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <SectionHeading
              eyebrow="Popular tests"
              title="Common blood tests and diagnostic profiles"
              description="Clear sample, fasting and report-time information for tests patients often search for in Vashi."
            />
            <Link href="/tests" className="btn-secondary w-fit">
              View all tests
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {popularTests.map((test) => (
              <TestCard key={test.slug} test={test} />
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad bg-white">
        <div className="container-page">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <SectionHeading
              eyebrow="Health packages"
              title="Health checkups for families and routine monitoring"
              description="Packages use editable, safe content until final test lists and prices are confirmed by the lab."
            />
            <Link href="/packages" className="btn-secondary w-fit">
              View packages
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {packages.slice(0, 6).map((healthPackage) => (
              <PackageCard key={healthPackage.slug} healthPackage={healthPackage} />
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad bg-[linear-gradient(135deg,#061A33_0%,#0B3B75_56%,#0F766E_100%)] text-white">
        <div className="container-page grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase text-cyan-200">
              Home sample collection
            </p>
            <h2 className="mt-3 text-balance text-3xl font-semibold md:text-4xl">
              Blood tests from home across Vashi and nearby Navi Mumbai areas
            </h2>
            <p className="mt-4 text-pretty leading-7 text-slate-200">
              Ideal for senior citizens, busy professionals, families and people who prefer convenient sample collection.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {siteConfig.serviceAreas.map((area) => (
                <span key={area} className="rounded-[8px] border border-white/20 bg-white/10 px-3 py-2 text-sm text-cyan-50">
                  {area}
                </span>
              ))}
            </div>
            <Link href="/home-sample-collection" className="btn-primary mt-7 bg-white text-[#061A33] hover:bg-cyan-50">
              Book Home Collection
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              ["1", "Choose test or upload prescription"],
              ["2", "Select your preferred slot"],
              ["3", "Sample collected and report shared digitally"],
            ].map(([number, text]) => (
              <div key={number} className="rounded-[8px] border border-white/18 bg-white/10 p-5 backdrop-blur">
                <span className="flex size-10 items-center justify-center rounded-[8px] bg-white text-lg font-semibold text-[#061A33]">
                  {number}
                </span>
                <p className="mt-4 font-semibold leading-6">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad bg-white">
        <div className="container-page">
          <div className="card-premium p-6 md:p-8">
            <FileUp className="size-10 text-teal-700" aria-hidden="true" />
            <h2 className="mt-4 text-3xl font-semibold text-slate-950">
              Not sure which tests are written on your prescription?
            </h2>
            <p className="mt-4 leading-7 text-slate-600">
              Upload it and our team will help you with the test list and booking options. The current form is a request placeholder until secure file storage is connected.
            </p>
            <Link href="/upload-prescription" className="btn-primary mt-6">
              Upload Prescription
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section className="section-pad">
        <div className="container-page">
          <SectionHeading
            eyebrow="Why Nova Diagnostics"
            title="Care, clarity and convenience in one local lab"
            description="The site focuses on clear test information, practical booking support and local accessibility without unsupported accreditation claims."
            align="center"
          />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {whyCards.map((card) => (
              <TrustBadge key={card.label} {...card} />
            ))}
          </div>
        </div>
      </section>

      <MedicalLeadership preview />

      <section className="section-pad">
        <div className="container-page">
          <SectionHeading
            eyebrow="Location and contact"
            title="Visit Nova Diagnostics in Vashi"
            description="The lab address is listed clearly for walk-ins, directions and home collection coordination."
          />
          <div className="mt-8 grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
            <MapBlock />
            <div className="grid gap-6">
              <ReviewCTA />
              <div className="card-premium p-6">
                <Timer className="size-9 text-teal-700" aria-hidden="true" />
                <h3 className="mt-4 text-xl font-semibold text-slate-950">Timings</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {siteConfig.timings}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-pad bg-white">
        <div className="container-page grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <SectionHeading
            eyebrow="FAQ"
            title="Common questions before booking"
            description="Helpful answers for patients planning a lab visit, home collection or prescription upload."
          />
          <FAQAccordion items={homeFaqs} />
        </div>
      </section>

      <CTASection />
    </>
  );
}
