import { Filter } from "lucide-react";

import { Card } from "@/components/ui/card";

import { SearchFilters } from "../search-filters/search-filters";
import type { SearchFilterSidebarProps } from "./search-filter-sidebar.types";

export function SearchFilterSidebar(props: SearchFilterSidebarProps) {
  const {
    query,
    categories,
    priceBounds,
    priceValue,
    idPrefix,
    onSubmit,
    ...handlers
  } = props;

  return (
    <aside
      className="sticky top-6 hidden max-h-[calc(100vh-2rem)] overflow-y-auto lg:block"
      aria-label="فیلترهای فوتیج"
    >
      <Card className="rounded-2xl border p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Filter data-icon="inline-start" aria-hidden="true" />
          <h2 className="font-semibold">فیلترها</h2>
        </div>
        <SearchFilters
          query={query}
          categories={categories}
          priceBounds={priceBounds}
          priceValue={priceValue}
          onSubmit={onSubmit}
          idPrefix={idPrefix}
          className="flex flex-col gap-6"
          {...handlers}
        />
      </Card>
    </aside>
  );
}
