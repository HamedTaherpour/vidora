import {
  blogPreviewArticles,
  getBlogPreviewCategoryLabel,
} from "./blog-preview-fixtures";
import {
  BLOG_PREVIEW_CATEGORIES,
  BLOG_PREVIEW_VIEWS,
  type BlogPreviewCategory,
  type BlogPreviewRouteData,
  type BlogPreviewScenario,
  type BlogPreviewView,
} from "./blog-preview.types";

export function isBlogPreviewView(
  value: string | undefined,
): value is BlogPreviewView {
  return BLOG_PREVIEW_VIEWS.includes(value as BlogPreviewView);
}

export function isBlogPreviewScenario(
  value: string | undefined,
): value is BlogPreviewScenario {
  return ["populated", "empty", "loading", "error"].includes(
    value as BlogPreviewScenario,
  );
}

export function isBlogPreviewCategory(
  value: string | undefined,
): value is BlogPreviewCategory["slug"] {
  return BLOG_PREVIEW_CATEGORIES.some((category) => category.slug === value);
}

export function createBlogPreviewHref({
  view,
  scenario = "populated",
  category = "all",
  slug,
}: {
  view: BlogPreviewView;
  scenario?: BlogPreviewScenario;
  category?: BlogPreviewCategory["slug"];
  slug?: string;
}) {
  const params = new URLSearchParams({ scenario });
  if (category !== "all") params.set("category", category);
  return view === "article" && slug
    ? `/blog/${encodeURIComponent(slug)}?${params.toString()}`
    : `/blog?${params.toString()}`;
}

export function loadBlogPreviewRouteData({
  view,
  scenario,
  category,
  slug,
}: {
  view: BlogPreviewView;
  scenario: BlogPreviewScenario;
  category: BlogPreviewCategory["slug"];
  slug?: string;
}): BlogPreviewRouteData {
  const articles =
    category === "all"
      ? blogPreviewArticles
      : blogPreviewArticles.filter((article) => article.category === category);
  const article = slug
    ? (blogPreviewArticles.find((item) => item.slug === slug) ?? null)
    : null;

  return {
    view,
    category,
    scenario,
    articles: scenario === "empty" ? [] : articles,
    article,
  };
}

export function parseBlogPreviewParams(params: {
  view?: string;
  scenario?: string;
  category?: string;
  slug?: string;
}) {
  return {
    view: isBlogPreviewView(params.view) ? params.view : "listing",
    scenario: isBlogPreviewScenario(params.scenario)
      ? params.scenario
      : "populated",
    category: isBlogPreviewCategory(params.category) ? params.category : "all",
    slug: params.slug,
  } satisfies Parameters<typeof loadBlogPreviewRouteData>[0];
}

export function getBlogPreviewCategoryLabelForRoute(category: string) {
  return getBlogPreviewCategoryLabel(category);
}
