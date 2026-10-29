import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import type { PrismaClient } from "@/generated/prisma/client";
import { createPrismaPublicFootageCatalogStore } from "@/modules/footage/public/catalog/prisma-public-footage-catalog-store";

describe("Prisma public footage catalog boundary", () => {
  it("queries only published footage and maps ready preview availability", async () => {
    const findMany = vi.fn().mockResolvedValue([
      {
        id: "footage-1",
        slug: "nature-1",
        titleFa: "طبیعت",
        priceToman: 120_000,
        category: { slug: "nature", nameFa: "طبیعت" },
        cover: { id: "cover-1" },
        footageFiles: [{ id: "preview-1" }],
      },
      {
        id: "footage-2",
        slug: "without-preview",
        titleFa: "بدون پیش‌نمایش",
        priceToman: 0,
        category: { slug: "nature", nameFa: "طبیعت" },
        cover: { id: "cover-2" },
        footageFiles: [],
      },
    ]);
    const client = { footage: { findMany } } as unknown as PrismaClient;

    const result =
      await createPrismaPublicFootageCatalogStore(
        client,
      ).listPublishedFootage();

    expect(result).toEqual([
      {
        id: "footage-1",
        slug: "nature-1",
        titleFa: "طبیعت",
        priceToman: 120_000,
        category: { slug: "nature", nameFa: "طبیعت" },
        cover: {
          status: "ready",
          src: "/api/footage/footage-1/cover",
          altFa: "طبیعت",
        },
        preview: { status: "ready" },
      },
      {
        id: "footage-2",
        slug: "without-preview",
        titleFa: "بدون پیش‌نمایش",
        priceToman: 0,
        category: { slug: "nature", nameFa: "طبیعت" },
        cover: {
          status: "ready",
          src: "/api/footage/footage-2/cover",
          altFa: "بدون پیش‌نمایش",
        },
        preview: { status: "unavailable" },
      },
    ]);

    expect(findMany).toHaveBeenCalledWith({
      where: { status: "PUBLISHED", cover: { isNot: null } },
      orderBy: [{ publishedAt: "desc" }, { id: "desc" }],
      select: {
        id: true,
        slug: true,
        titleFa: true,
        priceToman: true,
        category: { select: { slug: true, nameFa: true } },
        cover: { select: { id: true } },
        footageFiles: {
          where: { kind: "PREVIEW", uploadStatus: "READY" },
          take: 1,
          select: { id: true },
        },
      },
    });
  });
});
