import { defaultWhatsappMessage, siteConfig } from "@/config/site";

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function getWhatsappUrl(message = defaultWhatsappMessage) {
  return `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(
    message,
  )}`;
}

export function getCallUrl() {
  return `tel:${siteConfig.phone}`;
}

export function getDirectionsUrl() {
  if (siteConfig.googleMapsUrl.startsWith("http")) {
    return siteConfig.googleMapsUrl;
  }

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    siteConfig.address,
  )}`;
}

export function getDoctorCallUrl(phone: string) {
  return `tel:${phone}`;
}

export function slugToTitle(slug: string) {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function safeJsonLd(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function normalizeIndianMobile(value: string) {
  const digits = value.replace(/\D/g, "");

  if (digits.length === 12 && digits.startsWith("91")) {
    return digits.slice(2);
  }

  return digits;
}

export function isValidIndianMobile(value: string) {
  return /^[6-9]\d{9}$/.test(normalizeIndianMobile(value));
}
