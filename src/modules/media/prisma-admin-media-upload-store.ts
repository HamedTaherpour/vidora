import "server-only";

import type { PrismaClient } from "@/generated/prisma/client";
import type {
  AdminMediaUploadRecord,
  AdminMediaUploadStore,
  CreateInitiatedUploadPersistence,
  RestartInitiatedUploadPersistence,
} from "@/modules/media/admin-media-upload-store";

type FootageFileRow = {
  id: string;
  footageId: string;
  kind: "PREVIEW" | "ORIGINAL";
  label: string;
  objectKey: string;
  sizeBytes: bigint;
  mimeType: string;
  uploadStatus: "INITIATED" | "READY" | "FAILED" | "ABORTED";
  providerUploadId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

function toRecord(row: FootageFileRow): AdminMediaUploadRecord {
  return {
    id: row.id,
    footageId: row.footageId,
    kind: row.kind,
    label: row.label,
    objectKey: row.objectKey,
    sizeBytes: row.sizeBytes,
    mimeType: row.mimeType,
    uploadStatus: row.uploadStatus,
    providerUploadId: row.providerUploadId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export function createPrismaAdminMediaUploadStore(
  prisma: PrismaClient,
): AdminMediaUploadStore {
  return {
    async footageExists(footageId) {
      const row = await prisma.footage.findUnique({
        where: { id: footageId },
        select: { id: true },
      });
      return row !== null;
    },

    async findPreviewForFootage(footageId) {
      const row = await prisma.footageFile.findFirst({
        where: { footageId, kind: "PREVIEW" },
      });
      return row === null ? null : toRecord(row);
    },

    async findById(id) {
      const row = await prisma.footageFile.findUnique({ where: { id } });
      return row === null ? null : toRecord(row);
    },

    async createInitiatedUpload(data: CreateInitiatedUploadPersistence) {
      const row = await prisma.footageFile.create({
        data: {
          footageId: data.footageId,
          kind: data.kind,
          label: data.label,
          objectKey: data.objectKey,
          sizeBytes: data.sizeBytes,
          mimeType: data.mimeType,
          uploadStatus: "INITIATED",
          providerUploadId: data.providerUploadId,
        },
      });
      return toRecord(row);
    },

    async restartInitiatedUpload(data: RestartInitiatedUploadPersistence) {
      const row = await prisma.footageFile.update({
        where: { id: data.id },
        data: {
          label: data.label,
          objectKey: data.objectKey,
          sizeBytes: data.sizeBytes,
          mimeType: data.mimeType,
          uploadStatus: "INITIATED",
          providerUploadId: data.providerUploadId,
        },
      });
      return toRecord(row);
    },

    async markReady({ id, sizeBytes }) {
      const updated = await prisma.footageFile.updateMany({
        where: {
          id,
          uploadStatus: { in: ["INITIATED", "FAILED"] },
        },
        data: {
          uploadStatus: "READY",
          providerUploadId: null,
          sizeBytes,
        },
      });

      if (updated.count === 0) {
        return null;
      }

      const row = await prisma.footageFile.findUnique({ where: { id } });
      return row === null ? null : toRecord(row);
    },

    async markFailed(id) {
      const row = await prisma.footageFile.update({
        where: { id },
        data: {
          uploadStatus: "FAILED",
        },
      });
      return toRecord(row);
    },

    async markAborted(id) {
      const updated = await prisma.footageFile.updateMany({
        where: {
          id,
          uploadStatus: { not: "READY" },
        },
        data: {
          uploadStatus: "ABORTED",
          providerUploadId: null,
        },
      });

      if (updated.count === 0) {
        return null;
      }

      const row = await prisma.footageFile.findUnique({ where: { id } });
      return row === null ? null : toRecord(row);
    },
  };
}
