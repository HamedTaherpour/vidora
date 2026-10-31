import type { PublicFootageCatalogItem } from "@/modules/footage/public/catalog/public-footage-catalog-store";

export const EXPLORER_SORTS = [
  "relevance",
  "price-asc",
  "price-desc",
  "duration-asc",
  "duration-desc",
] as const;

export type ExplorerSort = (typeof EXPLORER_SORTS)[number];

export type FootageExplorerQuery = {
  query: string;
  category: string;
  minPrice?: number;
  maxPrice?: number;
  duration: "all" | "short" | "medium" | "long";
  sort: ExplorerSort;
  page: number;
};

export type FootageExplorerResult = {
  items: PublicFootageCatalogItem[];
  filteredCount: number;
  page: number;
  totalPages: number;
};

export const EXPLORER_PAGE_SIZE = 12;

const DURATION_OPTIONS = ["all", "short", "medium", "long"] as const;

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function parseNonNegativeInteger(value: string | undefined) {
  if (!value || !/^\d+$/.test(value)) return undefined;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) ? parsed : undefined;
}

function normalizePersianText(value: string) {
  return value
    .replace(/[يى]/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/[\u064B-\u065F\u0670]/g, "")
    .replace(/[\u200C\u200E\u200F]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLocaleLowerCase("fa-IR");
}

function normalizePage(value: string | undefined) {
  const parsed = Number.parseInt(value ?? "1", 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
}

function normalizeSort(value: string | undefined): ExplorerSort {
  return EXPLORER_SORTS.includes(value as ExplorerSort)
    ? (value as ExplorerSort)
    : "relevance";
}

function normalizeDuration(
  value: string | undefined,
): FootageExplorerQuery["duration"] {
  return DURATION_OPTIONS.includes(value as FootageExplorerQuery["duration"])
    ? (value as FootageExplorerQuery["duration"])
    : "all";
}

export function parseFootageExplorerQuery(
  params: Record<string, string | string[] | undefined>,
  categories: ReadonlyArray<{ value: string }>,
): FootageExplorerQuery {
  const category = firstValue(params.category);
  const minPrice = parseNonNegativeInteger(firstValue(params.minPrice));
  const maxPrice = parseNonNegativeInteger(firstValue(params.maxPrice));

  return {
    query: normalizePersianText(firstValue(params.q) ?? ""),
    category:
      category && categories.some((option) => option.value === category)
        ? category
        : "",
    minPrice,
    maxPrice,
    duration: normalizeDuration(firstValue(params.duration)),
    sort: normalizeSort(firstValue(params.sort)),
    page: normalizePage(firstValue(params.page)),
  };
}

function matchesDuration(
  seconds: number | undefined,
  duration: FootageExplorerQuery["duration"],
) {
  if (duration === "all") return true;
  if (seconds === undefined) return false;
  if (duration === "short") return seconds <= 30;
  if (duration === "medium") return seconds > 30 && seconds <= 60;
  return seconds > 60;
}

function compareFootage(
  first: PublicFootageCatalogItem,
  second: PublicFootageCatalogItem,
  sort: ExplorerSort,
) {
  if (sort === "price-asc") return first.priceToman - second.priceToman;
  if (sort === "price-desc") return second.priceToman - first.priceToman;
  if (sort === "duration-asc") {
    return (first.durationSeconds ?? 0) - (second.durationSeconds ?? 0);
  }
  if (sort === "duration-desc") {
    return (second.durationSeconds ?? 0) - (first.durationSeconds ?? 0);
  }
  return 0;
}

export function discoverPublicFootage(
  footage: ReadonlyArray<PublicFootageCatalogItem>,
  query: FootageExplorerQuery,
): FootageExplorerResult {
  const normalizedQuery = normalizePersianText(query.query);
  const filtered = footage.filter((item) => {
    const searchableText = normalizePersianText(
      [item.titleFa, item.category.nameFa, item.slug].join(" "),
    );
    return (
      (!normalizedQuery || searchableText.includes(normalizedQuery)) &&
      (!query.category || item.category.slug === query.category) &&
      (query.minPrice === undefined || item.priceToman >= query.minPrice) &&
      (query.maxPrice === undefined || item.priceToman <= query.maxPrice) &&
      matchesDuration(item.durationSeconds, query.duration)
    );
  });

  const sorted = [...filtered].sort((first, second) =>
    compareFootage(first, second, query.sort),
  );
  const totalPages = Math.max(1, Math.ceil(sorted.length / EXPLORER_PAGE_SIZE));
  const page = Math.min(query.page, totalPages);

  return {
    items: sorted.slice(
      (page - 1) * EXPLORER_PAGE_SIZE,
      page * EXPLORER_PAGE_SIZE,
    ),
    filteredCount: sorted.length,
    page,
    totalPages,
  };
}

export function serializeFootageExplorerQuery(query: FootageExplorerQuery) {
  const params = new URLSearchParams();
  if (query.query) params.set("q", query.query);
  if (query.category) params.set("category", query.category);
  if (query.minPrice !== undefined)
    params.set("minPrice", String(query.minPrice));
  if (query.maxPrice !== undefined)
    params.set("maxPrice", String(query.maxPrice));
  if (query.duration !== "all") params.set("duration", query.duration);
  if (query.sort !== "relevance") params.set("sort", query.sort);
  if (query.page > 1) params.set("page", String(query.page));
  return params.toString();
}

export function createFootageExplorerHref(
  query: FootageExplorerQuery,
  overrides: Partial<FootageExplorerQuery> = {},
) {
  const nextQuery = { ...query, ...overrides };
  const serialized = serializeFootageExplorerQuery(nextQuery);
  return serialized ? `?${serialized}` : "";
}

export function hasActiveExplorerFilters(query: FootageExplorerQuery) {
  return Boolean(
    query.query ||
    query.category ||
    query.minPrice !== undefined ||
    query.maxPrice !== undefined ||
    query.duration !== "all",
  );
}

export function getExplorerActiveFilterCount(query: FootageExplorerQuery) {
  return [
    query.query,
    query.category,
    query.minPrice !== undefined || query.maxPrice !== undefined,
    query.duration !== "all",
  ].filter(Boolean).length;
}
