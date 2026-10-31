import { describe, expect, it } from "vitest";

import { publicFootageFixtures } from "@/modules/ui-mock/fixtures/public-footage";
import {
  filterPublicFootage,
  normalizePublicCategory,
  parsePublicBrowseQuery,
} from "@/modules/footage/public/catalog/filter-public-footage";

describe("filterPublicFootage", () => {
  it("matches Persian title text and category together", () => {
    expect(
      filterPublicFootage(publicFootageFixtures, {
        query: "بارانی",
        category: "urban",
      }).map((item) => item.id),
    ).toEqual(["ftg-public-002"]);
  });

  it("returns no matches for unknown text or category values", () => {
    expect(
      filterPublicFootage(publicFootageFixtures, {
        query: "وجود ندارد",
        category: "",
      }),
    ).toEqual([]);
    expect(
      filterPublicFootage(publicFootageFixtures, {
        query: "",
        category: "unknown",
      }),
    ).toEqual([]);
  });

  it("treats an empty query as the initial catalog", () => {
    expect(
      filterPublicFootage(publicFootageFixtures, {
        query: "   ",
        category: "",
      }),
    ).toHaveLength(8);
  });

  it("trims URL-owned query values", () => {
    expect(
      parsePublicBrowseQuery({ q: "  تهران ", category: "urban" }),
    ).toEqual({
      query: "تهران",
      category: "urban",
    });
    expect(parsePublicBrowseQuery({ q: "", category: "invalid" })).toEqual({
      query: "",
      category: "invalid",
    });
  });

  it("normalizes invalid category values before filtering", () => {
    const categories = [{ value: "nature" }, { value: "urban" }];

    expect(normalizePublicCategory("urban", categories)).toBe("urban");
    expect(normalizePublicCategory("private", categories)).toBe("");
  });
});
