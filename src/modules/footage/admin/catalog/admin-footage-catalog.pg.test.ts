/**
 * Opt-in PostgreSQL checks for Admin catalog list queries.
 * Excluded from `pnpm test` and CI. Run with `pnpm test:pg`.
 * Deletes only the rows this file inserts. Does not reset or truncate.
 */
import { randomInt } from "node:crypto";
import { PrismaPg } from "@prisma/adapter-pg";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import { PrismaClient } from "@/generated/prisma/client";
import { loadLocalEnvFiles } from "@/lib/env/load-local-env-files";
import { listAdminFootageCatalog } from "@/modules/footage/admin/catalog/list-admin-footage-catalog";
import { createPrismaAdminFootageCatalogStore } from "@/modules/footage/admin/catalog/prisma-admin-footage-catalog-store";

loadLocalEnvFiles({ nodeEnv: "development" });

const run = randomInt(0, 0x10000);
const createdCategorySlugs: string[] = [];
const createdFootageSlugs: string[] = [];

let prisma: PrismaClient | undefined;

function assertLocalDevelopmentDatabase(connectionString: string): void {
  const url = new URL(connectionString);
  const host = url.hostname.replace(/^\[|\]$/g, "");
  const local = host === "localhost" || host === "127.0.0.1" || host === "::1";

  if (!local) {
    throw new Error(
      `Admin catalog list test refuses non-local database host ${host}.`,
    );
  }

  if (url.pathname.toLowerCase().includes("prod")) {
    throw new Error(
      "Admin catalog list test refuses a database name containing prod.",
    );
  }
}

function categorySlug(label: string): string {
  const slug = `cat04-cat-${label}-${run}`;
  createdCategorySlugs.push(slug);
  return slug;
}

function footageSlug(label: string): string {
  const slug = `cat04-ftg-${label}-${run}`;
  createdFootageSlugs.push(slug);
  return slug;
}

function requirePrisma(): PrismaClient {
  if (!prisma) {
    throw new Error("Admin catalog list test is not connected.");
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
});

afterAll(async () => {
  await cleanup();
  await prisma?.$disconnect();
});

describe("Admin Footage catalog list (PostgreSQL)", () => {
  it("lists DRAFT and PUBLISHED with Category, searches, and paginates deterministically", async () => {
    const client = requirePrisma();
    const store = createPrismaAdminFootageCatalogStore(client);

    const category = await client.category.create({
      data: {
        nameFa: "CAT04 طبیعت",
        slug: categorySlug("nature"),
      },
    });

    const older = await client.footage.create({
      data: {
        titleFa: "ساحل قدیمی",
        slug: footageSlug("older"),
        descriptionFa: "توضیح",
        priceToman: 10_000,
        status: "DRAFT",
        publishedAt: null,
        categoryId: category.id,
      },
    });

    await client.$executeRaw`
      UPDATE "Footage"
      SET "updatedAt" = ${new Date("2026-10-01T10:00:00.000Z")}
      WHERE id = ${older.id}::uuid
    `;

    const draft = await client.footage.create({
      data: {
        titleFa: "جنگل مه آلود",
        slug: footageSlug("forest"),
        descriptionFa: "توضیح",
        priceToman: 120_000,
        status: "DRAFT",
        publishedAt: null,
        categoryId: category.id,
      },
    });

    await client.$executeRaw`
      UPDATE "Footage"
      SET "updatedAt" = ${new Date("2026-10-02T10:00:00.000Z")}
      WHERE id = ${draft.id}::uuid
    `;

    const published = await client.footage.create({
      data: {
        titleFa: "خیابان شب",
        slug: footageSlug("street"),
        descriptionFa: "توضیح",
        priceToman: 250_000,
        status: "PUBLISHED",
        publishedAt: new Date("2026-10-03T10:00:00.000Z"),
        categoryId: category.id,
      },
    });

    await client.$executeRaw`
      UPDATE "Footage"
      SET "updatedAt" = ${new Date("2026-10-03T10:00:00.000Z")}
      WHERE id = ${published.id}::uuid
    `;

    const all = await listAdminFootageCatalog({
      store,
      q: "",
      page: 1,
      pageSize: 50,
    });

    const owned = all.items.filter((item) =>
      createdFootageSlugs.includes(item.slug),
    );

    expect(owned.map((item) => item.status).sort()).toEqual([
      "DRAFT",
      "DRAFT",
      "PUBLISHED",
    ]);
    expect(owned.every((item) => item.category.id === category.id)).toBe(true);
    expect(owned.every((item) => item.category.nameFa === "CAT04 طبیعت")).toBe(
      true,
    );
    expect(owned.map((item) => item.id)).toEqual([
      published.id,
      draft.id,
      older.id,
    ]);

    const byTitle = await listAdminFootageCatalog({
      store,
      q: "جنگل",
      page: 1,
      pageSize: 50,
    });
    expect(byTitle.items.map((item) => item.id)).toEqual([draft.id]);

    const bySlug = await listAdminFootageCatalog({
      store,
      q: published.slug,
      page: 1,
      pageSize: 50,
    });
    expect(bySlug.items.map((item) => item.id)).toEqual([published.id]);

    const emptySearch = await listAdminFootageCatalog({
      store,
      q: "",
      page: 1,
      pageSize: 2,
    });
    expect(emptySearch.items.length).toBeGreaterThan(0);

    const scopedToken = String(run);
    const scopedPage = await listAdminFootageCatalog({
      store,
      q: scopedToken,
      page: 1,
      pageSize: 2,
    });
    expect(scopedPage.items.map((item) => item.id)).toEqual([
      published.id,
      draft.id,
    ]);
    expect(scopedPage.totalCount).toBe(3);
    expect(scopedPage.totalPages).toBe(2);

    const page2 = await listAdminFootageCatalog({
      store,
      q: scopedToken,
      page: 2,
      pageSize: 2,
    });
    expect(page2.items.map((item) => item.id)).toEqual([older.id]);

    const outOfRange = await listAdminFootageCatalog({
      store,
      q: published.slug,
      page: 99,
      pageSize: 50,
    });
    expect(outOfRange.emptyReason).toBe("page_out_of_range");
    expect(outOfRange.items).toEqual([]);
  });
});
