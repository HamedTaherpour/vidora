import "server-only";

import type { PrismaClient } from "@/generated/prisma/client";
import type {
  AdminFootageCoverStore,
  SaveFootageCoverPersistence,
} from "@/modules/media/covers/admin-footage-cover-store";

export function createPrismaAdminFootageCoverStore(
  prisma: PrismaClient,
): AdminFootageCoverStore {
  return {
    async findByFootageId(footageId) {
      return prisma.footageCover.findUnique({ where: { footageId } });
    },

    async save(data: SaveFootageCoverPersistence) {
      return prisma.footageCover.upsert({
        where: { footageId: data.footageId },
        create: data,
        update: {
          objectKey: data.objectKey,
          mimeType: data.mimeType,
          sizeBytes: data.sizeBytes,
          width: data.width,
          height: data.height,
        },
      });
    },
  };
}
