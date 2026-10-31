import type { PublicFootageCategoryOption } from "@/modules/footage/public/catalog/public-footage-catalog-store";
import type { PublicFootageCatalogItem } from "@/modules/footage/public/catalog/public-footage-catalog-store";
import type { SearchQuery, FootagePriceBounds } from "../search";

/** Props for the fixture-backed, URL-owned Search view. */
export type SearchViewProps = {
  query: SearchQuery;
  categories: PublicFootageCategoryOption[];
  priceBounds: FootagePriceBounds;
  footage: PublicFootageCatalogItem[];
  filteredCount: number;
  totalPages: number;
};
