import { PrismaPg } from "@prisma/adapter-pg";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import { PrismaClient } from "@/generated/prisma/client";
import { loadLocalEnvFiles } from "@/lib/env/load-local-env-files";
import { listPublishedFootage } from "@/modules/footage/public/catalog/list-published-footage";
import { createPrismaPublicFootageCatalogStore } from "@/modules/footage/public/catalog/prisma-public-footage-catalog-store";

loadLocalEnvFiles({ nodeEnv: "development" });

const run = Math.random().toString(36).slice(2, 10);
const categorySlugs: string[] = [];
const footageSlugs: string[] = [];
const footageIds: string[] = [];

let prisma: PrismaClient | undefined;

function assertLocalDevelopmentDatabase(connectionString: string): void {
  const url = new URL(connectionString);
  const host = url.hostname.replace(/^\[|\]$/g, "");
  const local = host === "localhost" || host === "127.0.0.1" || host === "::1";

  if (!local) {
    throw new Error(
      `Public catalog test refuses non-local database host ${host}.`,
    );
  }

  if (url.pathname.toLowerCase().includes("prod")) {
    throw new Error(
      "Public catalog test refuses a database name containing prod.",
    );
  }
}

function requirePrisma(): PrismaClient {
  if (!prisma) {
    throw new Error("Public catalog test is not connected.");
  }

  return prisma;
}

async function cleanup(): Promise<void> {
  if (!prisma) {
    return;
  }

  if (footageIds.length > 0) {
    await prisma.footageCover.deleteMany({
      where: { footageId: { in: [...new Set(footageIds)] } },
    });
    await prisma.footageFile.deleteMany({
      where: { footageId: { in: [...new Set(footageIds)] } },
    });
    await prisma.footage.deleteMany({
      where: { id: { in: [...new Set(footageIds)] } },
    });
  }

  if (categorySlugs.length > 0) {
    await prisma.category.deleteMany({
      where: { slug: { in: [...new Set(categorySlugs)] } },
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
    adapter: new PrismaPg({ connectionString, max: 5 }),
  });
});

afterEach(cleanup);
afterAll(async () => {
  await cleanup();
  await prisma?.$disconnect();
});

describe("public Footage catalog (PostgreSQL)", () => {
  it("returns published rows in deterministic order with safe preview state", async () => {
    const client = requirePrisma();
    const categorySlug = `store01-category-${run}`;
    const olderSlug = `store01-older-${run}`;
    const newerSlug = `store01-newer-${run}`;
    const draftSlug = `store01-draft-${run}`;
    categorySlugs.push(categorySlug);
    footageSlugs.push(olderSlug, newerSlug, draftSlug);

    const category = await client.category.create({
      data: { nameFa: "طبیعت", slug: categorySlug },
    });

    const older = await client.footage.create({
      data: {
        titleFa: "فوتیج قدیمی",
        slug: olderSlug,
        descriptionFa: "توضیح",
        priceToman: 100_000,
        status: "PUBLISHED",
        publishedAt: new Date("2026-10-01T10:00:00.000Z"),
        categoryId: category.id,
      },
    });
    const newer = await client.footage.create({
      data: {
        titleFa: "فوتیج جدید",
        slug: newerSlug,
        descriptionFa: "توضیح",
        priceToman: 200_000,
        status: "PUBLISHED",
        publishedAt: new Date("2026-10-02T10:00:00.000Z"),
        categoryId: category.id,
      },
    });
    const draft = await client.footage.create({
      data: {
        titleFa: "پیش‌نویس",
        slug: draftSlug,
        descriptionFa: "توضیح",
        priceToman: 300_000,
        status: "DRAFT",
        publishedAt: null,
        categoryId: category.id,
      },
    });
    footageIds.push(older.id, newer.id, draft.id);

    await client.footageFile.create({
      data: {
        footageId: newer.id,
        kind: "PREVIEW",
        label: "Preview",
        objectKey: `store01/${run}/preview.mp4`,
        sizeBytes: 10_000,
        mimeType: "video/mp4",
        uploadStatus: "READY",
      },
    });
    await client.footageCover.create({
      data: {
        footageId: older.id,
        objectKey: `store01/${run}/older-cover.jpg`,
        mimeType: "image/jpeg",
        sizeBytes: 128,
        width: 1280,
        height: 720,
      },
    });
    await client.footageCover.create({
      data: {
        footageId: newer.id,
        objectKey: `store01/${run}/newer-cover.jpg`,
        mimeType: "image/jpeg",
        sizeBytes: 128,
        width: 1280,
        height: 720,
      },
    });
    await client.footageFile.create({
      data: {
        footageId: newer.id,
        kind: "ORIGINAL",
        label: "4K",
        objectKey: `store01/${run}/original.mp4`,
        sizeBytes: 20_000,
        mimeType: "video/mp4",
        uploadStatus: "READY",
      },
    });
    await client.footageFile.create({
      data: {
        footageId: draft.id,
        kind: "PREVIEW",
        label: "Preview",
        objectKey: `store01/${run}/draft-preview.mp4`,
        sizeBytes: 10_000,
        mimeType: "video/mp4",
        uploadStatus: "READY",
      },
    });

    const result = await listPublishedFootage({
      store: createPrismaPublicFootageCatalogStore(client),
    });
    const owned = result.filter((item) => footageSlugs.includes(item.slug));

    expect(owned.map((item) => item.slug)).toEqual([newerSlug, olderSlug]);
    expect(owned.map((item) => item.preview.status)).toEqual([
      "ready",
      "unavailable",
    ]);
    expect(owned.every((item) => item.category.slug === categorySlug)).toBe(
      true,
    );
    expect(owned.every((item) => !("objectKey" in item))).toBe(true);
    expect(owned.every((item) => !("footageFiles" in item))).toBe(true);
  });
});
