import "server-only";

import type { PrismaClient } from "@/generated/prisma/client";
import type { AdminFootageEditOptionsStore } from "@/modules/footage/load-admin-footage-edit";

/**
 * Minimal Category/Tag option lists for the Admin Footage edit form.
 */
export function createPrismaAdminFootageEditOptionsStore(
  client: PrismaClient,
): AdminFootageEditOptionsStore {
  return {
    async listCategories() {
      return client.category.findMany({
        select: { id: true, nameFa: true },
        orderBy: [{ nameFa: "asc" }, { id: "asc" }],
      });
    },

    async listTags() {
      return client.tag.findMany({
        select: { id: true, nameFa: true },
        orderBy: [{ nameFa: "asc" }, { id: "asc" }],
      });
    },
  };
}
