import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CalendarCheck,
  ClipboardCheck,
  FileText,
  Home,
  MapPinned,
  MessageCircle,
  ShieldCheck,
} from "lucide-react";
import { siteConfig } from "@/config/site";
import { getDirectionsUrl, getWhatsappUrl } from "@/lib/utils";

const trustBadges = [
  { icon: Home, text: "Home sample collection" },
  { icon: FileText, text: "Digital reports" },
  { icon: MapPinned, text: "Vashi, Navi Mumbai" },
  { icon: ClipboardCheck, text: "Prescription support" },
  { icon: ShieldCheck, text: "Clear communication" },
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-white">
      {/* Subtle top accent line matching logo colors */}
      <div
        className="absolute inset-x-0 top-0 h-1"
        style={{ background: "linear-gradient(90deg,#D83A31 0%,#E8A020 25%,#4C9A3A 50%,#2E8BAD 75%,#D83A31 100%)" }}
        aria-hidden="true"
      />

      <div className="container-page grid min-w-0 gap-10 py-16 md:py-20 lg:grid-cols-2 lg:items-center lg:py-24 xl:gap-16">

        {/* Left — editorial text block */}
        <div className="min-w-0 animate-fade-up">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-4 py-1.5">
            <span className="size-2 rounded-full bg-teal-500" aria-hidden="true" />
            <span className="text-sm font-semibold text-teal-800">{siteConfig.tagline}</span>
          </div>

          <h1 className="mt-6 text-[2.6rem] font-bold leading-[1.15] tracking-tight text-slate-950 md:text-5xl lg:text-[3.25rem]">
            Diagnostics you can trust.<br />
            <span className="text-[#0F766E]">Care you can feel.</span>
          </h1>

          <p className="mt-6 max-w-lg text-lg leading-8 text-slate-500">
            Blood tests, health checkups, home sample collection and digital reports for families in Vashi and nearby Navi Mumbai areas.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/contact" className="btn-primary gap-2.5 px-6 py-3.5 text-[15px]">
              <CalendarCheck className="size-4" aria-hidden="true" />
              Book a Test
            </Link>
            <a href={getWhatsappUrl()} className="btn-secondary gap-2.5 px-6 py-3.5 text-[15px]">
              <MessageCircle className="size-4" aria-hidden="true" />
              WhatsApp Us
            </a>
            <a href={getDirectionsUrl()} target="_blank" className="btn-secondary gap-2.5 px-6 py-3.5 text-[15px]">
              <MapPinned className="size-4" aria-hidden="true" />
              Get Directions
            </a>
          </div>

          <div className="mt-8 flex flex-wrap gap-2.5">
            {trustBadges.map((b) => {
              const Icon = b.icon;
              return (
                <div key={b.text} className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-2 shadow-sm">
                  <Icon className="size-3.5 shrink-0 text-teal-700" aria-hidden="true" />
                  <span className="text-xs font-semibold text-slate-700">{b.text}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right — lab image */}
        <div className="min-w-0 animate-fade-up animation-delay-150">
          <div className="relative overflow-hidden rounded-2xl shadow-2xl shadow-slate-900/15">
            {/* Logo-colour accent bar */}
            <div
              className="absolute inset-x-0 top-0 z-10 h-1.5"
              style={{ background: "linear-gradient(90deg,#D83A31,#E8A020,#4C9A3A,#2E8BAD)" }}
              aria-hidden="true"
            />
            <div className="relative aspect-[16/11]">
              <Image
                src="/images/nova-lab-hero.jpg"
                alt="Nova Diagnostics laboratory in Vashi, Navi Mumbai"
                fill
                priority
                unoptimized
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
              {/* Bottom overlay with a quick CTA */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#061A33]/80 via-[#061A33]/10 to-transparent" />
            </div>
            <div className="absolute inset-x-5 bottom-5 rounded-xl border border-white/20 bg-white/95 p-4 backdrop-blur md:inset-x-6 md:bottom-6 md:p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-slate-950">Nova Diagnostics</p>
                  <p className="mt-0.5 text-sm text-slate-500">Daffodils CHS, Sector-14, Vashi · Navi Mumbai</p>
                </div>
                <Link
                  href="/tests"
                  className="flex shrink-0 items-center gap-2 rounded-lg bg-[#061A33] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0b3b75]"
                >
                  Find a test
                  <ArrowRight className="size-3.5" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
