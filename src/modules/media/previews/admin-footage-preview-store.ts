import "server-only";

import type { PrismaClient } from "@/generated/prisma/client";

export type AdminFootagePreviewUploadStatus =
  "INITIATED" | "READY" | "FAILED" | "ABORTED";

export type AdminFootagePreviewSummary = {
  exists: boolean;
  uploadStatus: AdminFootagePreviewUploadStatus | null;
  isReady: boolean;
  mimeType: string | null;
};

export type AdminFootagePreviewStore = {
  findPreviewSummary(footageId: string): Promise<AdminFootagePreviewSummary>;
};

export function createPrismaAdminFootagePreviewStore(
  client: PrismaClient,
): AdminFootagePreviewStore {
  return {
    async findPreviewSummary(footageId) {
      const preview = await client.footageFile.findFirst({
        where: { footageId, kind: "PREVIEW" },
        select: { uploadStatus: true, mimeType: true },
      });

      return {
        exists: preview !== null,
        uploadStatus: preview?.uploadStatus ?? null,
        isReady: preview?.uploadStatus === "READY",
        mimeType: preview?.mimeType ?? null,
      };
    },
  };
}
