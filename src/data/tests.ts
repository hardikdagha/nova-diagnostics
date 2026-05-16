export type TestCategory =
  | "Blood Tests"
  | "Diabetes"
  | "Thyroid"
  | "Vitamins"
  | "Liver"
  | "Kidney"
  | "Fever/Infection"
  | "Urine"
  | "Heart Health";

export type LabTest = {
  name: string;
  slug: string;
  category: TestCategory;
  description: string;
  sampleType: string;
  fasting: string;
  reportTime: string;
  price: string;
  homeCollection: boolean;
  whatIsIt: string;
  commonlyRecommended: string[];
  preparation: string[];
  relatedTests: string[];
};

export const testCategories: Array<"All" | TestCategory> = [
  "All",
  "Blood Tests",
  "Diabetes",
  "Thyroid",
  "Vitamins",
  "Liver",
  "Kidney",
  "Fever/Infection",
  "Urine",
  "Heart Health",
];

export const tests: LabTest[] = [
  {
    name: "CBC",
    slug: "cbc",
    category: "Blood Tests",
    description:
      "A commonly requested blood test that helps doctors review overall blood cell counts.",
    sampleType: "Blood",
    fasting: "No",
    reportTime: "Same day or as advised",
    price: "Contact for price",
    homeCollection: true,
    whatIsIt:
      "CBC, or Complete Blood Count, is a routine blood test used by doctors to review red cells, white cells and platelets as part of general health assessment.",
    commonlyRecommended: [
      "Routine health checkups",
      "Fever or infection evaluation",
      "Weakness, fatigue or follow-up monitoring",
    ],
    preparation: ["No fasting is usually required.", "Share current medicines or symptoms with the lab team."],
    relatedTests: ["esr", "crp", "fever-panel"],
  },
  {
    name: "Thyroid Profile",
    slug: "thyroid-profile",
    category: "Thyroid",
    description:
      "A thyroid screening profile commonly used to assess thyroid hormone balance.",
    sampleType: "Blood",
    fasting: "No",
    reportTime: "Same day or next day",
    price: "Contact for price",
    homeCollection: true,
    whatIsIt:
      "A Thyroid Profile helps doctors review thyroid-related markers and decide whether further evaluation or treatment adjustment is needed.",
    commonlyRecommended: [
      "Unexplained weight change",
      "Fatigue, hair fall or menstrual changes",
      "Monitoring known thyroid conditions",
    ],
    preparation: [
      "Fasting is usually not required.",
      "If you take thyroid medication, follow your doctor's timing instructions.",
    ],
    relatedTests: ["tsh", "vitamin-d", "vitamin-b12"],
  },
  {
    name: "TSH",
    slug: "tsh",
    category: "Thyroid",
    description:
      "A focused thyroid blood test commonly used for screening and monitoring.",
    sampleType: "Blood",
    fasting: "No",
    reportTime: "Same day or next day",
    price: "Contact for price",
    homeCollection: true,
    whatIsIt:
      "TSH is a thyroid-related blood test that doctors commonly use to screen thyroid function and monitor ongoing thyroid care.",
    commonlyRecommended: [
      "Routine thyroid screening",
      "Follow-up for thyroid medication",
      "Symptoms that may need thyroid evaluation",
    ],
    preparation: [
      "No fasting is usually required.",
      "Follow your doctor's advice about medicine timing before the sample.",
    ],
    relatedTests: ["thyroid-profile", "vitamin-d", "vitamin-b12"],
  },
  {
    name: "HbA1c",
    slug: "hba1c",
    category: "Diabetes",
    description:
      "A diabetes monitoring blood test that reflects longer-term blood sugar control.",
    sampleType: "Blood",
    fasting: "No",
    reportTime: "Same day or next day",
    price: "Contact for price",
    homeCollection: true,
    whatIsIt:
      "HbA1c is commonly used by doctors to understand longer-term sugar control in people being screened or monitored for diabetes.",
    commonlyRecommended: [
      "Diabetes screening",
      "Diabetes follow-up",
      "Health checkups for people with risk factors",
    ],
    preparation: ["Fasting is usually not required.", "Carry previous reports if available."],
    relatedTests: ["fasting-blood-sugar", "post-prandial-blood-sugar", "lipid-profile"],
  },
  {
    name: "Fasting Blood Sugar",
    slug: "fasting-blood-sugar",
    category: "Diabetes",
    description:
      "A blood sugar test usually done after an overnight fasting period.",
    sampleType: "Blood",
    fasting: "Yes",
    reportTime: "Same day",
    price: "Contact for price",
    homeCollection: true,
    whatIsIt:
      "Fasting Blood Sugar measures blood glucose after fasting and is commonly used for diabetes screening or monitoring.",
    commonlyRecommended: [
      "Diabetes screening",
      "Routine metabolic checkups",
      "Monitoring blood sugar trends",
    ],
    preparation: [
      "Confirm fasting duration with the lab or your doctor.",
      "Drink water unless advised otherwise.",
    ],
    relatedTests: ["post-prandial-blood-sugar", "hba1c", "lipid-profile"],
  },
  {
    name: "Post Prandial Blood Sugar",
    slug: "post-prandial-blood-sugar",
    category: "Diabetes",
    description:
      "A blood sugar test collected 2 hours after a meal as part of diabetes evaluation or follow-up.",
    sampleType: "Blood",
    fasting: "2 hours after meal",
    reportTime: "Same day",
    price: "Contact for price",
    homeCollection: true,
    whatIsIt:
      "Post Prandial Blood Sugar helps doctors review glucose levels after food intake as part of diabetes evaluation or follow-up.",
    commonlyRecommended: [
      "Diabetes monitoring",
      "Follow-up after fasting sugar test",
      "Doctor-advised sugar profile",
    ],
    preparation: [
      "Sample should be collected 2 hours after meal.",
      "Inform the lab team of your meal time when arriving for the test.",
      "Mention current medicines to the lab team if relevant.",
    ],
    relatedTests: ["fasting-blood-sugar", "hba1c", "lipid-profile"],
  },
  {
    name: "Lipid Profile",
    slug: "lipid-profile",
    category: "Heart Health",
    description:
      "A heart-health screening profile used to review cholesterol-related markers.",
    sampleType: "Blood",
    fasting: "12–14 hours fasting required",
    reportTime: "Same day or next day",
    price: "Contact for price",
    homeCollection: true,
    whatIsIt:
      "Lipid Profile is commonly used to review cholesterol and related heart-health markers as part of preventive health assessment.",
    commonlyRecommended: [
      "Routine preventive checkups",
      "Diabetes or blood pressure follow-up",
      "Family history of heart health concerns",
    ],
    preparation: [
      "12–14 hours fasting is required before the test.",
      "Drink water — staying hydrated is fine during the fasting period.",
      "Avoid food, tea, coffee, and juice during the fasting window.",
      "Confirm exact preparation instructions while booking.",
    ],
    relatedTests: ["hba1c", "liver-function-test", "kidney-function-test"],
  },
  {
    name: "Liver Function Test",
    slug: "liver-function-test",
    category: "Liver",
    description:
      "A blood test profile used by doctors to review liver-related markers.",
    sampleType: "Blood",
    fasting: "As advised",
    reportTime: "Same day or next day",
    price: "Contact for price",
    homeCollection: true,
    whatIsIt:
      "A Liver Function Test is a group of blood tests that helps doctors assess liver-related markers during screening, illness evaluation or follow-up.",
    commonlyRecommended: [
      "Routine health checkups",
      "Medication or illness follow-up",
      "Doctor-advised liver marker review",
    ],
    preparation: ["Confirm fasting instructions while booking.", "Share current medicines if requested."],
    relatedTests: ["kidney-function-test", "lipid-profile", "cbc"],
  },
  {
    name: "Kidney Function Test",
    slug: "kidney-function-test",
    category: "Kidney",
    description:
      "A blood test profile used to review kidney-related markers.",
    sampleType: "Blood",
    fasting: "As advised",
    reportTime: "Same day or next day",
    price: "Contact for price",
    homeCollection: true,
    whatIsIt:
      "A Kidney Function Test helps doctors review kidney-related markers and electrolyte balance where clinically relevant.",
    commonlyRecommended: [
      "Routine health checkups",
      "Diabetes or blood pressure follow-up",
      "Doctor-advised kidney marker monitoring",
    ],
    preparation: ["Fasting may not always be needed.", "Confirm instructions before sample collection."],
    relatedTests: ["electrolytes", "urine-routine", "hba1c"],
  },
  {
    name: "Vitamin D",
    slug: "vitamin-d",
    category: "Vitamins",
    description:
      "A blood test commonly used to review vitamin D levels.",
    sampleType: "Blood",
    fasting: "No",
    reportTime: "Same day or next day",
    price: "Contact for price",
    homeCollection: true,
    whatIsIt:
      "Vitamin D testing helps doctors evaluate vitamin D status when symptoms, lifestyle factors or routine screening indicate the need.",
    commonlyRecommended: [
      "Bone health assessment",
      "Fatigue or body ache evaluation",
      "Preventive wellness checkups",
    ],
    preparation: ["No fasting is usually required.", "Carry previous vitamin reports if available."],
    relatedTests: ["vitamin-b12", "thyroid-profile", "cbc"],
  },
  {
    name: "Vitamin B12",
    slug: "vitamin-b12",
    category: "Vitamins",
    description:
      "A blood test commonly used to review vitamin B12 levels.",
    sampleType: "Blood",
    fasting: "No",
    reportTime: "Same day or next day",
    price: "Contact for price",
    homeCollection: true,
    whatIsIt:
      "Vitamin B12 testing is commonly requested by doctors during assessment of fatigue, nutrition, nerve-related symptoms or routine wellness.",
    commonlyRecommended: [
      "Fatigue evaluation",
      "Diet-related wellness checks",
      "Doctor-advised deficiency screening",
    ],
    preparation: ["No fasting is usually required.", "Mention supplements if requested."],
    relatedTests: ["vitamin-d", "cbc", "thyroid-profile"],
  },
  {
    name: "Urine Routine",
    slug: "urine-routine",
    category: "Urine",
    description:
      "A routine urine test used for general screening and doctor-advised evaluation.",
    sampleType: "Urine",
    fasting: "No",
    reportTime: "Same day",
    price: "Contact for price",
    homeCollection: true,
    whatIsIt:
      "Urine Routine is a common urine examination used by doctors as part of general health, urinary symptom or follow-up assessment.",
    commonlyRecommended: [
      "Routine health checkups",
      "Urinary symptoms",
      "Kidney or metabolic follow-up as advised",
    ],
    preparation: [
      "Use a clean sample container provided or advised by the lab.",
      "Follow collection instructions shared by the lab team.",
    ],
    relatedTests: ["kidney-function-test", "cbc", "fasting-blood-sugar"],
  },
  {
    name: "Dengue NS1",
    slug: "dengue-ns1",
    category: "Fever/Infection",
    description:
      "A fever-related test commonly advised by doctors when dengue evaluation is needed.",
    sampleType: "Blood",
    fasting: "No",
    reportTime: "As advised",
    price: "Contact for price",
    homeCollection: true,
    whatIsIt:
      "Dengue NS1 is commonly used during doctor-advised evaluation of fever where dengue infection is suspected.",
    commonlyRecommended: [
      "Fever with body ache",
      "Doctor-advised dengue evaluation",
      "Fever panel testing",
    ],
    preparation: ["No fasting is usually required.", "Seek medical care promptly for severe symptoms."],
    relatedTests: ["cbc", "crp", "malaria-parasite-test"],
  },
  {
    name: "Malaria Parasite Test",
    slug: "malaria-parasite-test",
    category: "Fever/Infection",
    description:
      "A fever-related test commonly used during doctor-advised malaria evaluation.",
    sampleType: "Blood",
    fasting: "No",
    reportTime: "As advised",
    price: "Contact for price",
    homeCollection: true,
    whatIsIt:
      "A Malaria Parasite Test is used by doctors when malaria evaluation is clinically indicated for fever or related symptoms.",
    commonlyRecommended: [
      "Fever with chills",
      "Doctor-advised malaria evaluation",
      "Fever workup",
    ],
    preparation: ["No fasting is usually required.", "Share symptom duration if requested."],
    relatedTests: ["cbc", "dengue-ns1", "crp"],
  },
  {
    name: "CRP",
    slug: "crp",
    category: "Fever/Infection",
    description:
      "A blood test often used by doctors as part of inflammation or infection evaluation.",
    sampleType: "Blood",
    fasting: "No",
    reportTime: "Same day or next day",
    price: "Contact for price",
    homeCollection: true,
    whatIsIt:
      "CRP is a blood marker that doctors may request while evaluating inflammation, infection or treatment response.",
    commonlyRecommended: [
      "Fever or infection evaluation",
      "Inflammation monitoring",
      "Doctor-advised follow-up",
    ],
    preparation: ["No fasting is usually required.", "Carry relevant prescriptions if available."],
    relatedTests: ["cbc", "esr", "fever-panel"],
  },
  {
    name: "ESR",
    slug: "esr",
    category: "Blood Tests",
    description:
      "A blood test commonly used as part of inflammation evaluation.",
    sampleType: "Blood",
    fasting: "No",
    reportTime: "Same day or next day",
    price: "Contact for price",
    homeCollection: true,
    whatIsIt:
      "ESR is a routine blood test that doctors may use along with other findings when evaluating inflammation or ongoing illness.",
    commonlyRecommended: [
      "Inflammation evaluation",
      "Doctor-advised follow-up",
      "Routine health packages",
    ],
    preparation: ["No fasting is usually required.", "Share existing conditions if requested."],
    relatedTests: ["cbc", "crp", "fever-panel"],
  },
  {
    name: "Blood Group",
    slug: "blood-group",
    category: "Blood Tests",
    description:
      "A blood test used to identify blood group as required for records or medical use.",
    sampleType: "Blood",
    fasting: "No",
    reportTime: "Same day",
    price: "Contact for price",
    homeCollection: true,
    whatIsIt:
      "Blood Group testing identifies a person's blood group for medical records, procedures or doctor-advised purposes.",
    commonlyRecommended: [
      "Medical records",
      "Pre-procedure requirements",
      "Doctor-advised testing",
    ],
    preparation: ["No fasting is required.", "Carry ID if requested by the lab."],
    relatedTests: ["cbc", "urine-routine", "full-body-checkup"],
  },
  {
    name: "Iron Profile",
    slug: "iron-profile",
    category: "Blood Tests",
    description:
      "A doctor-advised blood profile used to review iron-related markers.",
    sampleType: "Blood",
    fasting: "As advised",
    reportTime: "Same day or next day",
    price: "Contact for price",
    homeCollection: true,
    whatIsIt:
      "Iron Profile helps doctors evaluate iron-related markers where anemia, fatigue or nutrition concerns are being reviewed.",
    commonlyRecommended: [
      "Fatigue evaluation",
      "Anemia-related follow-up",
      "Doctor-advised nutrition assessment",
    ],
    preparation: [
      "Fasting may be advised for some samples.",
      "Mention iron supplements if requested.",
    ],
    relatedTests: ["cbc", "vitamin-b12", "vitamin-d"],
  },
  {
    name: "Electrolytes",
    slug: "electrolytes",
    category: "Kidney",
    description:
      "A blood test commonly used to review electrolyte balance as advised by a doctor.",
    sampleType: "Blood",
    fasting: "As advised",
    reportTime: "Same day or next day",
    price: "Contact for price",
    homeCollection: true,
    whatIsIt:
      "Electrolyte testing helps doctors review key salts and fluid balance when clinically relevant.",
    commonlyRecommended: [
      "Kidney-related follow-up",
      "Weakness or dehydration evaluation",
      "Doctor-advised monitoring",
    ],
    preparation: ["Fasting may not be needed.", "Follow your doctor's instructions for medicines."],
    relatedTests: ["kidney-function-test", "liver-function-test", "urine-routine"],
  },
  {
    name: "Full Body Checkup",
    slug: "full-body-checkup",
    category: "Blood Tests",
    description:
      "A broad preventive health screening option for routine wellness review.",
    sampleType: "Blood and urine, depending on package",
    fasting: "As advised",
    reportTime: "Same day or next day",
    price: "Contact for price",
    homeCollection: true,
    whatIsIt:
      "A Full Body Checkup usually combines commonly requested screening tests so doctors can review broad health markers in one visit.",
    commonlyRecommended: [
      "Annual preventive checkups",
      "Family wellness screening",
      "Doctor-advised health review",
    ],
    preparation: [
      "Confirm fasting instructions while booking.",
      "Carry previous reports and prescription if available.",
    ],
    relatedTests: ["cbc", "hba1c", "lipid-profile"],
  },
  {
    name: "Fever Panel",
    slug: "fever-panel",
    category: "Fever/Infection",
    description:
      "A doctor-advised fever testing option that can be guided by symptoms and prescription.",
    sampleType: "Blood, as advised",
    fasting: "No",
    reportTime: "As advised",
    price: "Contact for price",
    homeCollection: true,
    whatIsIt:
      "A fever panel may include selected tests based on symptoms and doctor's prescription. Nova Diagnostics can help coordinate the right list from your prescription.",
    commonlyRecommended: [
      "Fever evaluation",
      "Prescription-based infection testing",
      "Home collection for unwell patients where suitable",
    ],
    preparation: [
      "No fasting is usually required unless a specific test needs it.",
      "Share the prescription for accurate test selection.",
    ],
    relatedTests: ["cbc", "dengue-ns1", "malaria-parasite-test"],
  },
];

export function getTestBySlug(slug: string) {
  return tests.find((test) => test.slug === slug);
}

export function getRelatedTests(slugs: string[]) {
  return slugs.map(getTestBySlug).filter(Boolean) as LabTest[];
}
