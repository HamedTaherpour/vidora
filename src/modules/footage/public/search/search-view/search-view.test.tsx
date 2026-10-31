// @vitest-environment jsdom

import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { PublicFootageCatalogItem } from "@/modules/footage/public/catalog/public-footage-catalog-store";
import type { SearchQuery } from "../search";
import { SearchView } from "./search-view";

const replace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
}));

(
  globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

const categories = [
  { value: "nature", labelFa: "طبیعت" },
  { value: "urban", labelFa: "شهری" },
];

const priceBounds = { min: 220_000, max: 450_000, step: 5_000 };

const query: SearchQuery = {
  query: "",
  category: "",
  minPrice: undefined,
  maxPrice: undefined,
  duration: "all" as const,
  sort: "relevance" as const,
  page: 1,
};

const footage = [] as PublicFootageCatalogItem[];

describe("SearchView interactions", () => {
  let container!: HTMLDivElement;
  let root: Root | undefined;

  beforeEach(() => {
    vi.useFakeTimers();
    replace.mockReset();
    container = document.createElement("div");
    document.body.append(container);
  });

  afterEach(() => {
    act(() => root?.unmount());
    container.remove();
    document.body
      .querySelectorAll('[data-slot="sheet-content"]')
      .forEach((element) => element.remove());
    vi.useRealTimers();
  });

  function renderSearch(
    overrides: Partial<{
      query: typeof query;
      totalPages: number;
    }> = {},
  ) {
    root = createRoot(container);
    act(() => {
      root!.render(
        <SearchView
          query={overrides.query ?? query}
          categories={categories}
          priceBounds={priceBounds}
          footage={footage}
          filteredCount={0}
          totalPages={overrides.totalPages ?? 1}
        />,
      );
    });
    act(() => vi.runOnlyPendingTimers());
  }

  function dispatchClick(element: Element) {
    act(() => {
      element.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
  }

  function setInputValue(input: HTMLInputElement, value: string) {
    act(() => {
      const setter = Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        "value",
      )?.set;
      setter?.call(input, value);
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new Event("change", { bubbles: true }));
    });
  }

  it("debounces text search into a canonical URL replacement", () => {
    renderSearch({
      query: { ...query, page: 3 },
    });

    const input = container.querySelector<HTMLInputElement>(
      "#desktop-search-search",
    );
    expect(input).not.toBeNull();
    setInputValue(input!, "طبیعت");

    act(() => vi.advanceTimersByTime(399));
    expect(replace).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(1));

    expect(replace).toHaveBeenCalledWith("?q=%D8%B7%D8%A8%DB%8C%D8%B9%D8%AA");
  });

  it("removes an active filter and resets pagination while preserving search", () => {
    renderSearch({
      query: { ...query, query: "طبیعت", category: "nature", page: 3 },
    });

    const removeCategory = container.querySelector<HTMLButtonElement>(
      '[aria-label="حذف دسته‌بندی: طبیعت"]',
    );
    expect(removeCategory).not.toBeNull();
    dispatchClick(removeCategory!);

    expect(replace).toHaveBeenCalledWith("?q=%D8%B7%D8%A8%DB%8C%D8%B9%D8%AA");
  });

  it("commits a changed price range to URL state", () => {
    renderSearch({ query: { ...query, page: 3 } });

    const minimumInput = container.querySelector<HTMLInputElement>(
      '#desktop-search-price-range input[type="range"]',
    );
    expect(minimumInput).not.toBeNull();
    act(() => {
      const setter = Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        "value",
      )?.set;
      setter?.call(minimumInput, "225000");
      minimumInput!.dispatchEvent(new Event("input", { bubbles: true }));
      minimumInput!.dispatchEvent(new Event("change", { bubbles: true }));
    });

    expect(replace).toHaveBeenCalledTimes(1);
    expect(replace.mock.calls[0]?.[0]).toMatch(/minPrice=|maxPrice=/);
  });

  it("resets the price filter through its removal control", () => {
    renderSearch({
      query: { ...query, minPrice: 250_000, maxPrice: 400_000, page: 2 },
    });

    const removePrice = container.querySelector<HTMLButtonElement>(
      '[aria-label^="حذف قیمت:"]',
    );
    expect(removePrice).not.toBeNull();
    dispatchClick(removePrice!);

    expect(replace).toHaveBeenCalledWith("?");
  });

  it("preserves active query parameters in pagination links", () => {
    renderSearch({
      query: {
        ...query,
        query: "طبیعت",
        category: "nature",
        page: 2,
      },
      totalPages: 3,
    });

    const next = container.querySelector<HTMLAnchorElement>(
      '[aria-label="صفحه بعدی"]',
    );
    const current = container.querySelector<HTMLAnchorElement>(
      '[aria-current="page"]',
    );

    expect(next?.getAttribute("href")).toBe(
      "?q=%D8%B7%D8%A8%DB%8C%D8%B9%D8%AA&category=nature&page=3",
    );
    expect(current?.textContent).toContain("۲");
  });

  it("opens the mobile filter Sheet with an accessible filter form", () => {
    renderSearch();

    const filterTrigger = Array.from(container.querySelectorAll("button")).find(
      (button) => button.textContent?.includes("فیلترها"),
    );
    expect(filterTrigger).not.toBeUndefined();
    dispatchClick(filterTrigger!);

    expect(document.body.textContent).toContain("فیلترهای فوتیج");
    expect(document.body.querySelector("#mobile-search-search")).not.toBeNull();
  });

  it("exposes keyboard-operable active-filter removal controls", () => {
    renderSearch({ query: { ...query, category: "nature" } });

    const removeCategory = container.querySelector<HTMLButtonElement>(
      '[aria-label="حذف دسته‌بندی: طبیعت"]',
    );
    expect(removeCategory?.tagName).toBe("BUTTON");
    expect(removeCategory?.getAttribute("type")).toBe("button");
    expect(removeCategory?.getAttribute("data-slot")).toBe("button");
  });
});
