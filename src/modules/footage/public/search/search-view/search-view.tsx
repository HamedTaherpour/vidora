"use client";

import { SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { FootageCard } from "@/modules/footage/public/components/footage-card/footage-card";
import { SearchActiveFilters } from "../search-active-filters/search-active-filters";
import { SearchEmptyResults } from "../search-empty-results";
import { SearchFilters } from "../search-filters/search-filters";
import type { SearchFilterHandlers } from "../search-filters/search-filters.types";
import { SearchPagination } from "../search-pagination/search-pagination";
import type { SearchViewProps } from "./search-view.types";
import { SearchFilterSidebar } from "../search-filter-sidebar/search-filter-sidebar";
import { useSearchState } from "../use-search-state/use-search-state";

export function SearchView(props: SearchViewProps) {
  const { query, categories, priceBounds, footage, filteredCount, totalPages } =
    props;
  const {
    activeFilterCount,
    handleFilterSubmit,
    handlePriceCommit,
    handlePriceReset,
    handleRemoveFilter,
    mobileFiltersOpen,
    priceDraft,
    replaceDiscoveryState,
    setMobileFiltersOpen,
    setPriceDraft,
    setSearchDraft,
  } = useSearchState({ query, priceBounds });
  const filterHandlers: SearchFilterHandlers = {
    onSearchChange: setSearchDraft,
    onCategoryChange: (value) =>
      replaceDiscoveryState({ category: value === "all" ? "" : value }),
    onPriceChange: setPriceDraft,
    onPriceCommit: handlePriceCommit,
    onPriceReset: handlePriceReset,
    onDurationChange: (value) => replaceDiscoveryState({ duration: value }),
    onSortChange: (value) => replaceDiscoveryState({ sort: value }),
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container-storefront py-4 md:py-6">
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <section className="min-w-0" aria-label="نتایج فوتیج">
            <div className="mb-4 grid min-h-10 grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
              <div className="min-w-0">
                <SearchActiveFilters
                  query={query}
                  categories={categories}
                  onRemove={handleRemoveFilter}
                />
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <p className="text-sm text-muted-foreground">
                  {filteredCount.toLocaleString("fa-IR")} نتیجه
                </p>
                <Sheet
                  open={mobileFiltersOpen}
                  onOpenChange={setMobileFiltersOpen}
                >
                  <SheetTrigger
                    render={<Button variant="outline" className="lg:hidden" />}
                  >
                    <SlidersHorizontal
                      data-icon="inline-start"
                      aria-hidden="true"
                    />
                    فیلترها
                    {activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
                  </SheetTrigger>
                  <SheetContent
                    side="right"
                    className="w-[min(24rem,90vw)] overflow-y-auto"
                  >
                    <SheetHeader>
                      <SheetTitle>فیلترهای فوتیج</SheetTitle>
                      <SheetDescription>
                        نتایج را با اطلاعات موجود در کاتالوگ محدود کن.
                      </SheetDescription>
                    </SheetHeader>
                    <SearchFilters
                      query={query}
                      categories={categories}
                      priceBounds={priceBounds}
                      priceValue={priceDraft}
                      onSubmit={handleFilterSubmit}
                      idPrefix="mobile-search"
                      className="flex flex-col gap-6 px-4"
                      {...filterHandlers}
                    />
                    <SheetFooter>
                      <SheetClose render={<Button variant="outline" />}>
                        <X data-icon="inline-start" aria-hidden="true" />
                        بستن
                      </SheetClose>
                    </SheetFooter>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
            {footage.length === 0 ? (
              <SearchEmptyResults />
            ) : (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                {footage.map((item) => (
                  <FootageCard key={item.id} footage={item} />
                ))}
              </div>
            )}
            <SearchPagination query={query} totalPages={totalPages} />
          </section>
          <SearchFilterSidebar
            query={query}
            categories={categories}
            priceBounds={priceBounds}
            priceValue={priceDraft}
            idPrefix="desktop-search"
            onSubmit={handleFilterSubmit}
            {...filterHandlers}
          />
        </div>
      </main>
    </div>
  );
}
