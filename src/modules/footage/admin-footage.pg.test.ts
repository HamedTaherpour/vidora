/**
 * Opt-in PostgreSQL checks for Admin Footage CRUD persistence.
 * Excluded from `pnpm test` and CI. Run with `pnpm test:pg`.
 * Deletes only the rows this file inserts. Does not reset or truncate.
 */
import { randomInt } from "node:crypto";
import { PrismaPg } from "@prisma/adapter-pg";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import { PrismaClient } from "@/generated/prisma/client";
import { loadLocalEnvFiles } from "@/lib/env/load-local-env-files";
import { FootageSlugConflictError } from "@/modules/footage/admin-footage-errors";
import {
  createDraftFootageInputSchema,
  updateFootageMetadataInputSchema,
} from "@/modules/footage/admin-footage-input";
import { createDraftFootage } from "@/modules/footage/create-draft-footage";
import { createPrismaAdminFootageStore } from "@/modules/footage/prisma-admin-footage-store";
import { publishFootage } from "@/modules/footage/publish-footage";
import { unpublishFootage } from "@/modules/footage/unpublish-footage";
import { updateFootageMetadata } from "@/modules/footage/update-footage-metadata";

loadLocalEnvFiles({ nodeEnv: "development" });

const run = randomInt(0, 0x10000);
const createdCategorySlugs: string[] = [];
const createdTagSlugs: string[] = [];
const createdFootageSlugs: string[] = [];

let prisma: PrismaClient | undefined;

function assertLocalDevelopmentDatabase(connectionString: string): void {
  const url = new URL(connectionString);
  const host = url.hostname.replace(/^\[|\]$/g, "");
  const local = host === "localhost" || host === "127.0.0.1" || host === "::1";

  if (!local) {
    throw new Error(
      `Admin Footage CRUD test refuses non-local database host ${host}.`,
    );
  }

  if (url.pathname.toLowerCase().includes("prod")) {
    throw new Error(
      "Admin Footage CRUD test refuses a database name containing prod.",
    );
  }
}

function categorySlug(label: string): string {
  const slug = `cat03-cat-${label}-${run}`;
  createdCategorySlugs.push(slug);
  return slug;
}

function tagSlug(label: string): string {
  const slug = `cat03-tag-${label}-${run}`;
  createdTagSlugs.push(slug);
  return slug;
}

function footageSlug(label: string): string {
  const slug = `cat03-ftg-${label}-${run}`;
  createdFootageSlugs.push(slug);
  return slug;
}

function requirePrisma(): PrismaClient {
  if (!prisma) {
    throw new Error("Admin Footage CRUD test is not connected.");
  }

  return prisma;
}

async function cleanup(): Promise<void> {
  if (!prisma) {
    return;
  }

  if (createdFootageSlugs.length > 0) {
    await prisma.footage.deleteMany({
      where: { slug: { in: [...new Set(createdFootageSlugs)] } },
    });
  }

  if (createdTagSlugs.length > 0) {
    await prisma.tag.deleteMany({
      where: { slug: { in: [...new Set(createdTagSlugs)] } },
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
  createdFootageSlugs.length = 0;
  createdTagSlugs.length = 0;
  createdCategorySlugs.length = 0;
});

afterAll(async () => {
  await cleanup();
  await prisma?.$disconnect();
});

describe("Admin Footage CRUD PostgreSQL persistence", () => {
  it("creates draft Footage and Tags atomically", async () => {
    const client = requirePrisma();
    const store = createPrismaAdminFootageStore(client);

    const category = await client.category.create({
      data: {
        nameFa: "دسته CAT-03",
        slug: categorySlug("create"),
      },
    });
    const tagOne = await client.tag.create({
      data: { nameFa: "برچسب یک", slug: tagSlug("one") },
    });
    const tagTwo = await client.tag.create({
      data: { nameFa: "برچسب دو", slug: tagSlug("two") },
    });

    const slug = footageSlug("atomic-create");
    const footage = await createDraftFootage({
      input: createDraftFootageInputSchema.parse({
        titleFa: "ایجاد اتمی",
        slug,
        descriptionFa: "با دو برچسب",
        priceToman: 150_000,
        categoryId: category.id,
        tagIds: [tagOne.id, tagTwo.id, tagOne.id],
      }),
      store,
    });

    expect(footage.status).toBe("DRAFT");
    expect(footage.publishedAt).toBeNull();
    expect(new Set(footage.tagIds)).toEqual(new Set([tagOne.id, tagTwo.id]));

    const joinCount = await client.footageTag.count({
      where: { footageId: footage.id },
    });
    expect(joinCount).toBe(2);
  });

  it("replaces metadata and Tags atomically and rejects duplicate slug", async () => {
    const client = requirePrisma();
    const store = createPrismaAdminFootageStore(client);

    const categoryA = await client.category.create({
      data: { nameFa: "دسته آ", slug: categorySlug("a") },
    });
    const categoryB = await client.category.create({
      data: { nameFa: "دسته ب", slug: categorySlug("b") },
    });
    const tagA = await client.tag.create({
      data: { nameFa: "آ", slug: tagSlug("a") },
    });
    const tagB = await client.tag.create({
      data: { nameFa: "ب", slug: tagSlug("b") },
    });

    const first = await createDraftFootage({
      input: createDraftFootageInputSchema.parse({
        titleFa: "اول",
        slug: footageSlug("first"),
        descriptionFa: "اول",
        priceToman: 10_000,
        categoryId: categoryA.id,
        tagIds: [tagA.id],
      }),
      store,
    });
    const second = await createDraftFootage({
      input: createDraftFootageInputSchema.parse({
        titleFa: "دوم",
        slug: footageSlug("second"),
        descriptionFa: "دوم",
        priceToman: 20_000,
        categoryId: categoryA.id,
        tagIds: [],
      }),
      store,
    });

    const updated = await updateFootageMetadata({
      footageId: first.id,
      input: updateFootageMetadataInputSchema.parse({
        titleFa: "اول ویرایش‌شده",
        slug: first.slug,
        descriptionFa: "توضیح جدید",
        priceToman: 33_000,
        categoryId: categoryB.id,
        tagIds: [tagB.id],
      }),
      store,
    });

    expect(updated.priceToman).toBe(33_000);
    expect(updated.categoryId).toBe(categoryB.id);
    expect(updated.tagIds).toEqual([tagB.id]);

    const joinRows = await client.footageTag.findMany({
      where: { footageId: first.id },
    });
    expect(joinRows).toHaveLength(1);
    expect(joinRows[0]?.tagId).toBe(tagB.id);

    await expect(
      updateFootageMetadata({
        footageId: second.id,
        input: updateFootageMetadataInputSchema.parse({
          titleFa: "تداخل اسلاگ",
          slug: first.slug,
          descriptionFa: "باید رد شود",
          priceToman: 1,
          categoryId: categoryA.id,
          tagIds: [],
        }),
        store,
      }),
    ).rejects.toBeInstanceOf(FootageSlugConflictError);

    const secondAfter = await store.findById(second.id);
    expect(secondAfter?.slug).toBe(second.slug);
    expect(secondAfter?.categoryId).toBe(categoryA.id);
  });

  it("enforces Category FK and publication state through application operations", async () => {
    const client = requirePrisma();
    const store = createPrismaAdminFootageStore(client);

    const category = await client.category.create({
      data: { nameFa: "دسته انتشار", slug: categorySlug("pub") },
    });

    const footage = await createDraftFootage({
      input: createDraftFootageInputSchema.parse({
        titleFa: "برای انتشار",
        slug: footageSlug("publish"),
        descriptionFa: "بدون برچسب",
        priceToman: 0,
        categoryId: category.id,
        tagIds: [],
      }),
      store,
    });

    const publishedAt = new Date("2026-10-05T20:00:00.000Z");
    const published = await publishFootage({
      footageId: footage.id,
      store,
      now: publishedAt,
    });

    expect(published.status).toBe("PUBLISHED");
    expect(published.publishedAt?.toISOString()).toBe(
      publishedAt.toISOString(),
    );

    const again = await publishFootage({
      footageId: footage.id,
      store,
      now: new Date("2026-10-05T21:00:00.000Z"),
    });
    expect(again.publishedAt?.toISOString()).toBe(publishedAt.toISOString());

    const unpublished = await unpublishFootage({
      footageId: footage.id,
      store,
    });
    expect(unpublished.status).toBe("DRAFT");
    expect(unpublished.publishedAt).toBeNull();

    const dbRow = await client.footage.findUniqueOrThrow({
      where: { id: footage.id },
    });
    expect(dbRow.status).toBe("DRAFT");
    expect(dbRow.publishedAt).toBeNull();
  });

  it("rejects create with unknown Category via application error", async () => {
    const client = requirePrisma();
    const store = createPrismaAdminFootageStore(client);
    const missingCategoryId = "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee";

    await expect(
      createDraftFootage({
        input: createDraftFootageInputSchema.parse({
          titleFa: "بدون دسته",
          slug: footageSlug("missing-cat"),
          descriptionFa: "باید رد شود",
          priceToman: 1000,
          categoryId: missingCategoryId,
          tagIds: [],
        }),
        store,
      }),
    ).rejects.toThrow();
  });
});
