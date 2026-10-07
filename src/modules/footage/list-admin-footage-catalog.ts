import { ADMIN_FOOTAGE_CATALOG_PAGE_SIZE } from "@/modules/footage/admin-footage-catalog-input";
import type {
  AdminFootageCatalogRow,
  AdminFootageCatalogStore,
} from "@/modules/footage/admin-footage-catalog-store";

export type ListAdminFootageCatalogParams = {
  store: AdminFootageCatalogStore;
  q: string;
  page: number;
  pageSize?: number;
};

export type AdminFootageCatalogEmptyReason =
  "no_footage" | "no_search_results" | "page_out_of_range" | null;

export type AdminFootageCatalogResult = {
  items: AdminFootageCatalogRow[];
  q: string;
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  emptyReason: AdminFootageCatalogEmptyReason;
};

/**
 * Admin catalog list query.
 * Includes DRAFT and PUBLISHED. Ordering is updatedAt DESC, then id DESC.
 */
export async function listAdminFootageCatalog({
  store,
  q,
  page,
  pageSize = ADMIN_FOOTAGE_CATALOG_PAGE_SIZE,
}: ListAdminFootageCatalogParams): Promise<AdminFootageCatalogResult> {
  const filter = { q };
  const totalCount = await store.countFootage(filter);
  const totalPages = totalCount === 0 ? 0 : Math.ceil(totalCount / pageSize);

  if (totalCount === 0) {
    return {
      items: [],
      q,
      page,
      pageSize,
      totalCount: 0,
      totalPages: 0,
      emptyReason: q.length > 0 ? "no_search_results" : "no_footage",
    };
  }

  if (page > totalPages) {
    return {
      items: [],
      q,
      page,
      pageSize,
      totalCount,
      totalPages,
      emptyReason: "page_out_of_range",
    };
  }

  const items = await store.findFootagePage({
    q,
    page,
    pageSize,
  });

  return {
    items,
    q,
    page,
    pageSize,
    totalCount,
    totalPages,
    emptyReason: null,
  };
}
