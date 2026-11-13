import { describe, expect, it } from "vitest";
import { getPublicFootageDetail } from "./get-public-footage-detail";
import type { PublicFootageDetailStore } from "./public-footage-detail-store";

const fixtureStore: PublicFootageDetailStore = {
  findPublishedFootageBySlug: async () => null,
};

describe("getPublicFootageDetail", () => {
  it("uses deterministic development fixtures only in development", async () => {
    const result = await getPublicFootageDetail({
      slug: "development-footage-1",
      store: fixtureStore,
      nodeEnv: "development",
    });

    expect(result?.dataSource).toBe("development-fixture");
    expect(result?.qualities.map((quality) => quality.label)).toEqual([
      "۱۰۸۰p",
      "۴K",
    ]);
  });

  it("does not expose fixture-only detail in production", async () => {
    await expect(
      getPublicFootageDetail({
        slug: "development-footage-1",
        store: fixtureStore,
        nodeEnv: "production",
      }),
    ).resolves.toBeNull();
  });

  it("preserves unavailable optional metadata without inventing values", async () => {
    const store: PublicFootageDetailStore = {
      findPublishedFootageBySlug: async () => ({
        id: "published-1",
        slug: "published-1",
        titleFa: "فوتیج منتشرشده",
        descriptionFa: "توضیح واقعی",
        priceToman: 100_000,
        category: { slug: "nature", nameFa: "طبیعت" },
        tags: [],
        cover: { status: "ready", src: "/api/cover", altFa: "فوتیج" },
        preview: { status: "unavailable" },
        technical: {},
        qualities: [],
        dataSource: "catalog",
      }),
    };

    const result = await getPublicFootageDetail({ slug: "published-1", store });
    expect(result?.descriptionFa).toBe("توضیح واقعی");
    expect(result?.technical).toEqual({});
    expect(result?.qualities).toEqual([]);
  });
});
