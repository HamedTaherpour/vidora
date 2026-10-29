import "server-only";

import type { PrismaClient } from "@/generated/prisma/client";
import type {
  PublicFootageCatalogItem,
  PublicFootageCatalogStore,
} from "@/modules/footage/public/catalog/public-footage-catalog-store";

/** Prisma read boundary for the public published-footage listing. */
export function createPrismaPublicFootageCatalogStore(
  client: PrismaClient,
): PublicFootageCatalogStore {
  return {
    async listPublishedFootage() {
      const rows = await client.footage.findMany({
        where: { status: "PUBLISHED", cover: { isNot: null } },
        orderBy: [{ publishedAt: "desc" }, { id: "desc" }],
        select: {
          id: true,
          slug: true,
          titleFa: true,
          priceToman: true,
          category: {
            select: {
              slug: true,
              nameFa: true,
            },
          },
          cover: { select: { id: true } },
          footageFiles: {
            where: {
              kind: "PREVIEW",
              uploadStatus: "READY",
            },
            take: 1,
            select: { id: true },
          },
        },
      });

      return rows.map((row): PublicFootageCatalogItem => ({
        id: row.id,
        slug: row.slug,
        titleFa: row.titleFa,
        priceToman: row.priceToman,
        category: row.category,
        cover: {
          status: "ready",
          src: `/api/footage/${row.id}/cover`,
          altFa: row.titleFa,
        },
        preview: {
          status: row.footageFiles.length > 0 ? "ready" : "unavailable",
        },
      }));
    },
  };
}
