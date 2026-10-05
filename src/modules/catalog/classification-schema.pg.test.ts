/**
 * Opt-in PostgreSQL checks for Category, Tag, and FootageTag contracts.
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
const createdTagSlugs: string[] = [];
const createdFootageSlugs: string[] = [];

let prisma: PrismaClient | undefined;

function assertLocalDevelopmentDatabase(connectionString: string): void {
  const url = new URL(connectionString);
  const host = url.hostname.replace(/^\[|\]$/g, "");
  const local = host === "localhost" || host === "127.0.0.1" || host === "::1";

  if (!local) {
    throw new Error(
      `Classification schema test refuses non-local database host ${host}.`,
    );
  }

  if (url.pathname.toLowerCase().includes("prod")) {
    throw new Error(
      "Classification schema test refuses a database name containing prod.",
    );
  }
}

function categorySlug(label: string): string {
  const slug = `cat02-cat-${label}-${run}`;
  createdCategorySlugs.push(slug);
  return slug;
}

function tagSlug(label: string): string {
  const slug = `cat02-tag-${label}-${run}`;
  createdTagSlugs.push(slug);
  return slug;
}

function footageSlug(label: string): string {
  const slug = `cat02-ftg-${label}-${run}`;
  createdFootageSlugs.push(slug);
  return slug;
}

function requirePrisma(): PrismaClient {
  if (!prisma) {
    throw new Error("Classification schema test is not connected.");
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
  createdCategorySlugs.length = 0;
  createdTagSlugs.length = 0;
  createdFootageSlugs.length = 0;
});

afterAll(async () => {
  await cleanup();
  await prisma?.$disconnect();
});

describe("Category/Tag schema PostgreSQL contract", () => {
  it("inserts a valid Category and rejects a duplicate slug", async () => {
    const client = requirePrisma();
    const slug = categorySlug("dup");

    const row = await client.category.create({
      data: {
        nameFa: "طبیعت",
        slug,
      },
    });

    expect(row.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
    expect(row.nameFa).toBe("طبیعت");
    expect(row.slug).toBe(slug);

    await expect(
      client.category.create({
        data: {
          nameFa: "طبیعت تکراری",
          slug,
        },
      }),
    ).rejects.toSatisfy((error: unknown) => {
      return (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      );
    });
  });

  it("inserts a valid Tag and rejects a duplicate slug", async () => {
    const client = requirePrisma();
    const slug = tagSlug("dup");

    const row = await client.tag.create({
      data: {
        nameFa: "هوایی",
        slug,
      },
    });

    expect(row.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
    expect(row.nameFa).toBe("هوایی");

    await expect(
      client.tag.create({
        data: {
          nameFa: "هوایی تکراری",
          slug,
        },
      }),
    ).rejects.toSatisfy((error: unknown) => {
      return (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      );
    });
  });

  it("requires exactly one Category on Footage and supports multiple Tags", async () => {
    const client = requirePrisma();

    const category = await client.category.create({
      data: {
        nameFa: "شهری",
        slug: categorySlug("one"),
      },
    });

    const tagA = await client.tag.create({
      data: {
        nameFa: "شب",
        slug: tagSlug("a"),
      },
    });
    const tagB = await client.tag.create({
      data: {
        nameFa: "باران",
        slug: tagSlug("b"),
      },
    });

    const footage = await client.footage.create({
      data: {
        titleFa: "خیابان بارانی",
        slug: footageSlug("multi-tag"),
        descriptionFa: "فووتیج آزمایشی دسته‌بندی",
        priceToman: 120_000,
        status: "DRAFT",
        categoryId: category.id,
        footageTags: {
          create: [{ tagId: tagA.id }, { tagId: tagB.id }],
        },
      },
      include: {
        category: true,
        footageTags: true,
      },
    });

    expect(footage.categoryId).toBe(category.id);
    expect(footage.category.slug).toBe(category.slug);
    expect(footage.footageTags).toHaveLength(2);

    const byCategory = await client.footage.findMany({
      where: { categoryId: category.id },
    });
    expect(byCategory.map((row) => row.id)).toContain(footage.id);

    const tagsForFootage = await client.footageTag.findMany({
      where: { footageId: footage.id },
      include: { tag: true },
    });
    expect(tagsForFootage.map((row) => row.tag.slug).sort()).toEqual(
      [tagA.slug, tagB.slug].sort(),
    );

    const footageForTag = await client.footageTag.findMany({
      where: { tagId: tagA.id },
    });
    expect(footageForTag.map((row) => row.footageId)).toContain(footage.id);
  });

  it("allows one Tag on multiple Footage rows and rejects duplicate joins", async () => {
    const client = requirePrisma();

    const category = await client.category.create({
      data: {
        nameFa: "حیوانات",
        slug: categorySlug("shared-tag"),
      },
    });
    const tag = await client.tag.create({
      data: {
        nameFa: "پرنده",
        slug: tagSlug("shared"),
      },
    });

    const footageA = await client.footage.create({
      data: {
        titleFa: "پرنده یک",
        slug: footageSlug("shared-a"),
        descriptionFa: "اول",
        priceToman: 1000,
        status: "DRAFT",
        categoryId: category.id,
      },
    });
    const footageB = await client.footage.create({
      data: {
        titleFa: "پرنده دو",
        slug: footageSlug("shared-b"),
        descriptionFa: "دوم",
        priceToman: 2000,
        status: "DRAFT",
        categoryId: category.id,
      },
    });

    await client.footageTag.create({
      data: { footageId: footageA.id, tagId: tag.id },
    });
    await client.footageTag.create({
      data: { footageId: footageB.id, tagId: tag.id },
    });

    const joins = await client.footageTag.findMany({
      where: { tagId: tag.id },
    });
    expect(joins).toHaveLength(2);

    await expect(
      client.footageTag.create({
        data: { footageId: footageA.id, tagId: tag.id },
      }),
    ).rejects.toSatisfy((error: unknown) => {
      return (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      );
    });
  });

  it("rejects deleting a Category that is still referenced by Footage", async () => {
    const client = requirePrisma();

    const category = await client.category.create({
      data: {
        nameFa: "محدود",
        slug: categorySlug("restrict"),
      },
    });

    const footageSlugValue = footageSlug("restrict");

    await client.footage.create({
      data: {
        titleFa: "وابسته به دسته",
        slug: footageSlugValue,
        descriptionFa: "نباید با حذف دسته پاک شود",
        priceToman: 5000,
        status: "DRAFT",
        categoryId: category.id,
      },
    });

    await expect(
      client.category.delete({ where: { id: category.id } }),
    ).rejects.toSatisfy((error: unknown) => {
      return (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        (error.code === "P2003" || error.code === "P2014")
      );
    });

    const footageStillExists = await client.footage.findUnique({
      where: { slug: footageSlugValue },
    });
    expect(footageStillExists).not.toBeNull();
  });

  it("leaves existing auth tables intact", async () => {
    const client = requirePrisma();

    const [userCount, adminCount, sessionCount] = await Promise.all([
      client.user.count(),
      client.admin.count(),
      client.session.count(),
    ]);

    const category = await client.category.create({
      data: {
        nameFa: "احراز هویت",
        slug: categorySlug("auth-intact"),
      },
    });
    const tag = await client.tag.create({
      data: {
        nameFa: "بررسی",
        slug: tagSlug("auth-intact"),
      },
    });
    await client.footage.create({
      data: {
        titleFa: "بررسی جداول احراز هویت",
        slug: footageSlug("auth-intact"),
        descriptionFa: "درج دسته‌بندی نباید جداول auth را خراب کند",
        priceToman: 120_000,
        status: "DRAFT",
        categoryId: category.id,
        footageTags: {
          create: [{ tagId: tag.id }],
        },
      },
    });

    const [userCountAfter, adminCountAfter, sessionCountAfter] =
      await Promise.all([
        client.user.count(),
        client.admin.count(),
        client.session.count(),
      ]);

    expect(userCountAfter).toBe(userCount);
    expect(adminCountAfter).toBe(adminCount);
    expect(sessionCountAfter).toBe(sessionCount);
  });
});
