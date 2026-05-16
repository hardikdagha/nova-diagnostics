import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, FileText, Home, MessageCircle, ShieldCheck } from "lucide-react";
import { PrescriptionUploadForm } from "@/components/forms/PrescriptionUploadForm";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { DisclaimerBox } from "@/components/ui/DisclaimerBox";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getWhatsappUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Upload Prescription",
  description:
    "Upload your prescription request to Nova Diagnostics in Vashi and get help identifying required tests and booking options.",
  alternates: {
    canonical: "/upload-prescription",
  },
};

const points = [
  "Share your prescription request if test names are unclear",
  "Choose WhatsApp, phone call or email as preferred contact method",
  "Ask for home sample collection if needed",
  "Shared details are used only to assist with test identification and booking",
];

export default function UploadPrescriptionPage() {
  return (
    <>
      <section className="bg-[linear-gradient(135deg,#FAFCFD_0%,#E6F7FA_100%)] py-12 md:py-16">
        <div className="container-page">
          <Breadcrumbs items={[{ label: "Upload Prescription" }]} />
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase text-teal-700">
                Prescription help
              </p>
              <h1 className="mt-3 text-balance text-4xl font-semibold leading-tight text-slate-950 md:text-5xl">
                Upload your prescription for test-list assistance.
              </h1>
              <p className="mt-5 text-lg leading-8 text-slate-600">
                Share your prescription and our team will help identify the required tests and booking options.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <a href={getWhatsappUrl("Hello Nova Diagnostics, I need help with tests on my prescription.")} className="btn-primary">
                  <MessageCircle className="size-4" aria-hidden="true" />
                  WhatsApp Now
                </a>
                <Link href="/home-sample-collection" className="btn-secondary">
                  <Home className="size-4" aria-hidden="true" />
                  Home Collection
                </Link>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="card-premium p-5">
                <FileText className="size-9 text-teal-700" aria-hidden="true" />
                <h2 className="mt-4 text-xl font-semibold text-slate-950">Prescription-led booking</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Useful when the doctor has written tests but the names are hard to read or shortlist.
                </p>
              </div>
              <div className="card-premium p-5">
                <ShieldCheck className="size-9 text-teal-700" aria-hidden="true" />
                <h2 className="mt-4 text-xl font-semibold text-slate-950">Privacy-aware flow</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Your prescription details are handled with care and used only to assist with test identification and booking support.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-pad">
        <div className="container-page grid gap-10 lg:grid-cols-[0.82fr_1.18fr]">
          <div>
            <SectionHeading
              eyebrow="Request form"
              title="Tell us how to reach you"
              description="The team can help confirm tests, preparation, price and booking options after reviewing the prescription request."
            />
            <ul className="mt-8 grid gap-4">
              {points.map((point) => (
                <li key={point} className="flex gap-3 text-slate-600">
                  <CheckCircle2 className="mt-1 size-5 shrink-0 text-teal-700" aria-hidden="true" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <DisclaimerBox>
                Please share only the prescription details needed for test identification. For medical emergencies, contact emergency services or visit the nearest hospital.
              </DisclaimerBox>
            </div>
          </div>
          <PrescriptionUploadForm />
        </div>
      </section>

      <section className="section-pad bg-white">
        <div className="container-page max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-teal-700">What happens next</p>
          <h2 className="mt-3 text-2xl font-semibold text-slate-950">How the prescription review works</h2>
          <ol className="mt-8 grid gap-4">
            {[
              ["Upload prescription", "Share a PDF, JPG or PNG of your prescription through the request form."],
              ["Staff reviews test names", "The Nova Diagnostics team reviews the tests listed and identifies what's needed."],
              ["Team contacts you for booking", "We reach out via your preferred method — WhatsApp, call or email — to confirm tests, preparation and booking options."],
            ].map(([title, desc], i) => (
              <li key={title} className="flex gap-4">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#061A33] text-sm font-bold text-white">{i + 1}</span>
                <div className="pt-0.5">
                  <p className="font-semibold text-slate-950">{title}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-500">{desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}
