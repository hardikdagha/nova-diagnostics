export type DoctorProfile = {
  name: string;
  phone: string;
  displayPhone: string;
  degree: string;
  image: string;
  imageAvailable?: boolean;
  bio: string;
};

export const siteConfig = {
  businessName: "Nova Diagnostics",
  tagline: "Committed to Care!",
  description:
    "Book blood tests, health packages, prescription support and home sample collection with Nova Diagnostics in Vashi, Navi Mumbai.",
  url: "https://www.novadiagnosticslab.com",
  logoImage: "/images/nova-logo.jpg",
  phone: "+918433706778",
  displayPhone: "+91 8433706778",
  whatsappNumber: "918433706778",
  email: "contact@novadiagnosticslab.com",
  address:
    "Shop No. 27, Daffodils CHS, Plot No 1-1 & 1-2, Sector-14, Vashi, Navi Mumbai - 400703, Maharashtra, India",
  city: "Navi Mumbai",
  area: "Vashi",
  state: "Maharashtra",
  postalCode: "400703",
  country: "India",
  googleMapsUrl: "[ADD GOOGLE MAPS URL]",
  timings: "[ADD TIMINGS]",
  nablStatus: "not-claimed" as "not-claimed" | "in-process" | "accredited",
  doctors: [
    {
      name: "Chandresh Dagha",
      phone: "+918898989096",
      displayPhone: "+91 8898989096",
      degree: "MSc, Microbiology",
      image: "/images/doctors/dr-chandresh-dagha.jpg",
      imageAvailable: true,
      bio: "Chandresh Dagha has led Nova Diagnostics for over 34 years, maintaining careful focus on diagnostic quality, methodical laboratory processes, and patient-centred care.",
    },
    {
      name: "Dr. Sujeet N. Singh",
      phone: "+919821173323",
      displayPhone: "+91 9821173323",
      degree: "MBBS, DPB, AFIH, MBA",
      image: "/images/doctors/dr-sujit-singh.jpg",
      imageAvailable: false,
      bio: "Dr. Sujeet N. Singh brings clinical expertise to Nova Diagnostics as a consultant pathologist. Reg No: 2003/05/2155.",
    },
  ] satisfies DoctorProfile[],
  serviceAreas: [
    "Vashi",
    "Sanpada",
    "Kopar Khairane",
    "Turbhe",
    "Ghansoli",
    "Nerul",
    "Juinagar",
    "APMC area",
    "Nearby Navi Mumbai areas",
  ],
  popularTests: [
    "cbc",
    "thyroid-profile",
    "hba1c",
    "lipid-profile",
    "liver-function-test",
    "kidney-function-test",
    "vitamin-d",
    "vitamin-b12",
    "urine-routine",
    "fever-panel",
  ],
};

export const defaultWhatsappMessage =
  "Hello Nova Diagnostics, I would like to book a test.";

export const bookingReasons = [
  "Book test",
  "Home collection",
  "Prescription upload",
  "Package inquiry",
  "Doctor/corporate inquiry",
];
