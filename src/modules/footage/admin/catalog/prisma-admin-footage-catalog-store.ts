import "server-only";

import type { PrismaClient } from "@/generated/prisma/client";
import type {
  AdminFootageCatalogFilter,
  AdminFootageCatalogPageQuery,
  AdminFootageCatalogStore,
} from "@/modules/footage/admin/catalog/admin-footage-catalog-store";

function footageSearchWhere(filter: AdminFootageCatalogFilter) {
  if (filter.q.length === 0) {
    return {};
  }

  return {
    OR: [
      { titleFa: { contains: filter.q, mode: "insensitive" as const } },
      { slug: { contains: filter.q, mode: "insensitive" as const } },
    ],
  };
}

/**
 * Prisma-backed Admin catalog list store.
 * Category is loaded with the Footage row (no N+1).
 * Tags are not selected.
 */
export function createPrismaAdminFootageCatalogStore(
  client: PrismaClient,
): AdminFootageCatalogStore {
  return {
    async countFootage(filter) {
      return client.footage.count({
        where: footageSearchWhere(filter),
      });
    },

    async findFootagePage(query: AdminFootageCatalogPageQuery) {
      const rows = await client.footage.findMany({
        where: footageSearchWhere(query),
        orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
        select: {
          id: true,
          titleFa: true,
          slug: true,
          priceToman: true,
          status: true,
          updatedAt: true,
          category: {
            select: {
              id: true,
              nameFa: true,
            },
          },
        },
      });

      return rows;
    },
  };
}
