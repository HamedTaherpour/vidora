import { describe, expect, it } from "vitest";

import {
  formatFootageExplorerPriceRange,
  getFootageExplorerSliderValues,
  removeFootageExplorerFilter,
} from "./footage-explorer-view.utils";

const query = {
  query: "طبیعت",
  category: "nature",
  minPrice: 220000,
  maxPrice: 450000,
  duration: "short" as const,
  sort: "price-desc" as const,
  page: 3,
};

describe("Footage Explorer view behavior", () => {
  it("clamps malformed slider state and orders crossing values", () => {
    expect(
      getFootageExplorerSliderValues(
        { ...query, minPrice: 600000, maxPrice: 100000 },
        { min: 220000, max: 450000, step: 5000 },
      ),
    ).toEqual([220000, 450000]);
  });

  it("formats a localized logical price badge", () => {
    expect(formatFootageExplorerPriceRange(query)).toBe(
      "قیمت: ۲۲۰٬۰۰۰ تومان تا ۴۵۰٬۰۰۰ تومان",
    );
  });

  it("removes only one selection and resets pagination", () => {
    expect(removeFootageExplorerFilter(query, "category")).toEqual({
      ...query,
      category: "",
      page: 1,
    });
    expect(removeFootageExplorerFilter(query, "minPrice")).toEqual({
      ...query,
      minPrice: undefined,
      maxPrice: undefined,
      page: 1,
    });
  });
});
