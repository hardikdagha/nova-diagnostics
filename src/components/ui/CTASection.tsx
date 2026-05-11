import Link from "next/link";
import { ArrowRight, MessageCircle, Phone } from "lucide-react";
import { siteConfig } from "@/config/site";
import { getCallUrl, getWhatsappUrl } from "@/lib/utils";

type CTASectionProps = {
  title?: string;
  description?: string;
  primaryHref?: string;
  primaryLabel?: string;
};

export function CTASection({
  title = "Book your test with Nova Diagnostics",
  description = "Share your test name or prescription and the team will help you with booking, preparation and home collection options.",
  primaryHref = "/contact",
  primaryLabel = "Book a Test",
}: CTASectionProps) {
  return (
    <section className="section-pad">
      <div className="container-page">
        <div className="overflow-hidden rounded-[8px] bg-[#061A33] p-6 text-white shadow-2xl shadow-slate-900/20 md:p-10">
          <div className="grid gap-8 md:grid-cols-[1.2fr_0.8fr] md:items-center">
            <div>
              <p className="text-sm font-semibold uppercase text-cyan-200">
                {siteConfig.area}, {siteConfig.city}
              </p>
              <h2 className="mt-3 text-balance text-3xl font-semibold md:text-4xl">
                {title}
              </h2>
              <p className="mt-4 max-w-2xl text-pretty leading-7 text-slate-200">
                {description}
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3 md:grid-cols-1 lg:grid-cols-3">
              <Link href={primaryHref} className="btn-primary bg-white text-[#061A33] hover:bg-cyan-50">
                {primaryLabel}
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
              <a href={getWhatsappUrl()} className="btn-secondary border-white/25 text-white hover:bg-white/10">
                <MessageCircle className="size-4" aria-hidden="true" />
                WhatsApp
              </a>
              <a href={getCallUrl()} className="btn-secondary border-white/25 text-white hover:bg-white/10">
                <Phone className="size-4" aria-hidden="true" />
                Call
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
