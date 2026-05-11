import Link from "next/link";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { packages } from "@/data/packages";
import { tests } from "@/data/tests";
import { siteConfig } from "@/config/site";
import { getCallUrl, getWhatsappUrl } from "@/lib/utils";

const quickLinks = [
  ["Tests", "/tests"],
  ["Health Packages", "/packages"],
  ["Home Sample Collection", "/home-sample-collection"],
  ["Upload Prescription", "/upload-prescription"],
  ["About", "/about"],
  ["Contact", "/contact"],
  ["Privacy Policy", "/privacy-policy"],
  ["Terms", "/terms"],
];

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-[#061A33] pb-24 text-white lg:pb-0">
      <div className="container-page py-12 md:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.25fr_0.75fr_0.85fr_1.05fr]">
          <div>
            <div className="w-fit rounded-xl bg-white p-4">
              <BrandLogo variant="footer" />
            </div>
            <p className="mt-5 max-w-sm text-sm leading-7 text-slate-300">
              Blood tests, health checkups, prescription support and home sample collection for families in Vashi and nearby Navi Mumbai areas.
            </p>
            <p className="mt-4 text-xs leading-6 text-slate-400">
              Information on this website is for general awareness only and should not replace advice from a qualified doctor.
            </p>
          </div>

          <div>
            <h2 className="text-sm font-semibold uppercase text-cyan-100">Quick links</h2>
            <ul className="mt-4 grid gap-3 text-sm text-slate-200">
              {quickLinks.map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="hover:text-white">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-semibold uppercase text-cyan-100">Popular tests</h2>
            <ul className="mt-4 grid gap-3 text-sm text-slate-200">
              {tests.slice(0, 7).map((test) => (
                <li key={test.slug}>
                  <Link href={`/tests/${test.slug}`} className="hover:text-white">
                    {test.name}
                  </Link>
                </li>
              ))}
            </ul>
            <h2 className="mt-8 text-sm font-semibold uppercase text-cyan-100">
              Packages
            </h2>
            <ul className="mt-4 grid gap-3 text-sm text-slate-200">
              {packages.slice(0, 4).map((healthPackage) => (
                <li key={healthPackage.slug}>
                  <Link href={`/packages/${healthPackage.slug}`} className="hover:text-white">
                    {healthPackage.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-semibold uppercase text-cyan-100">Contact</h2>
            <ul className="mt-4 grid gap-4 text-sm text-slate-200">
              <li className="flex gap-3">
                <MapPin className="mt-0.5 size-4 shrink-0 text-cyan-200" aria-hidden="true" />
                <span>{siteConfig.address}</span>
              </li>
              <li>
                <a href={getCallUrl()} className="flex gap-3 hover:text-white">
                  <Phone className="mt-0.5 size-4 shrink-0 text-cyan-200" aria-hidden="true" />
                  <span>{siteConfig.displayPhone}</span>
                </a>
              </li>
              <li>
                <a href={getWhatsappUrl()} className="flex gap-3 hover:text-white">
                  <MessageCircle className="mt-0.5 size-4 shrink-0 text-cyan-200" aria-hidden="true" />
                  <span>WhatsApp booking support</span>
                </a>
              </li>
              {siteConfig.email && !siteConfig.email.startsWith("[") ? (
                <li className="flex gap-3">
                  <Mail className="mt-0.5 size-4 shrink-0 text-cyan-200" aria-hidden="true" />
                  <span>{siteConfig.email}</span>
                </li>
              ) : null}
              {siteConfig.timings && !siteConfig.timings.startsWith("[") ? (
                <li>
                  <span className="font-semibold text-white">Timings:</span>{" "}
                  {siteConfig.timings}
                </li>
              ) : null}
            </ul>
            <h2 className="mt-8 text-sm font-semibold uppercase text-cyan-100">
              Medical leadership
            </h2>
            <ul className="mt-4 grid gap-3 text-sm text-slate-200">
              {siteConfig.doctors.map((doctor) => (
                <li key={doctor.name}>
                  <a href={`tel:${doctor.phone}`} className="hover:text-white">
                    {doctor.name}: {doctor.displayPhone}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-white/10 pt-6 text-xs text-slate-300">
          <p>
            &copy; {new Date().getFullYear()} Nova Diagnostics, Vashi, Navi Mumbai. Information on this website is for general awareness and does not constitute medical advice.
          </p>
        </div>
      </div>
    </footer>
  );
}
