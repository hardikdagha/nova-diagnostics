import type { MetadataRoute } from "next";

export const dynamic = "force-static";

import { blogPosts } from "@/data/blog";
import { packages } from "@/data/packages";
import { tests } from "@/data/tests";
import { siteConfig } from "@/config/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    "",
    "/tests",
    "/packages",
    "/home-sample-collection",
    "/upload-prescription",
    "/about",
    "/contact",
    "/blog",
    "/privacy-policy",
    "/terms",
    "/pathology-lab-in-vashi",
  ];

  return [
    ...staticRoutes.map((route) => ({
      url: `${siteConfig.url}${route}`,
      lastModified: new Date(),
    })),
    ...tests.map((test) => ({
      url: `${siteConfig.url}/tests/${test.slug}`,
      lastModified: new Date(),
    })),
    ...packages.map((healthPackage) => ({
      url: `${siteConfig.url}/packages/${healthPackage.slug}`,
      lastModified: new Date(),
    })),
    ...blogPosts.map((post) => ({
      url: `${siteConfig.url}/blog/${post.slug}`,
      lastModified: new Date(post.date),
    })),
  ];
}
