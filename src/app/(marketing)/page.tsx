import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CalendarCheck,
  ClipboardList,
  FileText,
  FileUp,
  FlaskConical,
  Home,
  Link2,
  ShieldCheck,
  User,
} from "lucide-react";
import { FAQAccordion } from "@/components/ui/FAQAccordion";
import { MapBlock } from "@/components/ui/MapBlock";
import { HeroSection } from "@/components/sections/HeroSection";
import { CTASection } from "@/components/ui/CTASection";
import { siteConfig } from "@/config/site";
import { safeJsonLd } from "@/lib/utils";
import Image from "next/image";

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
      "No. Many routine tests do not need fasting. Some sugar and lipid tests may require it. Confirm preparation while booking.",
  },
  {
    question: "Do you provide home sample collection?",
    answer:
      "Yes, home collection is available in Vashi and nearby Navi Mumbai areas based on slot availability.",
  },
  {
    question: "How do I book a test?",
    answer:
      "Call, WhatsApp, or use the online booking form. You can also upload your prescription for assistance.",
  },
  {
    question: "When will I receive my reports?",
    answer:
      "Many routine tests are ready same day or next day. Some tests take longer. Timelines are confirmed at booking.",
  },
  {
    question: "Which areas do you serve for home collection?",
    answer:
      "Vashi, Sanpada, Kopar Khairane, Turbhe, Ghansoli, Nerul, Juinagar, APMC area and nearby Navi Mumbai areas.",
  },
];

const services = [
  {
    icon: FlaskConical,
    title: "Blood Tests",
    description: "Routine and specialised blood tests with clear preparation guidance.",
    href: "/tests",
  },
  {
    icon: ClipboardList,
    title: "Health Packages",
    description: "Full-body checkups, diabetes, thyroid, senior citizen and wellness panels.",
    href: "/packages",
  },
  {
    icon: Home,
    title: "Home Collection",
    description: "Sample collection from your home across Vashi and nearby areas.",
    href: "/home-sample-collection",
  },
  {
    icon: FileUp,
    title: "Upload Prescription",
    description: "Share your prescription and we'll identify the tests and assist with booking.",
    href: "/upload-prescription",
  },
];

export default function HomePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MedicalBusiness",
    name: siteConfig.businessName,
    url: siteConfig.url,
    telephone: siteConfig.phone,
    email: siteConfig.email,
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

      {/* ── Hero ─────────────────────────────────────────────── */}
      <HeroSection />

      {/* ── Stats strip ──────────────────────────────────────── */}
      <div className="border-y border-slate-100 bg-white">
        <div className="container-page">
          <dl className="grid grid-cols-2 divide-x divide-y divide-slate-100 lg:grid-cols-4 lg:divide-y-0">
            {[
              ["34+", "Years of experience"],
              ["Home", "Sample collection"],
              ["Digital", "Report delivery"],
              ["Vashi", "Navi Mumbai"],
            ].map(([value, label]) => (
              <div key={label} className="flex flex-col items-center px-6 py-7 text-center">
                <dt className="text-2xl font-bold text-[#061A33] md:text-3xl">{value}</dt>
                <dd className="mt-1 text-sm font-medium text-slate-500">{label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* ── Core services grid ───────────────────────────────── */}
      <section className="section-pad bg-[#FAFCFD]">
        <div className="container-page">
          <div className="mb-12 text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-teal-700">Services</p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-950 md:text-4xl">
              Diagnostics made simpler for patients and families.
            </h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((s) => {
              const Icon = s.icon;
              return (
                <Link
                  key={s.href}
                  href={s.href}
                  className="group card-premium flex flex-col p-6 transition-all hover:-translate-y-1"
                >
                  <span className="flex size-12 items-center justify-center rounded-[8px] bg-cyan-50 text-teal-700 transition group-hover:bg-[#061A33] group-hover:text-white">
                    <Icon className="size-6" aria-hidden="true" />
                  </span>
                  <h3 className="mt-5 text-lg font-semibold text-slate-950">{s.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-6 text-slate-500">{s.description}</p>
                  <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-teal-700 transition group-hover:gap-2.5">
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Home sample collection ───────────────────────────── */}
      <section className="section-pad bg-[linear-gradient(135deg,#061A33_0%,#0B3B75_56%,#0F766E_100%)] text-white">
        <div className="container-page grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-cyan-300">
              Home sample collection
            </p>
            <h2 className="mt-3 text-balance text-3xl font-semibold md:text-4xl">
              Get tested from the comfort of your home
            </h2>
            <p className="mt-4 text-lg leading-8 text-slate-300">
              Ideal for senior citizens, busy professionals, and families who prefer testing at home. Available across Vashi and nearby Navi Mumbai areas.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {siteConfig.serviceAreas.map((area) => (
                <span key={area} className="rounded-[8px] border border-white/20 bg-white/10 px-3 py-1.5 text-sm text-cyan-100">
                  {area}
                </span>
              ))}
            </div>
            <Link href="/home-sample-collection" className="btn-primary mt-8 bg-white text-[#061A33] hover:bg-cyan-50">
              Book Home Collection
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            {[
              ["1", "Choose a test or share your prescription"],
              ["2", "Select a convenient time slot"],
              ["3", "Sample collected and reports shared digitally"],
            ].map(([n, text]) => (
              <div key={n} className="rounded-[8px] border border-white/15 bg-white/10 p-5 backdrop-blur">
                <span className="flex size-10 items-center justify-center rounded-[8px] bg-white text-lg font-bold text-[#061A33]">
                  {n}
                </span>
                <p className="mt-4 text-sm font-medium leading-6 text-slate-100">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Digital reports ──────────────────────────────────── */}
      <section className="section-pad bg-white">
        <div className="container-page grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-teal-700">Patient portal</p>
            <h2 className="mt-3 text-balance text-3xl font-semibold text-slate-950 md:text-4xl">Reports made simple and secure.</h2>
            <p className="mt-5 text-lg leading-8 text-slate-500">Patients can receive secure report download links, or access reports linked to their verified email. Reports can also be shared by staff via WhatsApp.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/patient/login" className="btn-primary">Patient Login <ArrowRight className="size-4" aria-hidden="true" /></Link>
              <Link href="/reports" className="btn-secondary">Download Report <FileText className="size-4" aria-hidden="true" /></Link>
            </div>
          </div>
          <div className="grid gap-4">
            {[
              { icon: Link2, title: "Secure download links", desc: "Reports shared via WhatsApp or email include a time-limited secure link." },
              { icon: User, title: "Patient login", desc: "Registered patients can log in with their email to view reports linked to their account." },
              { icon: ShieldCheck, title: "Staff-verified sharing", desc: "Reports are shared only through confirmed lab processes, not automated uploads." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex gap-4 rounded-xl border border-slate-100 bg-slate-50 p-5">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-white text-teal-700 shadow-sm"><Icon className="size-5" aria-hidden="true" /></span>
                <div><p className="font-semibold text-slate-950">{title}</p><p className="mt-1 text-sm leading-6 text-slate-500">{desc}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Medical leadership teaser ────────────────────────── */}
      <section className="section-pad bg-[#FAFCFD]">
        <div className="container-page">
          <div className="mb-12 text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-teal-700">Medical leadership</p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-950 md:text-4xl">
              Doctor-guided diagnostic care.
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-slate-500">
              Nova Diagnostics is shaped by medical leadership committed to diagnostic accuracy and patient-centred care.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 max-w-2xl mx-auto">
            {siteConfig.doctors.map((doctor) => (
              <DoctorTeaser key={doctor.name} doctor={doctor} />
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link href="/about#medical-leadership" className="btn-secondary">
              Meet our doctors
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Location and contact ─────────────────────────────── */}
      <section className="section-pad bg-white">
        <div className="container-page">
          <div className="mb-10">
            <p className="text-sm font-semibold uppercase tracking-widest text-teal-700">Location</p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-950 md:text-4xl">
              Visit us in Vashi
            </h2>
          </div>
          <MapBlock />
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────── */}
      <section className="section-pad bg-[#FAFCFD]">
        <div className="container-page grid gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:items-start">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-teal-700">FAQ</p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-950">
              Common questions
            </h2>
            <p className="mt-4 leading-7 text-slate-500">
              Answers to what patients most commonly ask before booking.
            </p>
            <Link href="/contact" className="btn-primary mt-7">
              <CalendarCheck className="size-4" aria-hidden="true" />
              Book a test
            </Link>
          </div>
          <FAQAccordion items={homeFaqs} />
        </div>
      </section>

      <CTASection />
    </>
  );
}

/* Compact doctor teaser for homepage only */
function DoctorTeaser({ doctor }: { doctor: typeof siteConfig.doctors[0] }) {
  const initials = doctor.name
    .replace(/^Dr\.\s*/i, "")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2);

  return (
    <div className="card-premium flex items-center gap-5 p-5">
      <div className="relative size-20 shrink-0 overflow-hidden rounded-[8px] bg-[#061A33]">
        {doctor.imageAvailable !== false ? (
          <Image
            src={doctor.image}
            alt={doctor.name}
            fill
            sizes="80px"
            className="object-cover object-top"
            unoptimized
          />
        ) : (
          <span className="flex size-full items-center justify-center text-lg font-bold text-white">
            {initials}
          </span>
        )}
      </div>
      <div>
        <p className="font-semibold text-slate-950">{doctor.name}</p>
        {doctor.degree && !doctor.degree.startsWith("[") ? (
          <p className="mt-0.5 text-sm text-teal-700">{doctor.degree}</p>
        ) : null}
        <p className="mt-1 text-xs leading-5 text-slate-500">Medical Leadership, Nova Diagnostics</p>
      </div>
    </div>
  );
}
