import { describe, expect, it } from "vitest";

import { publicFootageTestFixtures as publicFootageFixtures } from "@/modules/footage/public/catalog/public-footage-test-fixtures";
import {
  discoverPublicFootage,
  getFootagePriceBounds,
  getSearchActiveFilterCount,
  mergeSearchQuery,
  parseSearchQuery,
  serializeSearchQuery,
} from "./search";
import { getSearchPriceInputValues } from "./search.utils";

const categories = publicFootageFixtures
  .map((item) => ({ value: item.category.slug }))
  .filter(
    (item, index, all) =>
      all.findIndex((candidate) => candidate.value === item.value) === index,
  );

describe("Search query contract", () => {
  it("derives price bounds and a catalog-based slider step", () => {
    expect(getFootagePriceBounds(publicFootageFixtures)).toEqual({
      min: 220000,
      max: 450000,
      step: 5000,
    });
  });

  it("normalizes Persian text and rejects unsupported or invalid values", () => {
    expect(
      parseSearchQuery(
        {
          q: "  كوهستان  ",
          category: "missing",
          minPrice: "nope",
          duration: "huge",
        },
        categories,
      ),
    ).toEqual({
      query: "کوهستان",
      category: "",
      minPrice: undefined,
      maxPrice: undefined,
      duration: "all",
      sort: "relevance",
      page: 1,
    });
  });

  it("normalizes crossing price bounds into a usable range", () => {
    expect(
      parseSearchQuery({ minPrice: "450000", maxPrice: "220000" }, categories),
    ).toMatchObject({ minPrice: 220000, maxPrice: 450000 });
  });

  it("serializes deterministically and omits defaults", () => {
    expect(
      serializeSearchQuery({
        query: "تهران",
        category: "urban",
        minPrice: 250000,
        maxPrice: 500000,
        duration: "short",
        sort: "price-desc",
        page: 2,
      }),
    ).toBe(
      "q=%D8%AA%D9%87%D8%B1%D8%A7%D9%86&category=urban&minPrice=250000&maxPrice=500000&duration=short&sort=price-desc&page=2",
    );
  });

  it("merges rapid updates from the latest committed filter state", () => {
    const initial = parseSearchQuery(
      { q: "تهران", category: "urban", sort: "price-desc" },
      categories,
    );
    const withPrice = mergeSearchQuery(initial, { minPrice: 250000 });
    const withAnotherPrice = mergeSearchQuery(withPrice, { maxPrice: 300000 });

    expect(serializeSearchQuery(withAnotherPrice)).toBe(
      "q=%D8%AA%D9%87%D8%B1%D8%A7%D9%86&category=urban&minPrice=250000&maxPrice=300000&sort=price-desc",
    );
  });

  it("preserves explicit pagination updates while filters reset to page one", () => {
    const initial = parseSearchQuery({}, categories);

    expect(mergeSearchQuery(initial, { page: 3 }).page).toBe(3);
    expect(
      mergeSearchQuery({ ...initial, page: 3 }, { minPrice: 250000 }).page,
    ).toBe(1);
  });

  it("commits the latest numeric input value on blur", () => {
    expect(
      getSearchPriceInputValues(
        ["۲۵۰۰۰۰", "۴۳۰۰۰۰"],
        [250000, 430000],
        { min: 220000, max: 430000, step: 5000 },
        1,
        "۳۰۰۰۰۰",
      ),
    ).toEqual([250000, 300000]);
  });
});

describe("discoverPublicFootage", () => {
  it("composes text, category, price, duration, sorting, and pagination", () => {
    const result = discoverPublicFootage(publicFootageFixtures, {
      query: "",
      category: "nature",
      minPrice: 200000,
      maxPrice: 500000,
      duration: "short",
      sort: "price-desc",
      page: 1,
    });

    expect(result.items.every((item) => item.category.slug === "nature")).toBe(
      true,
    );
    expect(
      result.items.every((item) => (item.durationSeconds ?? 0) <= 30),
    ).toBe(true);
    expect(result.items[0]?.priceToman).toBeGreaterThanOrEqual(
      result.items[1]?.priceToman ?? 0,
    );
  });

  it("returns an empty page for unmatched text and clamps pages", () => {
    const result = discoverPublicFootage(publicFootageFixtures, {
      query: "چیزی که وجود ندارد",
      category: "",
      duration: "all",
      sort: "relevance",
      page: 99,
    });

    expect(result.items).toEqual([]);
    expect(result.page).toBe(1);
    expect(result.totalPages).toBe(1);
  });

  it("counts active filters without treating sorting as a filter", () => {
    expect(
      getSearchActiveFilterCount({
        query: "تهران",
        category: "urban",
        minPrice: undefined,
        maxPrice: 500000,
        duration: "all",
        sort: "price-asc",
        page: 1,
      }),
    ).toBe(3);
  });
});
