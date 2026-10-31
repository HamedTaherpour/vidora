import { describe, expect, it } from "vitest";

import {
  formatSearchPriceRange,
  getSearchSliderValues,
  removeSearchFilter,
} from "./search.utils";

const query = {
  query: "طبیعت",
  category: "nature",
  minPrice: 220000,
  maxPrice: 450000,
  duration: "short" as const,
  sort: "price-desc" as const,
  page: 3,
};

describe("Search view behavior", () => {
  it("clamps malformed slider state and orders crossing values", () => {
    expect(
      getSearchSliderValues(
        { ...query, minPrice: 600000, maxPrice: 100000 },
        { min: 220000, max: 450000, step: 5000 },
      ),
    ).toEqual([220000, 450000]);
  });

  it("formats a localized logical price badge", () => {
    expect(formatSearchPriceRange(query)).toBe(
      "قیمت: ۲۲۰٬۰۰۰ تومان تا ۴۵۰٬۰۰۰ تومان",
    );
  });

  it("removes only one selection and resets pagination", () => {
    expect(removeSearchFilter(query, "category")).toEqual({
      ...query,
      category: "",
      page: 1,
    });
    expect(removeSearchFilter(query, "minPrice")).toEqual({
      ...query,
      minPrice: undefined,
      maxPrice: undefined,
      page: 1,
    });
  });
});
