import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CalendarDays } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { CTASection } from "@/components/ui/CTASection";
import { DisclaimerBox } from "@/components/ui/DisclaimerBox";
import { getBlogPostBySlug, blogPosts } from "@/data/blog";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    return {
      title: "Health Guide Not Found",
    };
  }

  return {
    title: post.title,
    description: post.excerpt,
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <>
      <section className="bg-[linear-gradient(135deg,#FAFCFD_0%,#E6F7FA_100%)] py-12 md:py-16">
        <div className="container-page">
          <Breadcrumbs items={[{ label: "Blog", href: "/blog" }, { label: post.title }]} />
          <div className="max-w-4xl">
            <p className="text-sm font-semibold uppercase text-teal-700">
              Health guide
            </p>
            <h1 className="mt-3 text-balance text-4xl font-semibold leading-tight text-slate-950 md:text-5xl">
              {post.title}
            </h1>
            <div className="mt-5 flex items-center gap-2 text-sm font-medium text-slate-500">
              <CalendarDays className="size-4 text-teal-700" aria-hidden="true" />
              <time dateTime={post.date}>{post.date}</time>
              <span aria-hidden="true">/</span>
              <span>{post.readingTime}</span>
            </div>
            <p className="mt-5 text-lg leading-8 text-slate-600">{post.excerpt}</p>
          </div>
        </div>
      </section>

      <article className="section-pad">
        <div className="container-page max-w-3xl">
          <div className="space-y-9">
            {post.sections.map((section) => (
              <section key={section.heading}>
                <h2 className="text-2xl font-semibold text-slate-950">
                  {section.heading}
                </h2>
                <p className="mt-4 leading-7 text-slate-600">{section.body}</p>
              </section>
            ))}
            <DisclaimerBox />
          </div>
        </div>
      </article>

      <CTASection
        title="Need help with a test or checkup?"
        description="Use Nova Diagnostics for booking, prescription assistance and home collection requests in Vashi."
      />
    </>
  );
}
