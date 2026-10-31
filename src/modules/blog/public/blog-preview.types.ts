export const BLOG_PREVIEW_VIEWS = ["listing", "article"] as const;

export type BlogPreviewView = (typeof BLOG_PREVIEW_VIEWS)[number];

export const BLOG_PREVIEW_CATEGORIES = [
  { slug: "all", labelFa: "همه یادداشت‌ها" },
  { slug: "guide", labelFa: "راهنمای فوتیج" },
  { slug: "creative", labelFa: "ایده‌پردازی" },
  { slug: "technical", labelFa: "فنی" },
] as const;

export type BlogPreviewCategory = (typeof BLOG_PREVIEW_CATEGORIES)[number];

export type BlogPreviewArticle = {
  slug: string;
  titleFa: string;
  excerptFa: string;
  category: BlogPreviewCategory["slug"];
  categoryLabelFa: string;
  readingTimeFa: string;
  publishedAt: string;
  coverSrc: string;
  coverAltFa: string;
  body: readonly {
    headingFa: string;
    paragraphsFa: readonly string[];
  }[];
  relatedFootage: readonly {
    href: string;
    titleFa: string;
    categoryFa: string;
  }[];
};

export type BlogPreviewScenario = "populated" | "empty" | "loading" | "error";

export type BlogPreviewRouteData = {
  view: BlogPreviewView;
  category: BlogPreviewCategory["slug"];
  scenario: BlogPreviewScenario;
  articles: readonly BlogPreviewArticle[];
  article: BlogPreviewArticle | null;
};
