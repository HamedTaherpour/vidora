import {
  AdminAuthorizationError,
  requireAdminPageAccess,
  type AdminAuthorizationContext,
} from "@/modules/auth/authorization/authorization";
import {
  parseAdminFootageCatalogQuery,
  type AdminFootageCatalogQueryInput,
} from "@/modules/footage/admin/catalog/admin-footage-catalog-input";
import type { AdminFootageCatalogStore } from "@/modules/footage/admin/catalog/admin-footage-catalog-store";
import {
  listAdminFootageCatalog,
  type AdminFootageCatalogResult,
} from "@/modules/footage/admin/catalog/list-admin-footage-catalog";

export type AdminFootageCatalogListResult =
  { status: "ok"; catalog: AdminFootageCatalogResult } | { status: "denied" };

export type HandleAdminFootageCatalogListParams = {
  admin: AdminAuthorizationContext;
  searchParams: AdminFootageCatalogQueryInput;
  store: AdminFootageCatalogStore;
};

/**
 * Admin-gated catalog list boundary.
 * Anonymous and Customer sessions resolve as denied.
 */
export async function handleAdminFootageCatalogList({
  admin,
  searchParams,
  store,
}: HandleAdminFootageCatalogListParams): Promise<AdminFootageCatalogListResult> {
  try {
    requireAdminPageAccess(admin);
  } catch (error) {
    if (error instanceof AdminAuthorizationError) {
      return { status: "denied" };
    }

    throw error;
  }

  const { q, page } = parseAdminFootageCatalogQuery(searchParams);
  const catalog = await listAdminFootageCatalog({ store, q, page });

  return { status: "ok", catalog };
}
