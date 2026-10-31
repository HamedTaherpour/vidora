import { describe, expect, it, vi } from "vitest";

const permanentRedirect = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({ permanentRedirect }));

import LegacyFootagePage from "./page";

describe("legacy footage browse route", () => {
  it("permanently redirects supported query parameters to search", async () => {
    await LegacyFootagePage({
      searchParams: Promise.resolve({
        q: "تهران",
        category: "urban",
        sort: "price-desc",
        unsupported: "ignored",
      }),
    });

    expect(permanentRedirect).toHaveBeenCalledWith(
      "/search?q=%D8%AA%D9%87%D8%B1%D8%A7%D9%86&category=urban&sort=price-desc",
    );
  });

  it("redirects the empty legacy route without a query string", async () => {
    await LegacyFootagePage({ searchParams: Promise.resolve({}) });

    expect(permanentRedirect).toHaveBeenCalledWith("/search");
  });
});
