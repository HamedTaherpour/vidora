export function createHomeSearchHref(query: string): string {
  const params = new URLSearchParams();
  const normalized = query.trim();
  if (normalized) params.set("q", normalized);
  return params.toString() ? `/search?${params.toString()}` : "/search";
}

export function createHomePageHref(page: number): string {
  return page > 1 ? `/?page=${page}` : "/";
}

export function createHomeCategoryHref(slug: string): string {
  return `/search?category=${encodeURIComponent(slug)}`;
}
import type { HomeCategory } from "./home-page.types";

export type HomeCategoryMenuItem = HomeCategory & { href: string };

export function createHomeCategoryMenuItems(
  categories: HomeCategory[],
): HomeCategoryMenuItem[] {
  return categories.map((category) => ({
    ...category,
    href: createHomeCategoryHref(category.slug),
  }));
}
