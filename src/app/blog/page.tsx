import type { Metadata } from "next";
import { BlogCard } from "@/components/BlogCard";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { blogPosts } from "@/data/blog";

export const metadata: Metadata = {
  title: "Health Guides",
  description:
    "Read patient-friendly health guides from Nova Diagnostics about blood test preparation, fasting tests, full body checkups and home blood tests in Vashi.",
  alternates: {
    canonical: "/blog",
  },
};

export default function BlogPage() {
  return (
    <>
      <section className="bg-[linear-gradient(135deg,#FAFCFD_0%,#E6F7FA_100%)] py-12 md:py-16">
        <div className="container-page">
          <Breadcrumbs items={[{ label: "Health Guides" }]} />
          <SectionHeading
            eyebrow="Blog / Health Guides"
            level="h1"
            title="Simple, safe guides for patients"
            description="Educational articles for general awareness. They do not replace medical advice from a qualified doctor."
          />
        </div>
      </section>

      <section className="section-pad">
        <div className="container-page grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {blogPosts.map((post) => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </div>
      </section>

    </>
  );
}
