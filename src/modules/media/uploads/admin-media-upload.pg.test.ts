/**
 * Opt-in PostgreSQL checks for MEDIA-03 upload lifecycle invariants.
 * Excluded from `pnpm test` and CI. Run with `pnpm test:pg`.
 * Deletes only the rows this file inserts. Does not reset or truncate.
 */
import { randomInt } from "node:crypto";
import { PrismaPg } from "@prisma/adapter-pg";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import { Prisma, PrismaClient } from "@/generated/prisma/client";
import { loadLocalEnvFiles } from "@/lib/env/load-local-env-files";
import {
  abortAdminMediaUpload,
  completeAdminMediaUpload,
  initiateAdminMediaUpload,
} from "@/modules/media/uploads/admin-media-upload";
import {
  PreviewAlreadyReadyError,
  UploadSessionNotActiveError,
} from "@/modules/media/uploads/admin-media-upload-errors";
import { createPrismaAdminMediaUploadStore } from "@/modules/media/uploads/prisma-admin-media-upload-store";
import { createPrismaAdminOriginalVariantStore } from "@/modules/media/originals/prisma-admin-original-variants";
import type { ObjectStorage } from "@/modules/media/storage/object-storage";
import { MULTIPART_PART_SIZE_BYTES } from "@/modules/media/uploads/upload-limits";

loadLocalEnvFiles({ nodeEnv: "development" });

const run = randomInt(0, 0x10000);
const createdCategorySlugs: string[] = [];
const createdFootageSlugs: string[] = [];
const createdObjectKeys: string[] = [];

let prisma: PrismaClient | undefined;

function assertLocalDevelopmentDatabase(connectionString: string): void {
  const url = new URL(connectionString);
  const host = url.hostname.replace(/^\[|\]$/g, "");
  const local = host === "localhost" || host === "127.0.0.1" || host === "::1";

  if (!local) {
    throw new Error(
      `Admin media upload schema test refuses non-local database host ${host}.`,
    );
  }

  if (url.pathname.toLowerCase().includes("prod")) {
    throw new Error(
      "Admin media upload schema test refuses a database name containing prod.",
    );
  }
}

function categorySlug(label: string): string {
  const slug = `media03-cat-${label}-${run}`;
  createdCategorySlugs.push(slug);
  return slug;
}

function footageSlug(label: string): string {
  const slug = `media03-ftg-${label}-${run}`;
  createdFootageSlugs.push(slug);
  return slug;
}

function trackKey(key: string): string {
  createdObjectKeys.push(key);
  return key;
}

function requirePrisma(): PrismaClient {
  if (!prisma) {
    throw new Error("Admin media upload schema test is not connected.");
  }

  return prisma;
}

async function createTestFootage(label: string): Promise<string> {
  const client = requirePrisma();
  const category = await client.category.create({
    data: {
      nameFa: "دسته آزمایشی آپلود",
      slug: categorySlug(label),
    },
  });
  const footage = await client.footage.create({
    data: {
      titleFa: "فووتیج آزمایشی آپلود",
      slug: footageSlug(label),
      descriptionFa: "فووتیج برای آزمایش آپلود",
      priceToman: 100_000,
      status: "DRAFT",
      categoryId: category.id,
    },
  });
  return footage.id;
}

function createFakeStorage(
  overrides: Partial<ObjectStorage> = {},
): ObjectStorage {
  let counter = 0;
  return {
    provider: "liara-s3",
    bucket: "test-bucket",
    createUploadAccess: async () => {
      throw new Error("unused");
    },
    createReadAccess: async () => {
      throw new Error("unused");
    },
    headObject: async () => null,
    deleteObject: async () => undefined,
    createMultipartUpload: async ({ objectKey, accessPolicy }) => ({
      objectKey,
      uploadId: `provider-${++counter}`,
      accessPolicy,
    }),
    createUploadPartAccess: async () => {
      throw new Error("unused");
    },
    completeMultipartUpload: async () => {
      throw new Error("unused");
    },
    abortMultipartUpload: async () => undefined,
    ...overrides,
  };
}

async function cleanup(): Promise<void> {
  if (!prisma) {
    return;
  }

  if (createdObjectKeys.length > 0) {
    await prisma.footageFile.deleteMany({
      where: { objectKey: { in: [...new Set(createdObjectKeys)] } },
    });
  }

  if (createdFootageSlugs.length > 0) {
    await prisma.footage.deleteMany({
      where: { slug: { in: [...new Set(createdFootageSlugs)] } },
    });
  }

  if (createdCategorySlugs.length > 0) {
    await prisma.category.deleteMany({
      where: { slug: { in: [...new Set(createdCategorySlugs)] } },
    });
  }
}

beforeAll(() => {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is missing. pnpm test:pg uses the local development database.",
    );
  }

  assertLocalDevelopmentDatabase(connectionString);

  prisma = new PrismaClient({
    adapter: new PrismaPg({
      connectionString,
      max: 5,
    }),
  });
});

afterEach(async () => {
  await cleanup();
  createdObjectKeys.length = 0;
  createdFootageSlugs.length = 0;
  createdCategorySlugs.length = 0;
});

afterAll(async () => {
  await cleanup();
  await prisma?.$disconnect();
});

describe("MEDIA-03 upload lifecycle PostgreSQL contract", () => {
  it("defaults existing-style inserts to READY and keeps incomplete rows unusable", async () => {
    const client = requirePrisma();
    const footageId = await createTestFootage("ready-default");
    const key = trackKey(`footage/${footageId}/preview/ready-default.mp4`);

    const row = await client.footageFile.create({
      data: {
        footageId,
        kind: "PREVIEW",
        label: "Preview",
        objectKey: key,
        sizeBytes: BigInt(1000),
        mimeType: "video/mp4",
      },
    });

    expect(row.uploadStatus).toBe("READY");
    expect(row.providerUploadId).toBeNull();
  });

  it("allows only one PREVIEW identity even while an INITIATED upload exists", async () => {
    const client = requirePrisma();
    const footageId = await createTestFootage("preview-initiated");
    const store = createPrismaAdminMediaUploadStore(client);
    const storage = createFakeStorage();

    const first = await initiateAdminMediaUpload({
      input: {
        footageId,
        kind: "PREVIEW",
        sizeBytes: 1500,
        mimeType: "video/mp4",
        fileName: "a.mp4",
      },
      store,
      storage,
      createObjectKey: ({ footageId: id }) =>
        trackKey(`footage/${id}/preview/a.mp4`),
    });

    expect(first.uploadId).toBeTruthy();

    const restarted = await initiateAdminMediaUpload({
      input: {
        footageId,
        kind: "PREVIEW",
        sizeBytes: 2500,
        mimeType: "video/mp4",
        fileName: "b.mp4",
      },
      store,
      storage,
      createObjectKey: ({ footageId: id }) =>
        trackKey(`footage/${id}/preview/b.mp4`),
    });

    expect(restarted.uploadId).toBe(first.uploadId);

    const count = await client.footageFile.count({
      where: { footageId, kind: "PREVIEW" },
    });
    expect(count).toBe(1);

    await client.footageFile.update({
      where: { id: first.uploadId },
      data: {
        uploadStatus: "READY",
        providerUploadId: null,
      },
    });

    await expect(
      initiateAdminMediaUpload({
        input: {
          footageId,
          kind: "PREVIEW",
          sizeBytes: 3000,
          mimeType: "video/mp4",
        },
        store,
        storage,
        createObjectKey: ({ footageId: id }) =>
          trackKey(`footage/${id}/preview/c.mp4`),
      }),
    ).rejects.toBeInstanceOf(PreviewAlreadyReadyError);
  });

  it("allows multiple ORIGINAL INITIATED uploads for one Footage", async () => {
    const client = requirePrisma();
    const footageId = await createTestFootage("originals");
    const store = createPrismaAdminMediaUploadStore(client);
    const storage = createFakeStorage();

    const first = await initiateAdminMediaUpload({
      input: {
        footageId,
        kind: "ORIGINAL",
        label: "1080p",
        sizeBytes: 1000,
        mimeType: "video/mp4",
      },
      store,
      storage,
      createObjectKey: ({ footageId: id }) =>
        trackKey(`footage/${id}/originals/1080p.mp4`),
    });
    const second = await initiateAdminMediaUpload({
      input: {
        footageId,
        kind: "ORIGINAL",
        label: "Master",
        sizeBytes: 2000,
        mimeType: "video/mp4",
      },
      store,
      storage,
      createObjectKey: ({ footageId: id }) =>
        trackKey(`footage/${id}/originals/master.mp4`),
    });

    expect(first.uploadId).not.toBe(second.uploadId);

    const count = await client.footageFile.count({
      where: { footageId, kind: "ORIGINAL" },
    });
    expect(count).toBe(2);
  });

  it("updates only an ORIGINAL label and preserves storage and lifecycle identity", async () => {
    const client = requirePrisma();
    const footageId = await createTestFootage("original-label-edit");
    const objectKey = trackKey(`footage/${footageId}/originals/label-edit.mp4`);
    const row = await client.footageFile.create({
      data: {
        footageId,
        kind: "ORIGINAL",
        label: "1080p",
        objectKey,
        sizeBytes: BigInt(2_000),
        mimeType: "video/mp4",
        uploadStatus: "INITIATED",
        providerUploadId: "provider-label-edit",
      },
    });
    const store = createPrismaAdminOriginalVariantStore(client);

    const updated = await store.updateLabel({
      footageId,
      variantId: row.id,
      label: "Master",
    });

    expect(updated).toMatchObject({
      id: row.id,
      footageId,
      label: "Master",
      sizeBytes: 2_000,
      uploadStatus: "INITIATED",
    });
    const persisted = await client.footageFile.findUniqueOrThrow({
      where: { id: row.id },
    });
    expect(persisted.objectKey).toBe(objectKey);
    expect(persisted.providerUploadId).toBe("provider-label-edit");
    expect(persisted.uploadStatus).toBe("INITIATED");

    const preview = await client.footageFile.create({
      data: {
        footageId,
        kind: "PREVIEW",
        label: "Preview",
        objectKey: trackKey(`footage/${footageId}/preview/label-edit.mp4`),
        sizeBytes: BigInt(1_000),
        mimeType: "video/mp4",
        uploadStatus: "READY",
      },
    });
    await expect(
      store.updateLabel({
        footageId,
        variantId: preview.id,
        label: "Original",
      }),
    ).resolves.toBeNull();
  });

  it("rejects a second PREVIEW row at the database when application checks are bypassed", async () => {
    const client = requirePrisma();
    const footageId = await createTestFootage("preview-db");

    await client.footageFile.create({
      data: {
        footageId,
        kind: "PREVIEW",
        label: "Preview",
        objectKey: trackKey(`footage/${footageId}/preview/one.mp4`),
        sizeBytes: BigInt(1000),
        mimeType: "video/mp4",
        uploadStatus: "INITIATED",
        providerUploadId: "provider-1",
      },
    });

    await expect(
      client.footageFile.create({
        data: {
          footageId,
          kind: "PREVIEW",
          label: "Preview",
          objectKey: trackKey(`footage/${footageId}/preview/two.mp4`),
          sizeBytes: BigInt(2000),
          mimeType: "video/mp4",
          uploadStatus: "INITIATED",
          providerUploadId: "provider-2",
        },
      }),
    ).rejects.toSatisfy((error: unknown) => {
      return (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      );
    });
  });

  it("markReady cannot overwrite ABORTED and markAborted cannot overwrite READY", async () => {
    const client = requirePrisma();
    const footageId = await createTestFootage("ready-abort-race");
    const store = createPrismaAdminMediaUploadStore(client);
    const sizeBytes = BigInt(MULTIPART_PART_SIZE_BYTES + 50);
    const key = trackKey(`footage/${footageId}/originals/race.mp4`);

    const initiated = await client.footageFile.create({
      data: {
        footageId,
        kind: "ORIGINAL",
        label: "1080p",
        objectKey: key,
        sizeBytes,
        mimeType: "video/mp4",
        uploadStatus: "INITIATED",
        providerUploadId: "provider-race",
      },
    });

    await store.markAborted(initiated.id);
    const afterAbort = await store.markReady({
      id: initiated.id,
      sizeBytes,
    });
    expect(afterAbort).toBeNull();

    const abortedRow = await client.footageFile.findUniqueOrThrow({
      where: { id: initiated.id },
    });
    expect(abortedRow.uploadStatus).toBe("ABORTED");

    await client.footageFile.update({
      where: { id: initiated.id },
      data: {
        uploadStatus: "READY",
        providerUploadId: null,
      },
    });

    const afterReady = await store.markAborted(initiated.id);
    expect(afterReady).toBeNull();

    const readyRow = await client.footageFile.findUniqueOrThrow({
      where: { id: initiated.id },
    });
    expect(readyRow.uploadStatus).toBe("READY");
  });

  it("recovers completion when the object already matches authorized size", async () => {
    const client = requirePrisma();
    const footageId = await createTestFootage("complete-recover");
    const store = createPrismaAdminMediaUploadStore(client);
    const sizeBytes = MULTIPART_PART_SIZE_BYTES + 50;
    const key = trackKey(`footage/${footageId}/originals/recover.mp4`);

    const initiated = await client.footageFile.create({
      data: {
        footageId,
        kind: "ORIGINAL",
        label: "Master",
        objectKey: key,
        sizeBytes: BigInt(sizeBytes),
        mimeType: "video/mp4",
        uploadStatus: "FAILED",
        providerUploadId: "provider-recover",
      },
    });

    const storage = createFakeStorage({
      headObject: async () => ({
        objectKey: key,
        sizeBytes,
        contentType: "video/mp4",
        etag: '"recovered"',
      }),
      completeMultipartUpload: async () => {
        throw new Error(
          "complete must not run when HeadObject already matches",
        );
      },
    });

    const result = await completeAdminMediaUpload({
      input: {
        uploadId: initiated.id,
        parts: [
          { partNumber: 1, etag: '"a"' },
          { partNumber: 2, etag: '"b"' },
        ],
      },
      store,
      storage,
    });

    expect(result.uploadStatus).toBe("READY");
    expect(result.footageFileId).toBe(initiated.id);

    const row = await client.footageFile.findUniqueOrThrow({
      where: { id: initiated.id },
    });
    expect(row.uploadStatus).toBe("READY");
    expect(row.providerUploadId).toBeNull();
    expect(row.sizeBytes).toBe(BigInt(sizeBytes));

    await expect(
      abortAdminMediaUpload({
        input: { uploadId: initiated.id },
        store,
        storage,
      }),
    ).rejects.toBeInstanceOf(UploadSessionNotActiveError);
  });
});
