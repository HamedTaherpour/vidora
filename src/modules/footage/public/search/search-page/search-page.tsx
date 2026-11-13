"use client";

import { Filter } from "lucide-react";
import { useEffect, useRef } from "react";
import { GridBackground } from "@/components/backgrounds/grid";
import { HomeFooter } from "../../home-exploration/home-footer";
import { HomeHeader } from "../../home-exploration/home-header";
import { ActiveFilterBadges } from "../active-filter-badges/active-filter-badges";
import { SearchFilters } from "../search-filters/search-filters";
import { SearchResults } from "../search-results/search-results";
import { useSearchState } from "../use-search-state/use-search-state";
import type { SearchPageProps } from "./search-page.types";

export function SearchPage(props: SearchPageProps) {
  const { categories, dataError, fixtureMode, priceBounds, query, result } =
    props;
  const state = useSearchState({ query, priceBounds });
  const filterTriggerRef = useRef<HTMLButtonElement>(null);
  const { mobileFiltersOpen, setMobileFiltersOpen } = state;

  useEffect(() => {
    if (!mobileFiltersOpen) return;
    const trigger = filterTriggerRef.current;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileFiltersOpen(false);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", closeOnEscape);
      trigger?.focus();
    };
  }, [mobileFiltersOpen, setMobileFiltersOpen]);

  const filterProps = {
    categories,
    priceBounds,
    query,
    searchDraft: state.searchDraft,
    setSearchDraft: state.setSearchDraft,
    priceDraft: state.priceDraft,
    setPriceDraft: state.setPriceDraft,
    replaceDiscoveryState: state.replaceDiscoveryState,
  };
  const removeFilter = (
    filter: "query" | "category" | "price" | "duration" | "sort",
  ) => {
    if (filter === "price") return state.handlePriceReset();
    state.handleRemoveFilter(filter);
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <HomeHeader
        categories={categories}
        className="border-b border-border/70 bg-background/90 backdrop-blur-sm"
      />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="relative isolate mb-8 overflow-hidden rounded-surface px-1 py-1">
          <GridBackground className="-z-10 opacity-35" />
          <div className="relative max-w-3xl">
            <p className="mb-3 text-sm text-brand">کشف قاب بعدی شما</p>
            <h1 className="text-3xl font-bold leading-tight sm:text-4xl">
              جست‌وجوی فوتیج
            </h1>
            <p className="mt-3 text-muted-foreground">
              فوتیج مناسب پروژه‌تان را با جست‌وجو و فیلترهای دقیق پیدا کنید.
            </p>
          </div>
        </div>
        <div className="mb-6 flex min-h-11 flex-wrap items-center justify-between gap-4">
          <ActiveFilterBadges
            query={query}
            categories={categories}
            onRemove={removeFilter}
          />
          <button
            ref={filterTriggerRef}
            type="button"
            className="inline-flex min-h-11 items-center gap-2 rounded-control border-line border-border px-3 text-sm hover:bg-accent lg:hidden"
            onClick={() => setMobileFiltersOpen(true)}
            aria-expanded={mobileFiltersOpen}
          >
            <Filter aria-hidden="true" className="size-4" /> فیلترها{" "}
            {state.activeFilterCount ? `(${state.activeFilterCount})` : ""}
          </button>
        </div>
        <div className="grid gap-6 lg:grid-cols-[17rem_minmax(0,1fr)]">
          <aside className="hidden self-start lg:sticky lg:top-24 lg:block">
            <div className="rounded-surface border-line border-border bg-card p-5 shadow-surface">
              <SearchFilters {...filterProps} />
            </div>
          </aside>
          <section
            aria-labelledby="search-results-heading"
            aria-busy={state.isPending}
            className="min-w-0"
          >
            <h2 id="search-results-heading" className="sr-only">
              نتایج جست‌وجو
            </h2>
            <div className="relative">
              <div
                className={
                  state.isPending
                    ? "opacity-60 transition-opacity"
                    : "transition-opacity"
                }
              >
                <SearchResults
                  items={result.items}
                  query={query}
                  total={result.filteredCount}
                  totalPages={result.totalPages}
                  fixtureMode={fixtureMode}
                  dataError={dataError}
                  onPageChange={(page) => state.replaceDiscoveryState({ page })}
                />
              </div>
              {state.isPending && (
                <p
                  role="status"
                  className="pointer-events-none absolute inset-s-0 top-0 flex h-8 items-start gap-2 text-xs text-muted-foreground"
                >
                  <span className="mt-1 size-3 animate-pulse rounded-full bg-brand motion-reduce:animate-none" />
                  در حال به‌روزرسانی نتایج…
                </p>
              )}
            </div>
          </section>
        </div>
      </div>
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="presentation">
          <button
            type="button"
            aria-label="بستن فیلترها"
            className="absolute inset-0 bg-background/70"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-filter-title"
            className="absolute inset-y-0 end-0 w-[min(22rem,calc(100%-2rem))] overflow-y-auto border-s border-border bg-card p-5 shadow-overlay"
          >
            <h2 id="mobile-filter-title" className="sr-only">
              فیلترهای جست‌وجو
            </h2>
            <SearchFilters
              {...filterProps}
              mobile
              onClose={() => setMobileFiltersOpen(false)}
            />
          </aside>
        </div>
      )}
      <HomeFooter categories={categories} />
    </main>
  );
}
