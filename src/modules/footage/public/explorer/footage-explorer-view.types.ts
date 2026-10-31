import type { PublicFootageCategoryOption } from "@/modules/footage/public/catalog/public-footage-catalog-store";
import type { PublicFootageCatalogItem } from "@/modules/footage/public/catalog/public-footage-catalog-store";
import type {
  FootageExplorerQuery,
  FootagePriceBounds,
} from "./footage-explorer";

/** Props for the fixture-backed, URL-owned Footage Explorer view. */
export type FootageExplorerViewProps = {
  variant: "classic" | "modern" | "minimal";
  query: FootageExplorerQuery;
  categories: PublicFootageCategoryOption[];
  priceBounds: FootagePriceBounds;
  footage: PublicFootageCatalogItem[];
  filteredCount: number;
  totalPages: number;
};
