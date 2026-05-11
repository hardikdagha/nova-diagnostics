import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { MobileStickyCTA } from "@/components/layout/MobileStickyCTA";
import { siteConfig } from "@/config/site";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: "Nova Diagnostics | Blood Tests and Health Checkups in Vashi, Navi Mumbai",
    template: "%s | Nova Diagnostics",
  },
  description: siteConfig.description,
  openGraph: {
    title: "Nova Diagnostics | Blood Tests and Health Checkups in Vashi, Navi Mumbai",
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.businessName,
    locale: "en_IN",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-IN" className={manrope.variable}>
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
        <MobileStickyCTA />
      </body>
    </html>
  );
}
