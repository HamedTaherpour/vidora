export type { FootagePublicationStatus } from "@/modules/footage/footage-publication-status";
import type { FootagePublicationStatus } from "@/modules/footage/footage-publication-status";

/**
 * One Admin catalog list row.
 * Tags are omitted; this surface does not display them.
 */
export type AdminFootageCatalogRow = {
  id: string;
  titleFa: string;
  slug: string;
  priceToman: number;
  status: FootagePublicationStatus;
  updatedAt: Date;
  category: {
    id: string;
    nameFa: string;
  };
};

export type AdminFootageCatalogFilter = {
  /** Trimmed search text. Empty means no text filter. */
  q: string;
};

export type AdminFootageCatalogPageQuery = AdminFootageCatalogFilter & {
  page: number;
  pageSize: number;
};

/**
 * Persistence boundary for the Admin catalog list query.
 * Implementations must avoid N+1 Category loads.
 */
export type AdminFootageCatalogStore = {
  countFootage: (filter: AdminFootageCatalogFilter) => Promise<number>;
  findFootagePage: (
    query: AdminFootageCatalogPageQuery,
  ) => Promise<AdminFootageCatalogRow[]>;
};
