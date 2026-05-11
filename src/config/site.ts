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
  url: "https://www.novadiagnostics.in",
  logoImage: "/images/nova-logo.jpg",
  phone: "+918433706778",
  displayPhone: "+91 8433706778",
  whatsappNumber: "918433706778",
  email: "[ADD EMAIL]",
  address:
    "Sungrace CHS, 1st Floor, F1/C2, above Ribbons and Balloons Cake Shop, Juhu Nagar, Sector 10, Vashi, Navi Mumbai - 400703, Maharashtra, India",
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
      name: "Dr. Chandresh Dagha",
      phone: "+918898989096",
      displayPhone: "+91 8898989096",
      degree: "MSc in Microbiology",
      image: "/images/doctors/dr-chandresh-dagha.jpg",
      imageAvailable: true,
      bio: "Dr. Chandresh Dagha has guided Nova Diagnostics for over 34 years, bringing deep focus to diagnostic quality, careful laboratory processes and patient-centred care.",
    },
    {
      name: "Dr. Sujit Singh",
      phone: "+919821173323",
      displayPhone: "+91 9821173323",
      degree: "[ADD DEGREE]",
      image: "/images/doctors/dr-sujit-singh.jpg",
      imageAvailable: false,
      bio: "Dr. Sujit Singh supports the medical leadership at Nova Diagnostics with a focus on diagnostic care and patient support. Detailed qualifications will be updated upon verification.",
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
