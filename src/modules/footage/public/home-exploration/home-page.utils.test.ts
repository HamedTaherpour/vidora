import { describe, expect, it } from "vitest";
import {
  createHomeCategoryMenuItems,
  createHomeCategoryHref,
  createHomePageHref,
  createHomeSearchHref,
} from "./home-page.utils";

describe("homepage navigation helpers", () => {
  it("preserves the hero query using the search route contract", () => {
    expect(createHomeSearchHref("  خیابان بارانی  ")).toBe(
      "/search?q=%D8%AE%DB%8C%D8%A7%D8%A8%D8%A7%D9%86+%D8%A8%D8%A7%D8%B1%D8%A7%D9%86%DB%8C",
    );
  });

  it("keeps pagination in the homepage URL", () => {
    expect(createHomePageHref(2)).toBe("/?page=2");
    expect(createHomePageHref(1)).toBe("/");
  });

  it("routes category discovery to search", () => {
    expect(createHomeCategoryHref("شهر")).toBe(
      "/search?category=%D8%B4%D9%87%D8%B1",
    );
  });

  it("builds category menu links from the real flat category list", () => {
    expect(
      createHomeCategoryMenuItems([
        { slug: "nature", nameFa: "طبیعت", count: 3 },
      ]),
    ).toEqual([
      {
        slug: "nature",
        nameFa: "طبیعت",
        count: 3,
        href: "/search?category=nature",
      },
    ]);
    expect(createHomeCategoryMenuItems([])).toEqual([]);
  });
});
