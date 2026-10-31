import type { PublicFootageCatalogItem } from "@/modules/footage/public/catalog/public-footage-catalog-store";

/** Normalized query state used by the public catalog filter. */
export type PublicBrowseQuery = {
  query: string;
  category: string;
};

/** Number of footage items rendered on one public catalog page. */
export const PUBLIC_PAGE_SIZE = 12;

/** Parses a positive public page number, defaulting invalid input to page one. */
export function parsePublicPage(value: string | undefined): number {
  const page = Number.parseInt(value ?? "1", 10);
  return Number.isFinite(page) && page > 0 ? page : 1;
}

/** Clamps a requested page and returns the corresponding catalog slice. */
export function paginatePublicFootage(
  footage: PublicFootageCatalogItem[],
  requestedPage: number,
) {
  const totalPages = Math.max(1, Math.ceil(footage.length / PUBLIC_PAGE_SIZE));
  const page = Math.min(Math.max(requestedPage, 1), totalPages);
  return {
    page,
    totalPages,
    items: footage.slice(
      (page - 1) * PUBLIC_PAGE_SIZE,
      page * PUBLIC_PAGE_SIZE,
    ),
  };
}

/** Returns the selected category only when it exists in the available options. */
export function normalizePublicCategory(
  category: string,
  categories: ReadonlyArray<{ value: string }>,
): string {
  return categories.some((option) => option.value === category) ? category : "";
}

/** Filters public footage by Persian title/category/slug text and category. */
export function filterPublicFootage(
  footage: PublicFootageCatalogItem[],
  filters: PublicBrowseQuery,
): PublicFootageCatalogItem[] {
  const query = filters.query.trim().toLocaleLowerCase("fa-IR");

  return footage.filter((item) => {
    const matchesQuery =
      query.length === 0 ||
      [item.titleFa, item.category.nameFa, item.slug].some((value) =>
        value.toLocaleLowerCase("fa-IR").includes(query),
      );
    const matchesCategory =
      filters.category.length === 0 || item.category.slug === filters.category;

    return matchesQuery && matchesCategory;
  });
}

/** Normalizes route query parameters into public catalog filter state. */
export function parsePublicBrowseQuery(params: {
  q?: string;
  category?: string;
}): PublicBrowseQuery {
  return {
    query: typeof params.q === "string" ? params.q.trim() : "",
    category: typeof params.category === "string" ? params.category : "",
  };
}
