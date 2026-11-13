import { describe, expect, it } from "vitest";
import { listHomepageFootage } from "./list-homepage-footage";
import type {
  PublicFootageCatalogItem,
  PublicFootageCatalogStore,
} from "./public-footage-catalog-store";

function createStore(
  items: PublicFootageCatalogItem[],
): PublicFootageCatalogStore {
  return { listPublishedFootage: async () => items };
}

describe("listHomepageFootage", () => {
  it("uses development fixtures only for an empty development catalogue", async () => {
    const result = await listHomepageFootage({
      store: createStore([]),
      nodeEnv: "development",
    });
    expect(result.source).toBe("development-fixtures");
    expect(result.items).toHaveLength(15);
  });

  it("keeps staging and test catalogues empty instead of loading fixtures", async () => {
    for (const nodeEnv of ["test", "staging", undefined]) {
      await expect(
        listHomepageFootage({ store: createStore([]), nodeEnv }),
      ).resolves.toEqual({ source: "catalog", items: [] });
    }
  });

  it("keeps production empty when the published catalogue is empty", async () => {
    const result = await listHomepageFootage({
      store: createStore([]),
      nodeEnv: "production",
    });
    expect(result).toEqual({ source: "catalog", items: [] });
  });

  it("never replaces real catalogue data with fixtures", async () => {
    const item: PublicFootageCatalogItem = {
      id: "real",
      slug: "real",
      titleFa: "واقعی",
      priceToman: 100_000,
      category: { slug: "urban", nameFa: "شهر" },
      cover: { status: "unavailable", altFa: "واقعی" },
      preview: { status: "unavailable" },
    };
    const result = await listHomepageFootage({
      store: createStore([item]),
      nodeEnv: "development",
    });
    expect(result).toEqual({ source: "catalog", items: [item] });
  });
});
