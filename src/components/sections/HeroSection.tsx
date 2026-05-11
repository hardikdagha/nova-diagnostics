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
  Search,
  ShieldCheck,
} from "lucide-react";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { siteConfig } from "@/config/site";
import { getDirectionsUrl, getWhatsappUrl } from "@/lib/utils";

const heroBadges = [
  { label: "Home sample collection available", icon: Home },
  { label: "Digital reports", icon: FileText },
  { label: "Located in Vashi, Navi Mumbai", icon: MapPinned },
  { label: "Prescription support", icon: ClipboardCheck },
  { label: "Clear communication", icon: ShieldCheck },
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-[linear-gradient(135deg,#FFFEFB_0%,#EAF8F9_48%,#FFFFFF_100%)]">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-[#D83A31]/25 via-[#00A6A6]/45 to-[#4C9A3A]/25" aria-hidden="true" />
      <div className="container-page relative grid min-w-0 gap-12 py-12 md:py-16 lg:grid-cols-[1fr_0.95fr] lg:items-center lg:py-20">
        <div className="min-w-0 animate-fade-up">
          <div className="mb-7 rounded-[8px] border border-white bg-white/75 p-4 shadow-sm shadow-slate-200/70 backdrop-blur sm:w-fit">
            <BrandLogo variant="feature" />
          </div>
          <p className="inline-flex rounded-[8px] border border-cyan-200 bg-white/80 px-3 py-1 text-sm font-semibold text-teal-800 shadow-sm shadow-slate-200/70">
            {siteConfig.tagline}
          </p>
          <h1 className="mt-5 max-w-4xl break-words text-4xl font-semibold leading-tight text-slate-950 md:text-6xl">
            Diagnostics You Can Trust. Care You Can Feel.
          </h1>
          <p className="mt-5 max-w-2xl text-pretty text-lg leading-8 text-slate-600">
            Nova Diagnostics offers blood tests, health checkups, home sample collection, and digital reports for families in Vashi and nearby Navi Mumbai areas.
          </p>

          <div className="mt-7 grid gap-3 sm:flex sm:flex-wrap">
            <Link href="/contact" className="btn-primary">
              <CalendarCheck className="size-4" aria-hidden="true" />
              Book a Test
            </Link>
            <a href={getWhatsappUrl()} className="btn-secondary">
              <MessageCircle className="size-4" aria-hidden="true" />
              WhatsApp Now
            </a>
            <a href={getDirectionsUrl()} target="_blank" className="btn-secondary">
              <MapPinned className="size-4" aria-hidden="true" />
              Get Directions
            </a>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {heroBadges.map((badge) => {
              const Icon = badge.icon;

              return (
                <div key={badge.label} className="flex items-center gap-3 rounded-[8px] border border-white/90 bg-white/80 p-3 shadow-sm shadow-slate-200/70 backdrop-blur">
                  <span className="flex size-10 items-center justify-center rounded-[8px] bg-cyan-50 text-teal-700">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <span className="text-sm font-semibold text-slate-800">{badge.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="min-w-0 animate-fade-up animation-delay-150">
          <div className="relative overflow-hidden rounded-[8px] border border-white/70 bg-white shadow-2xl shadow-slate-900/12">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#D83A31] via-[#00A6A6] to-[#4C9A3A]" aria-hidden="true" />
            <div className="relative aspect-[4/3] min-h-[380px]">
              <Image
                src="/images/nova-lab-hero.jpg"
                alt="Modern diagnostic laboratory interior"
                fill
                priority
                unoptimized
                sizes="(min-width: 1024px) 48vw, 100vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#061A33]/78 via-[#061A33]/10 to-transparent" />
            </div>
            <div className="absolute inset-x-4 bottom-4 rounded-[8px] border border-white/35 bg-white/94 p-4 shadow-xl shadow-slate-900/18 backdrop-blur md:inset-x-6 md:bottom-6 md:p-5">
              <div className="flex items-center gap-3">
                <span className="flex size-11 items-center justify-center rounded-[8px] bg-[#061A33] text-white">
                  <Search className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-950">Find your test quickly</p>
                  <p className="text-xs text-slate-500">CBC, Thyroid, HbA1c, Vitamin D, Fever Panel</p>
                </div>
              </div>
              <Link href="/tests" className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-[8px] bg-cyan-50 px-4 py-3 text-sm font-semibold text-teal-800 transition hover:bg-cyan-100">
                Browse test catalogue
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
