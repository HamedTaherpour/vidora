import type { Metadata } from "next";

import { BlogView } from "@/modules/blog/public/blog-view";
import {
  loadBlogPreviewRouteData,
  parseBlogPreviewParams,
} from "@/modules/blog/public/blog-preview-utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "یادداشت‌های ویدورا",
  description: "پیش‌نمایش fixture-only از تجربه وبلاگ ویدورا.",
  robots: { index: false, follow: false },
};

type BlogPageProps = {
  searchParams: Promise<{
    category?: string;
    scenario?: string;
  }>;
};

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const params = parseBlogPreviewParams(await searchParams);
  const data = loadBlogPreviewRouteData({
    view: "listing",
    scenario: params.scenario,
    category: params.category,
  });

  return <BlogView data={data} />;
}
