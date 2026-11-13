import { formatTomanDisplay } from "@/modules/footage/format-toman-display";
import type { FootagePriceBounds, SearchQuery } from "./search";
import { hasActiveSearchFilters } from "./search";

/** Returns whether a query contains any visible active filter selection. */
export function hasActiveSearchSelections(query: SearchQuery) {
  return hasActiveSearchFilters(query) || query.sort !== "relevance";
}

/** Clamps and orders URL price values for the local dual-thumb slider. */
export function getSearchSliderValues(
  query: SearchQuery,
  priceBounds: FootagePriceBounds,
): [number, number] {
  const minimum = Math.min(
    priceBounds.max,
    Math.max(priceBounds.min, query.minPrice ?? priceBounds.min),
  );
  const maximum = Math.min(
    priceBounds.max,
    Math.max(priceBounds.min, query.maxPrice ?? priceBounds.max),
  );
  return minimum <= maximum ? [minimum, maximum] : [maximum, minimum];
}

/** Converts the current numeric price fields into one ordered slider range. */
export function getSearchPriceInputValues(
  inputDrafts: [string, string],
  fallback: [number, number],
  priceBounds: FootagePriceBounds,
  editedIndex?: 0 | 1,
  editedValue?: string,
): [number, number] {
  const drafts = [...inputDrafts] as [string, string];
  if (editedIndex !== undefined && editedValue !== undefined)
    drafts[editedIndex] = editedValue;
  const values = drafts.map((draft, index) => {
    const normalized = draft
      .replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)))
      .replace(/\D/g, "");
    const value = normalized ? Number(normalized) : fallback[index];
    return Math.min(priceBounds.max, Math.max(priceBounds.min, value));
  }) as [number, number];
  return [Math.min(values[0], values[1]), Math.max(values[0], values[1])];
}

/** Formats the visible Persian label for one logical price-range badge. */
export function formatSearchPriceRange(query: SearchQuery) {
  const minimum = query.minPrice;
  const maximum = query.maxPrice;
  if (minimum !== undefined && maximum !== undefined)
    return `قیمت: ${formatTomanDisplay(minimum)} تا ${formatTomanDisplay(maximum)}`;
  if (minimum !== undefined) return `قیمت: از ${formatTomanDisplay(minimum)}`;
  return `قیمت: تا ${formatTomanDisplay(maximum ?? 0)}`;
}

/** Removes one active selection while preserving every unrelated URL filter. */
export function removeSearchFilter(
  query: SearchQuery,
  filter: "query" | "category" | "minPrice" | "duration" | "sort",
): SearchQuery {
  if (filter === "query") return { ...query, query: "", page: 1 };
  if (filter === "category") return { ...query, category: "", page: 1 };
  if (filter === "minPrice")
    return { ...query, minPrice: undefined, maxPrice: undefined, page: 1 };
  if (filter === "duration") return { ...query, duration: "all", page: 1 };
  return { ...query, sort: "relevance", page: 1 };
}
