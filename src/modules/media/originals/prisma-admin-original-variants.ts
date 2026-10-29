import "server-only";

import type { PrismaClient } from "@/generated/prisma/client";
import type {
  AdminOriginalVariant,
  AdminOriginalVariantStore,
} from "@/modules/media/originals/admin-original-variants";

function toVariant(row: {
  id: string;
  footageId: string;
  label: string;
  sizeBytes: bigint;
  mimeType: string;
  uploadStatus: "INITIATED" | "READY" | "FAILED" | "ABORTED";
  width: number | null;
  height: number | null;
  fps: { toString(): string } | null;
  codec: string | null;
  createdAt: Date;
}): AdminOriginalVariant {
  const sizeBytes = Number(row.sizeBytes);
  if (!Number.isSafeInteger(sizeBytes)) {
    throw new Error("FootageFile sizeBytes exceeds the safe UI integer range.");
  }

  return { ...row, sizeBytes, fps: row.fps?.toString() ?? null };
}

export function createPrismaAdminOriginalVariantStore(
  client: PrismaClient,
): AdminOriginalVariantStore {
  const select = {
    id: true,
    footageId: true,
    label: true,
    sizeBytes: true,
    mimeType: true,
    uploadStatus: true,
    width: true,
    height: true,
    fps: true,
    codec: true,
    createdAt: true,
  } as const;

  return {
    async listForFootage(footageId) {
      const rows = await client.footageFile.findMany({
        where: { footageId, kind: "ORIGINAL" },
        orderBy: [{ createdAt: "asc" }, { id: "asc" }],
        select,
      });
      return rows.map(toVariant);
    },

    async updateLabel({ footageId, variantId, label }) {
      const updated = await client.footageFile.updateMany({
        where: { id: variantId, footageId, kind: "ORIGINAL" },
        data: { label },
      });

      if (updated.count === 0) return null;

      const row = await client.footageFile.findUnique({
        where: { id: variantId },
        select,
      });
      return row === null ? null : toVariant(row);
    },
  };
}
