"use client";

import { AlertCircle, Film } from "lucide-react";
import { FootageCard } from "../../home-exploration/footage-card";
import { Pagination } from "@/components/ui/pagination";
import { fa } from "@/lib/utils";
import type { SearchResultsProps } from "./search-results.types";

export function SearchResults(props: SearchResultsProps) {
  const {
    items,
    total,
    totalPages,
    query,
    fixtureMode,
    dataError,
    onPageChange,
  } = props;
  if (dataError) {
    return (
      <div
        role="alert"
        className="rounded-surface border-line border-destructive/40 bg-destructive/10 p-8 text-center"
      >
        <AlertCircle className="mx-auto mb-3 size-8 text-destructive" />
        <p>بارگذاری کاتالوگ با مشکل روبه‌رو شد. دوباره تلاش کنید.</p>
      </div>
    );
  }
  if (!items.length) {
    return (
      <div className="rounded-surface border-line border-border bg-card p-10 text-center">
        <Film className="mx-auto mb-4 size-10 text-muted-foreground" />
        <h2 className="text-lg font-semibold">فوتیجی با این مشخصات پیدا نشد</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          عبارت جست‌وجو یا فیلترها را تغییر دهید.
        </p>
      </div>
    );
  }
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
        <span aria-live="polite">{fa(total)} فوتیج پیدا شد</span>
        {fixtureMode && (
          <span className="rounded-control border-line border-border px-2 py-1 text-xs">
            نمایش نمونهٔ توسعه
          </span>
        )}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <FootageCard
            key={item.id}
            item={item}
            developmentOnly={fixtureMode}
          />
        ))}
      </div>
      <Pagination
        page={query.page}
        total={totalPages}
        onChange={onPageChange}
      />
    </div>
  );
}
