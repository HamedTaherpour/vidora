/**
 * Opt-in PostgreSQL checks for the FootageFile persistence contract.
 * Excluded from `pnpm test` and CI. Run with `pnpm test:pg`.
 * Deletes only the rows this file inserts. Does not reset or truncate.
 */
import { randomInt } from "node:crypto";
import { PrismaPg } from "@prisma/adapter-pg";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import { Prisma, PrismaClient } from "@/generated/prisma/client";
import { loadLocalEnvFiles } from "@/lib/env/load-local-env-files";

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
      `FootageFile schema test refuses non-local database host ${host}.`,
    );
  }

  if (url.pathname.toLowerCase().includes("prod")) {
    throw new Error(
      "FootageFile schema test refuses a database name containing prod.",
    );
  }
}

function categorySlug(label: string): string {
  const slug = `media01-cat-${label}-${run}`;
  createdCategorySlugs.push(slug);
  return slug;
}

function footageSlug(label: string): string {
  const slug = `media01-ftg-${label}-${run}`;
  createdFootageSlugs.push(slug);
  return slug;
}

function objectKey(label: string): string {
  const key = `footage/media01/${run}/${label}`;
  createdObjectKeys.push(key);
  return key;
}

function requirePrisma(): PrismaClient {
  if (!prisma) {
    throw new Error("FootageFile schema test is not connected.");
  }

  return prisma;
}

async function createTestCategory(label: string): Promise<string> {
  const client = requirePrisma();
  const category = await client.category.create({
    data: {
      nameFa: "دسته آزمایشی رسانه",
      slug: categorySlug(label),
    },
  });
  return category.id;
}

async function createTestFootage(label: string): Promise<string> {
  const client = requirePrisma();
  const categoryId = await createTestCategory(label);
  const footage = await client.footage.create({
    data: {
      titleFa: "فووتیج آزمایشی رسانه",
      slug: footageSlug(label),
      descriptionFa: "فووتیج برای آزمایش FootageFile",
      priceToman: 100_000,
      status: "DRAFT",
      categoryId,
    },
  });
  return footage.id;
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

describe("FootageFile schema PostgreSQL contract", () => {
  it("inserts one PREVIEW file for a Footage", async () => {
    const client = requirePrisma();
    const footageId = await createTestFootage("preview");

    const row = await client.footageFile.create({
      data: {
        footageId,
        kind: "PREVIEW",
        label: "Preview",
        objectKey: objectKey("preview"),
        sizeBytes: BigInt(12_345_678),
        mimeType: "video/mp4",
        width: 1920,
        height: 1080,
        fps: new Prisma.Decimal("23.976"),
        codec: "h264",
      },
    });

    expect(row.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
    expect(row.kind).toBe("PREVIEW");
    expect(row.fps?.toString()).toBe("23.976");
    expect(row.sizeBytes).toBe(BigInt(12_345_678));
  });

  it("rejects a second PREVIEW for the same Footage", async () => {
    const client = requirePrisma();
    const footageId = await createTestFootage("two-previews");

    await client.footageFile.create({
      data: {
        footageId,
        kind: "PREVIEW",
        label: "Preview",
        objectKey: objectKey("two-previews-a"),
        sizeBytes: BigInt(1_000),
        mimeType: "video/mp4",
      },
    });

    await expect(
      client.footageFile.create({
        data: {
          footageId,
          kind: "PREVIEW",
          label: "Preview Alt",
          objectKey: objectKey("two-previews-b"),
          sizeBytes: BigInt(2_000),
          mimeType: "video/mp4",
        },
      }),
    ).rejects.toSatisfy((error: unknown) => {
      return (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      );
    });
  });

  it("allows multiple ORIGINAL files with free-form labels", async () => {
    const client = requirePrisma();
    const footageId = await createTestFootage("originals");

    const first = await client.footageFile.create({
      data: {
        footageId,
        kind: "ORIGINAL",
        label: "1080p",
        objectKey: objectKey("original-1080p"),
        sizeBytes: BigInt(500_000_000),
        mimeType: "video/mp4",
        width: 1920,
        height: 1080,
        fps: new Prisma.Decimal("29.970"),
      },
    });

    const second = await client.footageFile.create({
      data: {
        footageId,
        kind: "ORIGINAL",
        label: "ProRes Master",
        objectKey: objectKey("original-master"),
        sizeBytes: BigInt(2_147_483_648),
        mimeType: "video/quicktime",
        codec: "prores",
      },
    });

    expect(first.label).toBe("1080p");
    expect(second.label).toBe("ProRes Master");
    expect(second.sizeBytes).toBe(BigInt(2_147_483_648));
    expect(first.width).toBe(1920);
    expect(second.width).toBeNull();
    expect(second.fps).toBeNull();
  });

  it("allows each Footage to have its own PREVIEW", async () => {
    const client = requirePrisma();
    const footageA = await createTestFootage("preview-a");
    const footageB = await createTestFootage("preview-b");

    const previewA = await client.footageFile.create({
      data: {
        footageId: footageA,
        kind: "PREVIEW",
        label: "Preview",
        objectKey: objectKey("preview-a"),
        sizeBytes: BigInt(1_000),
        mimeType: "video/mp4",
      },
    });

    const previewB = await client.footageFile.create({
      data: {
        footageId: footageB,
        kind: "PREVIEW",
        label: "Preview",
        objectKey: objectKey("preview-b"),
        sizeBytes: BigInt(2_000),
        mimeType: "video/mp4",
      },
    });

    expect(previewA.footageId).toBe(footageA);
    expect(previewB.footageId).toBe(footageB);
  });

  it("rejects a duplicate objectKey", async () => {
    const client = requirePrisma();
    const footageId = await createTestFootage("dup-key");
    const key = objectKey("shared");

    await client.footageFile.create({
      data: {
        footageId,
        kind: "ORIGINAL",
        label: "4K",
        objectKey: key,
        sizeBytes: BigInt(1_000),
        mimeType: "video/mp4",
      },
    });

    await expect(
      client.footageFile.create({
        data: {
          footageId,
          kind: "ORIGINAL",
          label: "Master",
          objectKey: key,
          sizeBytes: BigInt(2_000),
          mimeType: "video/mp4",
        },
      }),
    ).rejects.toSatisfy((error: unknown) => {
      return (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      );
    });
  });

  it("restricts deleting Footage while FootageFile rows reference it", async () => {
    const client = requirePrisma();
    const footageId = await createTestFootage("restrict-delete");
    const slug = createdFootageSlugs[createdFootageSlugs.length - 1];

    await client.footageFile.create({
      data: {
        footageId,
        kind: "ORIGINAL",
        label: "1080p",
        objectKey: objectKey("restrict-delete"),
        sizeBytes: BigInt(1_000),
        mimeType: "video/mp4",
      },
    });

    await expect(
      client.footage.delete({
        where: { id: footageId },
      }),
    ).rejects.toSatisfy((error: unknown) => {
      return (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2003"
      );
    });

    const stillThere = await client.footage.findUnique({
      where: { slug },
    });
    expect(stillThere?.id).toBe(footageId);
  });

  it("leaves existing auth and catalog tables intact", async () => {
    const client = requirePrisma();
    const footageId = await createTestFootage("tables-intact");

    const [userCount, adminCount, categoryCount, footageCount] =
      await Promise.all([
        client.user.count(),
        client.admin.count(),
        client.category.count(),
        client.footage.count(),
      ]);

    expect(userCount).toBeGreaterThanOrEqual(0);
    expect(adminCount).toBeGreaterThanOrEqual(0);
    expect(categoryCount).toBeGreaterThanOrEqual(1);
    expect(footageCount).toBeGreaterThanOrEqual(1);

    await client.footageFile.create({
      data: {
        footageId,
        kind: "PREVIEW",
        label: "Preview",
        objectKey: objectKey("tables-intact"),
        sizeBytes: BigInt(1_000),
        mimeType: "video/mp4",
      },
    });

    const [
      userCountAfter,
      adminCountAfter,
      categoryCountAfter,
      footageCountAfter,
    ] = await Promise.all([
      client.user.count(),
      client.admin.count(),
      client.category.count(),
      client.footage.count(),
    ]);

    expect(userCountAfter).toBe(userCount);
    expect(adminCountAfter).toBe(adminCount);
    expect(categoryCountAfter).toBe(categoryCount);
    expect(footageCountAfter).toBe(footageCount);
  });
});
