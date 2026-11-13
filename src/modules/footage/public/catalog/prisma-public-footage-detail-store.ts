import "server-only";

import type { PrismaClient } from "@/generated/prisma/client";
import type { PublicFootageDetailStore } from "./public-footage-detail-store";

export function createPrismaPublicFootageDetailStore(
  client: PrismaClient,
): PublicFootageDetailStore {
  return {
    async findPublishedFootageBySlug(slug) {
      const row = await client.footage.findFirst({
        where: { slug, status: "PUBLISHED", cover: { isNot: null } },
        select: {
          id: true,
          slug: true,
          titleFa: true,
          descriptionFa: true,
          priceToman: true,
          publishedAt: true,
          category: { select: { slug: true, nameFa: true } },
          footageTags: { select: { tag: { select: { nameFa: true } } } },
          footageFiles: {
            where: { uploadStatus: "READY" },
            orderBy: [{ kind: "asc" }, { label: "asc" }],
            select: {
              kind: true,
              label: true,
              mimeType: true,
              sizeBytes: true,
              width: true,
              height: true,
              fps: true,
              codec: true,
            },
          },
        },
      });

      if (!row) return null;
      const preview = row.footageFiles.find((file) => file.kind === "PREVIEW");
      const qualities = row.footageFiles
        .filter((file) => file.kind === "ORIGINAL")
        .map((file) => ({
          label: file.label,
          width: file.width ?? undefined,
          height: file.height ?? undefined,
          sizeBytes: Number(file.sizeBytes),
          mimeType: file.mimeType,
          codec: file.codec ?? undefined,
        }));

      return {
        id: row.id,
        slug: row.slug,
        titleFa: row.titleFa,
        descriptionFa: row.descriptionFa,
        priceToman: row.priceToman,
        category: row.category,
        tags: row.footageTags.map(({ tag }) => tag.nameFa),
        publishedAt: row.publishedAt?.toISOString(),
        cover: {
          status: "ready",
          src: `/api/footage/${row.id}/cover`,
          altFa: row.titleFa,
        },
        preview: {
          status: preview ? "ready" : "unavailable",
          ...(preview ? { videoUrl: `/api/footage/${row.id}/preview` } : {}),
        },
        technical: preview
          ? {
              width: preview.width ?? undefined,
              height: preview.height ?? undefined,
              fps: preview.fps ? Number(preview.fps) : undefined,
              codec: preview.codec ?? undefined,
              mimeType: preview.mimeType,
            }
          : {},
        qualities,
        dataSource: "catalog",
      };
    },
  };
}
