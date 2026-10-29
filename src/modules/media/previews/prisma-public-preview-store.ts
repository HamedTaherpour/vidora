import "server-only";

import type { PrismaClient } from "@/generated/prisma/client";
import type {
  PublicPreviewStore,
  PublishedPreviewRecord,
} from "@/modules/media/previews/public-preview";

/** Prisma read boundary for the public, watermarked preview. */
export function createPrismaPublicPreviewStore(
  client: PrismaClient,
): PublicPreviewStore {
  return {
    async findPublishedReadyPreview(footageId) {
      const row = await client.footage.findFirst({
        where: {
          id: footageId,
          status: "PUBLISHED",
          footageFiles: {
            some: {
              kind: "PREVIEW",
              uploadStatus: "READY",
            },
          },
        },
        select: {
          footageFiles: {
            where: {
              kind: "PREVIEW",
              uploadStatus: "READY",
            },
            take: 1,
            select: {
              objectKey: true,
              mimeType: true,
            },
          },
        },
      });

      const preview = row?.footageFiles[0];
      return preview === undefined
        ? null
        : ({
            footageId,
            objectKey: preview.objectKey,
            mimeType: preview.mimeType,
          } satisfies PublishedPreviewRecord);
    },
  };
}
