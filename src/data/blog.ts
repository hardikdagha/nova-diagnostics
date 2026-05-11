export type BlogPost = {
  title: string;
  slug: string;
  excerpt: string;
  date: string;
  readingTime: string;
  sections: Array<{
    heading: string;
    body: string;
  }>;
};

export const blogPosts: BlogPost[] = [
  {
    title: "How to Prepare for a Blood Test",
    slug: "how-to-prepare-for-a-blood-test",
    excerpt:
      "Simple steps patients can follow before a routine blood test or home sample collection.",
    date: "2026-01-10",
    readingTime: "4 min read",
    sections: [
      {
        heading: "Confirm the test and fasting need",
        body: "Not every blood test needs fasting. Before your appointment, confirm whether your test requires fasting and how long the fasting window should be.",
      },
      {
        heading: "Carry your prescription and previous reports",
        body: "A prescription helps the lab team coordinate the correct test list. Previous reports can also help your doctor compare trends over time.",
      },
      {
        heading: "Stay hydrated unless told otherwise",
        body: "For many tests, drinking water is acceptable and can make sample collection easier. Follow your doctor's specific instructions if they differ.",
      },
    ],
  },
  {
    title: "Fasting vs Non-Fasting Blood Tests: What Patients Should Know",
    slug: "fasting-vs-non-fasting-blood-tests",
    excerpt:
      "A patient-friendly guide to why some blood tests need fasting and others usually do not.",
    date: "2026-01-18",
    readingTime: "5 min read",
    sections: [
      {
        heading: "Why fasting may be requested",
        body: "Food can temporarily affect certain blood markers. Your doctor or lab team may advise fasting for tests where a fasting sample is useful.",
      },
      {
        heading: "Tests that often do not need fasting",
        body: "Many routine tests can be collected without fasting. The exact instruction depends on the test list and your doctor's advice.",
      },
      {
        heading: "When in doubt, ask before the appointment",
        body: "If your prescription has multiple tests, confirm preparation instructions before your visit or home collection slot.",
      },
    ],
  },
  {
    title: "When Should You Book a Full Body Checkup?",
    slug: "when-should-you-book-a-full-body-checkup",
    excerpt:
      "Understand when preventive health packages may be useful and how to discuss them with your doctor.",
    date: "2026-02-02",
    readingTime: "4 min read",
    sections: [
      {
        heading: "Preventive health review",
        body: "A full body checkup can help review broad wellness markers, especially when used as part of regular preventive care and doctor follow-up.",
      },
      {
        heading: "Family history and lifestyle factors",
        body: "People with family history of diabetes, heart health concerns, thyroid issues or sedentary lifestyle may discuss screening frequency with a doctor.",
      },
      {
        heading: "Packages should not replace medical advice",
        body: "Health packages are useful screening tools, but results should be interpreted by qualified medical professionals.",
      },
    ],
  },
  {
    title: "Common Blood Tests Explained Simply",
    slug: "common-blood-tests-explained-simply",
    excerpt:
      "A clear overview of commonly prescribed tests such as CBC, thyroid, sugar and lipid profile.",
    date: "2026-02-16",
    readingTime: "6 min read",
    sections: [
      {
        heading: "CBC",
        body: "CBC is a routine blood test that helps doctors review blood cell counts as part of general health or illness evaluation.",
      },
      {
        heading: "Thyroid and sugar tests",
        body: "Thyroid and sugar tests are commonly used for screening and follow-up. Preparation depends on the exact test and doctor's advice.",
      },
      {
        heading: "Liver, kidney and lipid tests",
        body: "These profiles help doctors review different organ and heart-health related markers. They are often included in preventive packages.",
      },
    ],
  },
  {
    title: "Blood Test at Home in Vashi: What to Expect",
    slug: "blood-test-at-home-in-vashi-what-to-expect",
    excerpt:
      "What patients in Vashi and nearby Navi Mumbai areas can expect during home sample collection.",
    date: "2026-03-01",
    readingTime: "4 min read",
    sections: [
      {
        heading: "Book your preferred slot",
        body: "Share your test list or upload a prescription, then select a suitable home collection slot based on availability.",
      },
      {
        heading: "Prepare before collection",
        body: "Keep your prescription, phone and any fasting instructions ready. Drink water unless your doctor has advised otherwise.",
      },
      {
        heading: "Reports are shared digitally",
        body: "After testing is completed, reports can be shared digitally through the lab's defined communication process.",
      },
    ],
  },
];

export function getBlogPostBySlug(slug: string) {
  return blogPosts.find((post) => post.slug === slug);
}
