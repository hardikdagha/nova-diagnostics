import type { Metadata } from "next";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CalendarCheck,
  CheckCircle2,
  Clock,
  Droplets,
  Home,
  MessageCircle,
  Utensils,
} from "lucide-react";
import { TestCard } from "@/components/TestCard";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { DisclaimerBox } from "@/components/ui/DisclaimerBox";
import { FAQAccordion } from "@/components/ui/FAQAccordion";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getRelatedTests, getTestBySlug, tests } from "@/data/tests";
import { getWhatsappUrl } from "@/lib/utils";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return tests.map((test) => ({ slug: test.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const test = getTestBySlug(slug);

  if (!test) {
    return {
      title: "Test Not Found",
    };
  }

  return {
    title: `${test.name} in Vashi`,
    description: `Book ${test.name} at Nova Diagnostics in Vashi, Navi Mumbai. Check sample type, fasting requirement, report time and home collection availability.`,
    alternates: {
      canonical: `/tests/${test.slug}`,
    },
  };
}

export default async function TestDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const test = getTestBySlug(slug);

  if (!test) {
    notFound();
  }

  const relatedTests = getRelatedTests(test.relatedTests);
  const detailItems: Array<[string, string, LucideIcon]> = [
    ["Sample type", test.sampleType, Droplets],
    ["Fasting", test.fasting, Utensils],
    ["Report time", test.reportTime, Clock],
    ["Home collection", test.homeCollection ? "Available" : "Confirm with lab", Home],
    ["Price", test.price, CheckCircle2],
  ];
  const faqs = [
    {
      question: `Is fasting required for ${test.name}?`,
      answer:
        test.fasting === "Yes"
          ? "Fasting is usually required. Confirm exact preparation instructions while booking."
          : test.fasting === "No"
            ? "Fasting is usually not required unless your doctor gives specific instructions."
            : "Preparation can vary. Confirm fasting instructions with the lab team while booking.",
    },
    {
      question: "Is home collection available?",
      answer: test.homeCollection
        ? "Yes, home sample collection can be requested based on area and slot availability."
        : "Please contact Nova Diagnostics to confirm availability for this test.",
    },
    {
      question: "How do I book this test?",
      answer:
        "Use the booking button, WhatsApp Nova Diagnostics, call the lab, or upload your prescription for help.",
    },
  ];

  return (
    <>
      <section className="bg-[linear-gradient(135deg,#FAFCFD_0%,#E6F7FA_100%)] py-12 md:py-16">
        <div className="container-page">
          <Breadcrumbs items={[{ label: "Tests", href: "/tests" }, { label: test.name }]} />
          <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-start">
            <div>
              <p className="text-sm font-semibold uppercase text-teal-700">
                {test.category}
              </p>
              <h1 className="mt-3 text-balance text-4xl font-semibold leading-tight text-slate-950 md:text-5xl">
                {test.name}
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
                {test.description}
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="/contact" className="btn-primary">
                  <CalendarCheck className="size-4" aria-hidden="true" />
                  Book Test
                </Link>
                <a
                  href={getWhatsappUrl(`Hello Nova Diagnostics, I would like to book ${test.name}.`)}
                  className="btn-secondary"
                >
                  <MessageCircle className="size-4" aria-hidden="true" />
                  WhatsApp
                </a>
              </div>
            </div>
            <div className="card-premium p-5 md:p-6">
              <dl className="grid gap-4">
                {detailItems.map(([label, value, Icon]) => (
                  <div key={label} className="flex items-center gap-3 rounded-[8px] bg-slate-50 p-4">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-[8px] bg-cyan-50 text-teal-700">
                      <Icon className="size-5" aria-hidden="true" />
                    </span>
                    <div>
                      <dt className="text-xs font-semibold uppercase text-slate-500">{label}</dt>
                      <dd className="mt-1 font-semibold text-slate-950">{value}</dd>
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
              <h2 className="text-2xl font-semibold text-slate-950">What is this test?</h2>
              <p className="mt-4 leading-7 text-slate-600">{test.whatIsIt}</p>
            </section>
            <section>
              <h2 className="text-2xl font-semibold text-slate-950">When is it commonly recommended?</h2>
              <ul className="mt-4 grid gap-3">
                {test.commonlyRecommended.map((item) => (
                  <li key={item} className="flex gap-3 text-slate-600">
                    <CheckCircle2 className="mt-1 size-5 shrink-0 text-teal-700" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
            <section>
              <h2 className="text-2xl font-semibold text-slate-950">Preparation instructions</h2>
              <ul className="mt-4 grid gap-3">
                {test.preparation.map((item) => (
                  <li key={item} className="flex gap-3 text-slate-600">
                    <CheckCircle2 className="mt-1 size-5 shrink-0 text-teal-700" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
            <section>
              <h2 className="text-2xl font-semibold text-slate-950">Sample and report details</h2>
              <p className="mt-4 leading-7 text-slate-600">
                Sample type: {test.sampleType}. Report turnaround: {test.reportTime}. Home sample collection can be requested in supported areas and confirmed based on route and slot availability.
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
              <h2 className="text-xl font-semibold text-slate-950">Book {test.name}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Contact Nova Diagnostics for preparation, pricing and slot confirmation.
              </p>
              <div className="mt-5 grid gap-3">
                <Link href="/contact" className="btn-primary">
                  <CalendarCheck className="size-4" aria-hidden="true" />
                  Book Test
                </Link>
                <a href={getWhatsappUrl(`Hello Nova Diagnostics, I would like to book ${test.name}.`)} className="btn-secondary">
                  <MessageCircle className="size-4" aria-hidden="true" />
                  WhatsApp
                </a>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {relatedTests.length ? (
        <section className="section-pad bg-white">
          <div className="container-page">
            <SectionHeading title="Related tests" description="Other tests patients commonly review with this test." />
            <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {relatedTests.map((relatedTest) => (
                <TestCard key={relatedTest.slug} test={relatedTest} />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
