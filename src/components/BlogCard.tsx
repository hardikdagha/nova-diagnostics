import Link from "next/link";
import { ArrowRight, CalendarDays } from "lucide-react";
import type { BlogPost } from "@/data/blog";

export function BlogCard({ post }: { post: BlogPost }) {
  return (
    <article className="card-premium flex h-full flex-col p-5">
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <CalendarDays className="size-4 text-teal-700" aria-hidden="true" />
        <time dateTime={post.date}>{post.date}</time>
        <span aria-hidden="true">/</span>
        <span>{post.readingTime}</span>
      </div>
      <h3 className="mt-4 text-xl font-semibold leading-snug text-slate-950">
        {post.title}
      </h3>
      <p className="mt-3 flex-1 text-sm leading-6 text-slate-600">
        {post.excerpt}
      </p>
      <Link href={`/blog/${post.slug}`} className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-teal-800 hover:text-teal-950">
        Read guide
        <ArrowRight className="size-4" aria-hidden="true" />
      </Link>
    </article>
  );
}
