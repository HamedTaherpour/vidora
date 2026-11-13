"use client";

import { X } from "lucide-react";
import { formatSearchPriceRange } from "../search.utils";
import type { ActiveFilterBadgesProps } from "./active-filter-badges.types";

export function ActiveFilterBadges(props: ActiveFilterBadgesProps) {
  const { query, categories, onRemove } = props;
  const category = categories.find((item) => item.slug === query.category);
  const badges = [
    query.query ? { key: "query" as const, label: query.query } : null,
    category ? { key: "category" as const, label: category.nameFa } : null,
    query.minPrice !== undefined || query.maxPrice !== undefined
      ? { key: "price" as const, label: formatSearchPriceRange(query) }
      : null,
    query.duration !== "all"
      ? {
          key: "duration" as const,
          label:
            query.duration === "short"
              ? "تا ۳۰ ثانیه"
              : query.duration === "medium"
                ? "۳۱ تا ۶۰ ثانیه"
                : "بیشتر از ۶۰ ثانیه",
        }
      : null,
    query.sort !== "relevance"
      ? {
          key: "sort" as const,
          label:
            query.sort === "price-asc"
              ? "ارزان‌ترین"
              : query.sort === "price-desc"
                ? "گران‌ترین"
                : query.sort === "duration-asc"
                  ? "کوتاه‌ترین مدت"
                  : "طولانی‌ترین مدت",
        }
      : null,
  ].filter(Boolean) as Array<{
    key: ActiveFilterBadgesProps["onRemove"] extends (filter: infer T) => void
      ? T
      : never;
    label: string;
  }>;

  return (
    <div
      className="flex min-h-9 min-w-0 flex-1 flex-wrap items-center gap-2"
      aria-label="فیلترهای فعال"
    >
      {badges.length ? (
        badges.map((badge) => (
          <span
            key={badge.key}
            className="inline-flex min-h-9 items-center gap-1 rounded-control border-line border-brand/40 bg-brand/10 px-2.5 text-xs text-brand"
          >
            <span className="max-w-48 truncate">{badge.label}</span>
            <button
              type="button"
              aria-label={`حذف ${badge.label}`}
              onClick={() => onRemove(badge.key)}
              className="flex size-7 items-center justify-center rounded-control hover:bg-brand/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <X aria-hidden="true" className="size-3.5" />
            </button>
          </span>
        ))
      ) : (
        <span className="text-sm text-muted-foreground">
          فیلتر فعالی وجود ندارد
        </span>
      )}
    </div>
  );
}
