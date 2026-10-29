import { describe, expect, it } from "vitest";

import {
  listPublishedFootage,
  type PublicFootageCatalogItem,
} from "@/modules/footage/public/catalog/list-published-footage";
import type { PublicFootageCatalogStore } from "@/modules/footage/public/catalog/public-footage-catalog-store";

const CATEGORY = { slug: "nature", nameFa: "طبیعت" };

function createStore(
  items: PublicFootageCatalogItem[],
): PublicFootageCatalogStore {
  return { listPublishedFootage: async () => items };
}

describe("listPublishedFootage", () => {
  it("returns the public DTO without private media fields", async () => {
    const items: PublicFootageCatalogItem[] = [
      {
        id: "footage-1",
        slug: "nature-1",
        titleFa: "طبیعت",
        priceToman: 120_000,
        category: CATEGORY,
        cover: {
          status: "ready",
          src: "/api/footage/footage-1/cover",
          altFa: "طبیعت",
        },
        preview: { status: "ready" },
      },
    ];

    const result = await listPublishedFootage({ store: createStore(items) });

    expect(result).toEqual(items);
    expect(result[0]).not.toHaveProperty("objectKey");
    expect(result[0]).not.toHaveProperty("footageFiles");
    expect(result[0]).not.toHaveProperty("originalVariants");
  });

  it("preserves an unavailable preview state", async () => {
    const result = await listPublishedFootage({
      store: createStore([
        {
          id: "footage-2",
          slug: "without-preview",
          titleFa: "بدون پیش‌نمایش",
          priceToman: 0,
          category: CATEGORY,
          cover: {
            status: "ready",
            src: "/api/footage/footage-2/cover",
            altFa: "بدون پیش‌نمایش",
          },
          preview: { status: "unavailable" },
        },
      ]),
    });

    expect(result[0]?.preview.status).toBe("unavailable");
  });
});
