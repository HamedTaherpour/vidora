import type { PublicFootageCatalogItem } from "@/modules/footage/public/catalog/public-footage-catalog-store";

export type PublicBrowseQuery = {
  query: string;
  category: string;
};

export function normalizePublicCategory(
  category: string,
  categories: ReadonlyArray<{ value: string }>,
): string {
  return categories.some((option) => option.value === category) ? category : "";
}

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

export function parsePublicBrowseQuery(params: {
  q?: string;
  category?: string;
}): PublicBrowseQuery {
  return {
    query: typeof params.q === "string" ? params.q.trim() : "",
    category: typeof params.category === "string" ? params.category : "",
  };
}
