/**
 * Opt-in PostgreSQL checks for the Footage persistence contract.
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
const createdSlugs: string[] = [];

let prisma: PrismaClient | undefined;

function assertLocalDevelopmentDatabase(connectionString: string): void {
  const url = new URL(connectionString);
  const host = url.hostname.replace(/^\[|\]$/g, "");
  const local = host === "localhost" || host === "127.0.0.1" || host === "::1";

  if (!local) {
    throw new Error(
      `Footage schema test refuses non-local database host ${host}.`,
    );
  }

  if (url.pathname.toLowerCase().includes("prod")) {
    throw new Error(
      "Footage schema test refuses a database name containing prod.",
    );
  }
}

function testSlug(label: string): string {
  const slug = `cat01-${label}-${run}`;
  createdSlugs.push(slug);
  return slug;
}

function requirePrisma(): PrismaClient {
  if (!prisma) {
    throw new Error("Footage schema test is not connected.");
  }

  return prisma;
}

async function cleanup(): Promise<void> {
  if (!prisma || createdSlugs.length === 0) {
    return;
  }

  await prisma.footage.deleteMany({
    where: { slug: { in: [...new Set(createdSlugs)] } },
  });
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
  createdSlugs.length = 0;
});

afterAll(async () => {
  await cleanup();
  await prisma?.$disconnect();
});

describe("Footage schema PostgreSQL contract", () => {
  it("inserts a valid draft Footage", async () => {
    const client = requirePrisma();
    const slug = testSlug("draft");

    const row = await client.footage.create({
      data: {
        titleFa: "پیش‌نویس آزمایشی",
        slug,
        descriptionFa: "توضیح پیش‌نویس",
        priceToman: 0,
        status: "DRAFT",
        publishedAt: null,
      },
    });

    expect(row.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
    expect(row.status).toBe("DRAFT");
    expect(row.publishedAt).toBeNull();
    expect(row.priceToman).toBe(0);
  });

  it("inserts a valid published Footage and persists integer Toman exactly", async () => {
    const client = requirePrisma();
    const slug = testSlug("published");
    const publishedAt = new Date("2026-10-05T18:00:00.000Z");

    const row = await client.footage.create({
      data: {
        titleFa: "فووتیج منتشرشده",
        slug,
        descriptionFa: "توضیح منتشرشده",
        priceToman: 450_000,
        status: "PUBLISHED",
        publishedAt,
      },
    });

    expect(row.status).toBe("PUBLISHED");
    expect(row.publishedAt?.toISOString()).toBe(publishedAt.toISOString());
    expect(row.priceToman).toBe(450_000);
    expect(Number.isInteger(row.priceToman)).toBe(true);
  });

  it("rejects a duplicate slug", async () => {
    const client = requirePrisma();
    const slug = testSlug("dup");

    await client.footage.create({
      data: {
        titleFa: "اول",
        slug,
        descriptionFa: "اول",
        priceToman: 1000,
        status: "DRAFT",
      },
    });

    await expect(
      client.footage.create({
        data: {
          titleFa: "دوم",
          slug,
          descriptionFa: "دوم",
          priceToman: 2000,
          status: "DRAFT",
        },
      }),
    ).rejects.toSatisfy((error: unknown) => {
      return (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      );
    });
  });

  it("rejects a negative priceToman", async () => {
    const client = requirePrisma();
    const slug = testSlug("negative-price");

    await expect(
      client.footage.create({
        data: {
          titleFa: "قیمت منفی",
          slug,
          descriptionFa: "باید رد شود",
          priceToman: -1,
          status: "DRAFT",
        },
      }),
    ).rejects.toThrow();
  });

  it("rejects PUBLISHED without publishedAt and DRAFT with publishedAt", async () => {
    const client = requirePrisma();

    await expect(
      client.footage.create({
        data: {
          titleFa: "منتشر بدون تاریخ",
          slug: testSlug("published-null"),
          descriptionFa: "باید رد شود",
          priceToman: 1000,
          status: "PUBLISHED",
          publishedAt: null,
        },
      }),
    ).rejects.toThrow();

    await expect(
      client.footage.create({
        data: {
          titleFa: "پیش‌نویس با تاریخ",
          slug: testSlug("draft-dated"),
          descriptionFa: "باید رد شود",
          priceToman: 1000,
          status: "DRAFT",
          publishedAt: new Date("2026-10-05T18:00:00.000Z"),
        },
      }),
    ).rejects.toThrow();
  });

  it("leaves existing auth tables intact", async () => {
    const client = requirePrisma();

    const [userCount, adminCount, sessionCount] = await Promise.all([
      client.user.count(),
      client.admin.count(),
      client.session.count(),
    ]);

    expect(userCount).toBeGreaterThanOrEqual(0);
    expect(adminCount).toBeGreaterThanOrEqual(0);
    expect(sessionCount).toBeGreaterThanOrEqual(0);

    await client.footage.create({
      data: {
        titleFa: "بررسی جداول احراز هویت",
        slug: testSlug("auth-intact"),
        descriptionFa: "درج فووتیج نباید جداول auth را خراب کند",
        priceToman: 120_000,
        status: "DRAFT",
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
