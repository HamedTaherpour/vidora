import "server-only";

import { Prisma, type PrismaClient } from "@/generated/prisma/client";
import {
  CategoryNotFoundError,
  FootageNotFoundError,
  FootagePreviewNotReadyError,
  FootageSlugConflictError,
  TagNotFoundError,
} from "@/modules/footage/admin/mutations/admin-footage-errors";
import type {
  AdminFootageRecord,
  AdminFootageStore,
  CreateDraftFootagePersistence,
  PublishFootagePersistence,
  UpdateFootageMetadataPersistence,
} from "@/modules/footage/admin/mutations/admin-footage-store";

type FootageRow = {
  id: string;
  titleFa: string;
  slug: string;
  descriptionFa: string;
  priceToman: number;
  status: "DRAFT" | "PUBLISHED";
  categoryId: string;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  footageTags: { tagId: string }[];
};

function toRecord(row: FootageRow): AdminFootageRecord {
  return {
    id: row.id,
    titleFa: row.titleFa,
    slug: row.slug,
    descriptionFa: row.descriptionFa,
    priceToman: row.priceToman,
    status: row.status,
    categoryId: row.categoryId,
    tagIds: row.footageTags.map((tag) => tag.tagId),
    publishedAt: row.publishedAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

const footageInclude = {
  footageTags: {
    select: { tagId: true },
  },
} as const;

function isUniqueSlugViolation(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}

function mapForeignKeyViolation(error: unknown): never {
  if (
    !(error instanceof Prisma.PrismaClientKnownRequestError) ||
    error.code !== "P2003"
  ) {
    throw error;
  }

  const field = String(
    error.meta?.field_name ?? error.meta?.constraint ?? "",
  ).toLowerCase();

  if (field.includes("tag")) {
    throw new TagNotFoundError();
  }

  throw new CategoryNotFoundError();
}

/**
 * Prisma-backed Admin Footage mutation store.
 * Footage + Tag writes that belong together run in one transaction.
 * Unique slug and FK failures become safe application errors.
 */
export function createPrismaAdminFootageStore(
  client: PrismaClient,
): AdminFootageStore {
  return {
    async categoryExists(categoryId) {
      const category = await client.category.findUnique({
        where: { id: categoryId },
        select: { id: true },
      });

      return category !== null;
    },

    async hasReadyPreview(footageId) {
      const preview = await client.footageFile.findFirst({
        where: {
          footageId,
          kind: "PREVIEW",
          uploadStatus: "READY",
        },
        select: { id: true },
      });

      return preview !== null;
    },

    async hasReadyCover(footageId) {
      const cover = await client.footageCover.findUnique({
        where: { footageId },
        select: { id: true },
      });

      return cover !== null;
    },

    async findExistingTagIds(tagIds) {
      if (tagIds.length === 0) {
        return [];
      }

      const rows = await client.tag.findMany({
        where: { id: { in: [...tagIds] } },
        select: { id: true },
      });

      return rows.map((row) => row.id);
    },

    async createDraft(data: CreateDraftFootagePersistence) {
      try {
        const row = await client.$transaction(async (tx) => {
          const created = await tx.footage.create({
            data: {
              titleFa: data.titleFa,
              slug: data.slug,
              descriptionFa: data.descriptionFa,
              priceToman: data.priceToman,
              status: "DRAFT",
              publishedAt: null,
              categoryId: data.categoryId,
              footageTags:
                data.tagIds.length > 0
                  ? {
                      create: data.tagIds.map((tagId) => ({ tagId })),
                    }
                  : undefined,
            },
            include: footageInclude,
          });

          return created;
        });

        return toRecord(row);
      } catch (error) {
        if (isUniqueSlugViolation(error)) {
          throw new FootageSlugConflictError();
        }

        mapForeignKeyViolation(error);
      }
    },

    async findById(footageId) {
      const row = await client.footage.findUnique({
        where: { id: footageId },
        include: footageInclude,
      });

      return row ? toRecord(row) : null;
    },

    async updateMetadata(data: UpdateFootageMetadataPersistence) {
      try {
        const row = await client.$transaction(async (tx) => {
          const existing = await tx.footage.findUnique({
            where: { id: data.footageId },
            select: { id: true },
          });

          if (!existing) {
            throw new FootageNotFoundError();
          }

          await tx.footageTag.deleteMany({
            where: { footageId: data.footageId },
          });

          const updated = await tx.footage.update({
            where: { id: data.footageId },
            data: {
              titleFa: data.titleFa,
              slug: data.slug,
              descriptionFa: data.descriptionFa,
              priceToman: data.priceToman,
              categoryId: data.categoryId,
              footageTags:
                data.tagIds.length > 0
                  ? {
                      create: data.tagIds.map((tagId) => ({ tagId })),
                    }
                  : undefined,
            },
            include: footageInclude,
          });

          return updated;
        });

        return toRecord(row);
      } catch (error) {
        if (error instanceof FootageNotFoundError) {
          throw error;
        }

        if (isUniqueSlugViolation(error)) {
          throw new FootageSlugConflictError();
        }

        mapForeignKeyViolation(error);
      }
    },

    async setPublished(data: PublishFootagePersistence) {
      try {
        const row = await client.$transaction(async (tx) => {
          const current = await tx.footage.findUnique({
            where: { id: data.footageId },
            include: footageInclude,
          });

          if (!current) {
            throw new FootageNotFoundError();
          }

          if (current.status === "PUBLISHED" && current.publishedAt !== null) {
            return current;
          }

          const updatedCount = await tx.footage.updateMany({
            where: {
              id: data.footageId,
              status: "DRAFT",
              footageFiles: {
                some: {
                  kind: "PREVIEW",
                  uploadStatus: "READY",
                },
              },
              cover: { isNot: null },
            },
            data: {
              status: "PUBLISHED",
              publishedAt: data.publishedAt,
            },
          });

          if (updatedCount.count === 0) {
            const afterRace = await tx.footage.findUnique({
              where: { id: data.footageId },
              include: footageInclude,
            });

            if (
              afterRace?.status === "PUBLISHED" &&
              afterRace.publishedAt !== null
            ) {
              return afterRace;
            }

            throw new FootagePreviewNotReadyError();
          }

          const published = await tx.footage.findUnique({
            where: { id: data.footageId },
            include: footageInclude,
          });

          if (!published) {
            throw new FootageNotFoundError();
          }

          return published;
        });

        return toRecord(row);
      } catch (error) {
        if (
          error instanceof FootageNotFoundError ||
          error instanceof FootagePreviewNotReadyError
        ) {
          throw error;
        }

        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === "P2025"
        ) {
          throw new FootageNotFoundError();
        }

        throw error;
      }
    },

    async setDraft(footageId) {
      try {
        const row = await client.footage.update({
          where: { id: footageId },
          data: {
            status: "DRAFT",
            publishedAt: null,
          },
          include: footageInclude,
        });

        return toRecord(row);
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === "P2025"
        ) {
          throw new FootageNotFoundError();
        }

        throw error;
      }
    },
  };
}
