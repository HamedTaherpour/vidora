import {
  AdminAuthorizationError,
  requireAuthenticatedAdmin,
} from "@/modules/auth/authorization";
import type { ResolvedAdmin } from "@/modules/auth/resolve-admin-session";
import { parseAdminFootageCatalogQuery } from "@/modules/footage/admin-footage-catalog-input";
import type { AdminFootageCatalogStore } from "@/modules/footage/admin-footage-catalog-store";
import {
  listAdminFootageCatalog,
  type AdminFootageCatalogResult,
} from "@/modules/footage/list-admin-footage-catalog";

export type AdminFootageCatalogListResult =
  { status: "ok"; catalog: AdminFootageCatalogResult } | { status: "denied" };

/**
 * Admin-gated catalog list boundary.
 * Anonymous and Customer sessions resolve as denied.
 */
export async function handleAdminFootageCatalogList({
  admin,
  searchParams,
  store,
}: {
  admin: ResolvedAdmin;
  searchParams: {
    q?: string | string[] | undefined;
    page?: string | string[] | undefined;
  };
  store: AdminFootageCatalogStore;
}): Promise<AdminFootageCatalogListResult> {
  try {
    requireAuthenticatedAdmin(admin);
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
