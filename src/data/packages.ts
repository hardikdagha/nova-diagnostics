export type HealthPackage = {
  name: string;
  slug: string;
  idealFor: string;
  description: string;
  includedTests: string[];
  fasting: string;
  reportTime: string;
  price: string;
  highlight?: string;
};

export const packages: HealthPackage[] = [
  {
    name: "Basic Health Check",
    slug: "basic-health-check",
    idealFor: "First-time preventive screening",
    description:
      "A concise routine health check for people who want a simple overview of key wellness markers.",
    includedTests: ["CBC", "Blood sugar screening", "Urine routine", "Basic liver and kidney markers"],
    fasting: "As advised",
    reportTime: "Same day or next day",
    price: "Contact for price",
    highlight: "Simple starter checkup",
  },
  {
    name: "Full Body Checkup",
    slug: "full-body-checkup",
    idealFor: "Annual family wellness review",
    description:
      "A broader preventive checkup combining commonly requested blood and urine screening groups.",
    includedTests: ["CBC", "Sugar profile", "Lipid profile", "Liver screening", "Kidney screening", "Vitamin screening"],
    fasting: "12 hours fasting required",
    reportTime: "Same day or next day",
    price: "Contact for price",
    highlight: "Popular preventive option",
  },
  {
    name: "Diabetes Care Package",
    slug: "diabetes-care-package",
    idealFor: "Diabetes screening and follow-up",
    description:
      "A focused package for sugar monitoring and related preventive health review as advised by doctors.",
    includedTests: ["Fasting blood sugar", "Post meal sugar", "HbA1c", "Kidney markers", "Lipid profile"],
    fasting: "Yes",
    reportTime: "Same day or next day",
    price: "Contact for price",
    highlight: "For regular monitoring",
  },
  {
    name: "Thyroid Care Package",
    slug: "thyroid-care-package",
    idealFor: "Thyroid screening and follow-up",
    description:
      "A thyroid-focused package for routine screening or ongoing doctor-advised monitoring.",
    includedTests: ["TSH", "Thyroid profile", "CBC", "Vitamin D or B12 as advised"],
    fasting: "No",
    reportTime: "Same day or next day",
    price: "Contact for price",
    highlight: "No fasting in many cases",
  },
  {
    name: "Senior Citizen Health Check",
    slug: "senior-citizen-health-check",
    idealFor: "Older adults and regular family monitoring",
    description:
      "A practical screening package designed around routine wellness markers and convenient home collection.",
    includedTests: ["CBC", "Sugar profile", "Lipid profile", "Liver markers", "Kidney markers", "Urine routine"],
    fasting: "As advised",
    reportTime: "Same day or next day",
    price: "Contact for price",
    highlight: "Home collection friendly",
  },
  {
    name: "Women's Wellness Package",
    slug: "womens-wellness-package",
    idealFor: "Preventive wellness for women",
    description:
      "A wellness checkup that can be tailored for fatigue, nutrition and routine preventive health needs.",
    includedTests: ["CBC", "Thyroid screening", "Vitamin D", "Vitamin B12", "Iron profile", "Sugar screening"],
    fasting: "As advised",
    reportTime: "Same day or next day",
    price: "Contact for price",
    highlight: "Wellness oriented",
  },
  {
    name: "Fever and Infection Panel",
    slug: "fever-and-infection-panel",
    idealFor: "Doctor-advised fever testing",
    description:
      "A symptom and prescription-led testing option for fever evaluation, with guidance from the lab team on test list coordination.",
    includedTests: ["CBC", "CRP", "Dengue test as advised", "Malaria test as advised", "Other prescription-based tests"],
    fasting: "No",
    reportTime: "As advised",
    price: "Contact for price",
    highlight: "Prescription guided",
  },
  {
    name: "Heart Health Package",
    slug: "heart-health-package",
    idealFor: "Preventive heart-health screening",
    description:
      "A preventive package focused on cholesterol, sugar and related wellness markers often reviewed for heart health.",
    includedTests: ["Lipid profile", "Blood sugar screening", "HbA1c", "Kidney markers", "Selected routine markers"],
    fasting: "As advised",
    reportTime: "Same day or next day",
    price: "Contact for price",
    highlight: "Preventive focus",
  },
  {
    name: "Vitamin Deficiency Check",
    slug: "vitamin-deficiency-check",
    idealFor: "Fatigue and nutrition review",
    description:
      "A focused package for commonly requested vitamin and nutrition-related markers as advised by doctors.",
    includedTests: ["Vitamin D", "Vitamin B12", "CBC", "Iron profile as advised"],
    fasting: "No",
    reportTime: "Same day or next day",
    price: "Contact for price",
    highlight: "Nutrition support",
  },
];

export function getPackageBySlug(slug: string) {
  return packages.find((healthPackage) => healthPackage.slug === slug);
}

export function getRelatedPackages(slug: string) {
  return packages.filter((healthPackage) => healthPackage.slug !== slug).slice(0, 3);
}
