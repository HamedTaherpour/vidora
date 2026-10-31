import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { BlogView } from "@/modules/blog/public/blog-view";
import {
  loadBlogPreviewRouteData,
  parseBlogPreviewParams,
} from "@/modules/blog/public/blog-preview-utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "یادداشت ویدورا",
  description: "پیش‌نمایش fixture-only از مقاله وبلاگ ویدورا.",
  robots: { index: false, follow: false },
};

type BlogArticlePageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    category?: string;
    scenario?: string;
  }>;
};

export default async function BlogArticlePage({
  params,
  searchParams,
}: BlogArticlePageProps) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  if (decodeURIComponent(slug) === "preview") notFound();
  const parsed = parseBlogPreviewParams({ ...query, slug });
  const data = loadBlogPreviewRouteData({
    view: "article",
    scenario: parsed.scenario,
    category: parsed.category,
    slug: decodeURIComponent(slug),
  });

  return <BlogView data={data} />;
}
