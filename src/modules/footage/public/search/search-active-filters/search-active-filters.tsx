import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

import type { SearchActiveFiltersProps } from "./search-active-filters.types";
import {
  searchDurationLabels,
  searchSortLabels,
} from "../search-filters/search-filters.constants";
import {
  formatSearchPriceRange,
  hasActiveSearchSelections,
} from "../search.utils";

export function SearchActiveFilters(props: SearchActiveFiltersProps) {
  const { query, categories, onRemove } = props;

  if (!hasActiveSearchSelections(query)) {
    return null;
  }

  const categoryLabel = categories.find(
    (item) => item.value === query.category,
  )?.labelFa;

  function renderRemovableBadge(
    filter: "query" | "category" | "minPrice" | "duration" | "sort",
    label: string,
  ) {
    return (
      <Badge
        key={filter}
        variant="secondary"
        className="min-h-9 gap-2 rounded-full px-3 py-1 pe-2 text-sm leading-6"
      >
        <span>{label}</span>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          aria-label={`حذف ${label}`}
          onClick={() => onRemove(filter)}
          className="shrink-0 rounded-full hover:bg-background/70 active:bg-background"
        >
          <X className="size-3.5" aria-hidden="true" />
        </Button>
      </Badge>
    );
  }

  return (
    <div
      className="flex flex-wrap items-center gap-2"
      aria-label="فیلترهای فعال"
    >
      {query.query && renderRemovableBadge("query", `جست‌وجو: ${query.query}`)}
      {categoryLabel &&
        renderRemovableBadge("category", `دسته‌بندی: ${categoryLabel}`)}
      {(query.minPrice !== undefined || query.maxPrice !== undefined) &&
        renderRemovableBadge("minPrice", formatSearchPriceRange(query))}
      {query.duration !== "all" &&
        renderRemovableBadge(
          "duration",
          `مدت‌زمان: ${searchDurationLabels[query.duration]}`,
        )}
      {query.sort !== "relevance" &&
        renderRemovableBadge(
          "sort",
          `مرتب‌سازی: ${searchSortLabels[query.sort]}`,
        )}
    </div>
  );
}
