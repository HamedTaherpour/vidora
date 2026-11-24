import { describe, expect, it } from "vitest";

import {
  createCustomerLibrarySearchHref,
  getCustomerLibrarySearchQuery,
} from "./customer-library-search";

describe("customer library search URL contract", () => {
  it("encodes a submitted query for the customer library", () => {
    expect(createCustomerLibrarySearchHref("  کوهستان بارانی  ")).toBe(
      "/dashboard/library?q=%DA%A9%D9%88%D9%87%D8%B3%D8%AA%D8%A7%D9%86+%D8%A8%D8%A7%D8%B1%D8%A7%D9%86%DB%8C",
    );
  });

  it("uses the library route for an empty query", () => {
    expect(createCustomerLibrarySearchHref("   ")).toBe("/dashboard/library");
  });

  it("normalizes the URL-owned query state", () => {
    expect(getCustomerLibrarySearchQuery("  کوهستان  ")).toBe("کوهستان");
    expect(getCustomerLibrarySearchQuery(["  باران  ", "نادیده"])).toBe(
      "باران",
    );
    expect(getCustomerLibrarySearchQuery(undefined)).toBe("");
  });
});
