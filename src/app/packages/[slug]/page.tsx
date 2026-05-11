import type { Metadata } from "next";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CalendarCheck,
  CheckCircle2,
  Clock,
  Home,
  MessageCircle,
  Utensils,
} from "lucide-react";
import { PackageCard } from "@/components/PackageCard";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { DisclaimerBox } from "@/components/ui/DisclaimerBox";
import { FAQAccordion } from "@/components/ui/FAQAccordion";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getPackageBySlug, getRelatedPackages, packages } from "@/data/packages";
import { getWhatsappUrl } from "@/lib/utils";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return packages.map((healthPackage) => ({ slug: healthPackage.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const healthPackage = getPackageBySlug(slug);

  if (!healthPackage) {
    return {
      title: "Package Not Found",
    };
  }

  return {
    title: `${healthPackage.name} in Vashi`,
    description: `Book ${healthPackage.name} at Nova Diagnostics in Vashi, Navi Mumbai. Check included tests, fasting requirement, report time and home collection availability.`,
    alternates: {
      canonical: `/packages/${healthPackage.slug}`,
    },
  };
}

export default async function PackageDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const healthPackage = getPackageBySlug(slug);

  if (!healthPackage) {
    notFound();
  }

  const relatedPackages = getRelatedPackages(healthPackage.slug);
  const detailItems: Array<[string, string, LucideIcon]> = [
    ["Ideal for", healthPackage.idealFor, CheckCircle2],
    ["Fasting", healthPackage.fasting, Utensils],
    ["Report time", healthPackage.reportTime, Clock],
    ["Home collection", "Available on request", Home],
    ["Price", healthPackage.price, CheckCircle2],
  ];
  const faqs = [
    {
      question: `Who is ${healthPackage.name} ideal for?`,
      answer: healthPackage.idealFor,
    },
    {
      question: "Can this package be collected from home?",
      answer:
        "Home sample collection can be requested in supported Navi Mumbai areas and confirmed based on slot availability.",
    },
    {
      question: "Are prices final on the website?",
      answer:
        "Website prices are indicative. Please confirm the current rate with the lab before booking.",
    },
  ];

  return (
    <>
      <section className="bg-[linear-gradient(135deg,#061A33_0%,#0B3B75_62%,#0F766E_100%)] py-12 text-white md:py-16">
        <div className="container-page">
          <Breadcrumbs
            tone="dark"
            items={[
              { label: "Packages", href: "/packages" },
              { label: healthPackage.name },
            ]}
          />
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
            <div>
              <p className="text-sm font-semibold uppercase text-cyan-200">
                Health package
              </p>
              <h1 className="mt-3 text-balance text-4xl font-semibold leading-tight md:text-5xl">
                {healthPackage.name}
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-200">
                {healthPackage.description}
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="/contact" className="btn-primary bg-white text-[#061A33] hover:bg-cyan-50">
                  <CalendarCheck className="size-4" aria-hidden="true" />
                  Book Package
                </Link>
                <a
                  href={getWhatsappUrl(`Hello Nova Diagnostics, I would like to book the ${healthPackage.name}.`)}
                  className="btn-secondary border-white/25 bg-white/10 text-white hover:bg-white/15"
                >
                  <MessageCircle className="size-4" aria-hidden="true" />
                  WhatsApp
                </a>
              </div>
            </div>
            <div className="rounded-[8px] border border-white/15 bg-white/10 p-5 backdrop-blur md:p-6">
              <dl className="grid gap-4">
                {detailItems.map(([label, value, Icon]) => (
                  <div key={label} className="flex items-center gap-3 rounded-[8px] bg-white/10 p-4">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-[8px] bg-white text-[#061A33]">
                      <Icon className="size-5" aria-hidden="true" />
                    </span>
                    <div>
                      <dt className="text-xs font-semibold uppercase text-cyan-100">{label}</dt>
                      <dd className="mt-1 font-semibold text-white">{value}</dd>
                    </div>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </section>

      <section className="section-pad">
        <div className="container-page grid gap-10 lg:grid-cols-[0.72fr_0.28fr]">
          <article className="space-y-10">
            <section>
              <h2 className="text-2xl font-semibold text-slate-950">Included test groups</h2>
              <p className="mt-3 leading-7 text-slate-600">
                The parameters below are a patient-friendly overview. Please confirm the exact test list and pricing with the lab before booking.
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {healthPackage.includedTests.map((item) => (
                  <div key={item} className="flex gap-3 rounded-[8px] border border-slate-200 bg-white p-4">
                    <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-teal-700" aria-hidden="true" />
                    <span className="text-sm font-medium text-slate-700">{item}</span>
                  </div>
                ))}
              </div>
            </section>
            <section>
              <h2 className="text-2xl font-semibold text-slate-950">Preparation and collection</h2>
              <p className="mt-4 leading-7 text-slate-600">
                Fasting requirement: {healthPackage.fasting}. Confirm exact preparation instructions and sample timing while booking, especially if this package includes sugar or lipid-related testing.
              </p>
            </section>
            <section>
              <h2 className="text-2xl font-semibold text-slate-950">FAQ</h2>
              <div className="mt-4">
                <FAQAccordion items={faqs} />
              </div>
            </section>
            <DisclaimerBox />
          </article>
          <aside className="space-y-5 lg:sticky lg:top-32 lg:self-start">
            <div className="card-premium p-5">
              <h2 className="text-xl font-semibold text-slate-950">Book this package</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Contact the lab to confirm package price, preparation and available collection slots.
              </p>
              <div className="mt-5 grid gap-3">
                <Link href="/contact" className="btn-primary">
                  <CalendarCheck className="size-4" aria-hidden="true" />
                  Book Package
                </Link>
                <a href={getWhatsappUrl(`Hello Nova Diagnostics, I would like to book the ${healthPackage.name}.`)} className="btn-secondary">
                  <MessageCircle className="size-4" aria-hidden="true" />
                  WhatsApp
                </a>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className="section-pad bg-white">
        <div className="container-page">
          <SectionHeading
            title="Other health packages"
            description="Explore related package options for preventive screening and follow-up care."
          />
          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {relatedPackages.map((relatedPackage) => (
              <PackageCard key={relatedPackage.slug} healthPackage={relatedPackage} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
