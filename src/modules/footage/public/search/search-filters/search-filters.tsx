"use client";

import { ChevronDown, SlidersHorizontal } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Combobox } from "@/components/ui/combobox";
import { SearchInput } from "@/components/ui/search-input";
import { RangeSlider } from "@/components/ui/range-slider";
import { faNumber } from "@/lib/utils";
import { getSearchPriceInputValues } from "../search.utils";
import {
  searchDurationLabels,
  searchSortLabels,
} from "./search-filters.constants";
import type { SearchFiltersProps } from "./search-filters.types";

export function SearchFilters(props: SearchFiltersProps) {
  const { categories, priceBounds, query, mobile = false, onClose } = props;
  const {
    searchDraft,
    setSearchDraft,
    priceDraft,
    setPriceDraft,
    replaceDiscoveryState,
  } = props;

  const [priceInputDrafts, setPriceInputDrafts] = useState<[string, string]>([
    faNumber(priceDraft[0]),
    faNumber(priceDraft[1]),
  ]);
  const skipPriceInputSyncRef = useRef(false);
  useEffect(() => {
    if (skipPriceInputSyncRef.current) {
      skipPriceInputSyncRef.current = false;
      return;
    }
    setPriceInputDrafts([faNumber(priceDraft[0]), faNumber(priceDraft[1])]);
  }, [priceDraft]);

  const categoryLabels = categories.map((category) => category.nameFa);
  const selectedCategory = categories.find(
    (category) => category.slug === query.category,
  )?.nameFa;
  const normalizeDigits = (value: string) =>
    value.replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)));
  const updatePriceInput = (index: 0 | 1, value: string) => {
    const normalized = normalizeDigits(value).replace(/\D/g, "");
    const nextDrafts = [...priceInputDrafts] as [string, string];
    nextDrafts[index] = value;
    setPriceInputDrafts(nextDrafts);
    if (!normalized) return;
    const next = [...priceDraft] as [number, number];
    skipPriceInputSyncRef.current = true;
    next[index] = Math.min(
      priceBounds.max,
      Math.max(priceBounds.min, Number(normalized)),
    );
    if (index === 0) next[0] = Math.min(next[0], next[1]);
    else next[1] = Math.max(next[1], next[0]);
    setPriceDraft(next);
  };
  const commitPriceInput = (index: 0 | 1, currentValue: string) => {
    const next = getSearchPriceInputValues(
      priceInputDrafts,
      priceDraft,
      priceBounds,
      index,
      currentValue,
    );
    setPriceDraft(next);
    setPriceInputDrafts([faNumber(next[0]), faNumber(next[1])]);
    replaceDiscoveryState({
      minPrice: next[0] <= priceBounds.min ? undefined : next[0],
      maxPrice: next[1] >= priceBounds.max ? undefined : next[1],
    });
  };

  const renderSelect = (
    id: string,
    value: string,
    onChange: (value: string) => void,
    options: Record<string, string>,
  ) => (
    <div className="relative">
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-12 w-full appearance-none rounded-field border-line-field border-input bg-field px-3 ps-10 text-base text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {Object.entries(options).map(([optionValue, label]) => (
          <option key={optionValue} value={optionValue}>
            {label}
          </option>
        ))}
      </select>
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
      />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <SlidersHorizontal aria-hidden="true" className="size-4 text-brand" />
          <h2 className="font-semibold">فیلترها</h2>
        </div>
        {mobile && (
          <button
            type="button"
            onClick={onClose}
            className="min-h-11 rounded-control px-3 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            بستن
          </button>
        )}
      </div>
      <label
        htmlFor={mobile ? "mobile-search" : "catalog-search"}
        className="block space-y-2"
      >
        <span className="text-sm font-medium">جست‌وجو</span>
        <SearchInput
          id={mobile ? "mobile-search" : "catalog-search"}
          value={searchDraft}
          onChange={setSearchDraft}
          onSearch={(value) => replaceDiscoveryState({ query: value })}
          debounce={400}
          placeholder="مثلاً طبیعت یا شهر…"
        />
      </label>
      <label
        htmlFor={mobile ? "mobile-category" : "catalog-category"}
        className="block space-y-2"
      >
        <span className="text-sm font-medium">دسته‌بندی</span>
        <Combobox
          key={selectedCategory ?? "all-categories"}
          id={mobile ? "mobile-category" : "catalog-category"}
          options={categoryLabels}
          value={selectedCategory ?? ""}
          onChange={(label) =>
            replaceDiscoveryState({
              category:
                categories.find((category) => category.nameFa === label)
                  ?.slug ?? "",
            })
          }
          strict
          placeholder="همهٔ دسته‌بندی‌ها"
          emptyText="دسته‌بندی‌ای پیدا نشد"
          aria-label="جست‌وجوی دسته‌بندی"
        />
      </label>
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-medium">بازهٔ قیمت</span>
          <span className="text-xs text-muted-foreground">تومان</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {([0, 1] as const).map((index) => {
            const label = index === 0 ? "حداقل" : "حداکثر";
            return (
              <label key={label} className="space-y-2">
                <span className="text-xs text-muted-foreground">{label}</span>
                <input
                  inputMode="numeric"
                  aria-label={`${label} قیمت`}
                  value={priceInputDrafts[index]}
                  onChange={(event) =>
                    updatePriceInput(index, event.target.value)
                  }
                  onBlur={(event) =>
                    commitPriceInput(index, event.currentTarget.value)
                  }
                  className="min-h-11 w-full rounded-field border-line-field border-input bg-field px-3 text-base tabular-nums text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </label>
            );
          })}
        </div>
      </div>
      <RangeSlider
        value={priceDraft}
        min={priceBounds.min}
        max={priceBounds.max}
        step={priceBounds.step}
        label="بازهٔ قیمت"
        onChange={setPriceDraft}
        onCommit={(value) =>
          replaceDiscoveryState({
            minPrice: value[0] <= priceBounds.min ? undefined : value[0],
            maxPrice: value[1] >= priceBounds.max ? undefined : value[1],
          })
        }
      />
      <label
        htmlFor={mobile ? "mobile-duration" : "catalog-duration"}
        className="block space-y-2"
      >
        <span className="text-sm font-medium">مدت فوتیج</span>
        {renderSelect(
          mobile ? "mobile-duration" : "catalog-duration",
          query.duration,
          (value) =>
            replaceDiscoveryState({
              duration: value as typeof query.duration,
            }),
          searchDurationLabels,
        )}
      </label>
      <label
        htmlFor={mobile ? "mobile-sort" : "catalog-sort"}
        className="block space-y-2"
      >
        <span className="text-sm font-medium">مرتب‌سازی</span>
        {renderSelect(
          mobile ? "mobile-sort" : "catalog-sort",
          query.sort,
          (value) =>
            replaceDiscoveryState({
              sort: value as typeof query.sort,
            }),
          searchSortLabels,
        )}
      </label>
    </div>
  );
}
