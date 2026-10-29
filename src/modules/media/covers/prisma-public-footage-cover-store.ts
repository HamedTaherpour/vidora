import "server-only";

import type { PrismaClient } from "@/generated/prisma/client";
import type { PublicFootageCoverStore } from "@/modules/media/covers/public-footage-cover";

export function createPrismaPublicFootageCoverStore(
  prisma: PrismaClient,
): PublicFootageCoverStore {
  return {
    async findPublishedByFootageId(footageId) {
      const row = await prisma.footage.findFirst({
        where: { id: footageId, status: "PUBLISHED", cover: { isNot: null } },
        select: { cover: true },
      });

      return row?.cover ?? null;
    },
  };
}
