"use client";

import {
  ArrowDownUp,
  Clock3,
  Filter,
  LayoutGrid,
  Search,
  SlidersHorizontal,
  Wallet,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FootageCard } from "@/modules/footage/public/components/footage-card/footage-card";
import { formatTomanDisplay } from "@/modules/footage/format-toman-display";
import { Slider } from "@/components/ui/slider";
import {
  createFootageExplorerHref,
  EXPLORER_SORTS,
  getExplorerActiveFilterCount,
  hasActiveExplorerFilters,
  serializeFootageExplorerQuery,
  type FootagePriceBounds,
  type FootageExplorerQuery,
  type ExplorerSort,
} from "./footage-explorer";
import type { PublicFootageCategoryOption } from "@/modules/footage/public/catalog/public-footage-catalog-store";
import type { PublicFootageCatalogItem } from "@/modules/footage/public/catalog/public-footage-catalog-store";

export type FootageExplorerVariant = "classic" | "modern" | "minimal";

type FootageExplorerViewProps = {
  variant: FootageExplorerVariant;
  query: FootageExplorerQuery;
  categories: PublicFootageCategoryOption[];
  priceBounds: FootagePriceBounds;
  footage: PublicFootageCatalogItem[];
  filteredCount: number;
  totalPages: number;
};

type FilterHandlers = {
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onPriceChange: (value: [number, number]) => void;
  onPriceCommit: (value: [number, number]) => void;
  onPriceReset: () => void;
  onDurationChange: (value: FootageExplorerQuery["duration"]) => void;
  onSortChange: (value: ExplorerSort) => void;
};

const sortLabels: Record<ExplorerSort, string> = {
  relevance: "مرتبط‌ترین",
  "price-asc": "ارزان‌ترین",
  "price-desc": "گران‌ترین",
  "duration-asc": "کوتاه‌ترین مدت",
  "duration-desc": "طولانی‌ترین مدت",
};

const durationLabels = {
  all: "همه مدت‌ها",
  short: "کوتاه؛ تا ۳۰ ثانیه",
  medium: "متوسط؛ ۳۱ تا ۶۰ ثانیه",
  long: "بلند؛ بیشتر از ۶۰ ثانیه",
} as const;

function formatPriceRange(query: FootageExplorerQuery) {
  const minimum = query.minPrice;
  const maximum = query.maxPrice;
  if (minimum !== undefined && maximum !== undefined) {
    return `قیمت: ${formatTomanDisplay(minimum)} تا ${formatTomanDisplay(maximum)}`;
  }
  if (minimum !== undefined) return `قیمت: از ${formatTomanDisplay(minimum)}`;
  return `قیمت: تا ${formatTomanDisplay(maximum ?? 0)}`;
}

function getSliderValues(
  query: FootageExplorerQuery,
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

function hasActiveExplorerSelections(query: FootageExplorerQuery) {
  return hasActiveExplorerFilters(query) || query.sort !== "relevance";
}

function SearchField({
  query,
  id = "explorer-filter-search",
  icon,
  onChange,
}: {
  query: string;
  id?: string;
  icon?: ReactNode;
  onChange: (value: string) => void;
}) {
  return (
    <Field>
      <FieldLabel htmlFor={id}>{icon}جست‌وجوی فوتیج</FieldLabel>
      <Input
        id={id}
        name="q"
        type="search"
        value={query}
        onChange={(event) => onChange(event.currentTarget.value)}
        placeholder="موضوع، شهر یا حال‌وهوا"
      />
    </Field>
  );
}

function CategoryField({
  query,
  categories,
  id = "explorer-category",
  icon,
  onChange,
}: Pick<FootageExplorerViewProps, "query" | "categories"> & {
  id?: string;
  icon?: ReactNode;
  onChange: (value: string) => void;
}) {
  return (
    <Field>
      <FieldLabel htmlFor={id}>{icon}دسته‌بندی</FieldLabel>
      <Select
        name="category"
        value={query.category || "all"}
        onValueChange={(value) => onChange(value ?? "all")}
      >
        <SelectTrigger id={id} className="w-full">
          <SelectValue>
            {query.category
              ? categories.find((item) => item.value === query.category)
                  ?.labelFa
              : "همه دسته‌بندی‌ها"}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="all">همه دسته‌بندی‌ها</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.value} value={category.value}>
                {category.labelFa}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </Field>
  );
}

function PriceFields({
  query,
  priceBounds,
  value,
  id,
  onChange,
  onCommit,
  onReset,
}: Pick<FootageExplorerViewProps, "query" | "priceBounds"> & {
  value: [number, number];
  id: string;
  onChange: (value: [number, number]) => void;
  onCommit: (value: [number, number]) => void;
  onReset: () => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <FieldLabel htmlFor={id}>محدوده قیمت</FieldLabel>
      <Slider
        id={id}
        aria-label="محدوده قیمت فوتیج"
        value={value}
        min={priceBounds.min}
        max={priceBounds.max}
        step={priceBounds.step}
        locale="fa-IR"
        minStepsBetweenValues={0}
        thumbCollisionBehavior="none"
        getAriaLabel={(index) => (index === 0 ? "حداقل قیمت" : "حداکثر قیمت")}
        getAriaValueText={(formattedValue, _, index) =>
          (index === 0 ? "حداقل" : "حداکثر") + " " + formattedValue + " تومان"
        }
        onValueChange={(next) => onChange(next as [number, number])}
        onValueCommitted={(next) => onCommit(next as [number, number])}
      />
      <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
        <span>{formatTomanDisplay(value[0])}</span>
        <span>{formatTomanDisplay(value[1])}</span>
      </div>
      {(query.minPrice !== undefined || query.maxPrice !== undefined) && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="self-start"
          onClick={onReset}
        >
          حذف محدوده قیمت
        </Button>
      )}
    </div>
  );
}

function DurationField({
  query,
  id = "explorer-duration",
  icon,
  onChange,
}: Pick<FootageExplorerViewProps, "query"> & {
  id?: string;
  icon?: ReactNode;
  onChange: (value: FootageExplorerQuery["duration"]) => void;
}) {
  return (
    <Field>
      <FieldLabel htmlFor={id}>{icon}مدت</FieldLabel>
      <Select
        name="duration"
        value={query.duration}
        onValueChange={(value) =>
          onChange(
            value === "short" || value === "medium" || value === "long"
              ? value
              : "all",
          )
        }
      >
        <SelectTrigger id={id} className="w-full">
          <SelectValue>{durationLabels[query.duration]}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {Object.entries(durationLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </Field>
  );
}

function SortField({
  query,
  icon,
  onChange,
}: Pick<FootageExplorerViewProps, "query"> & {
  icon?: ReactNode;
  onChange: (value: ExplorerSort) => void;
}) {
  return (
    <Field>
      <FieldLabel htmlFor="classic-sort">{icon}مرتب‌سازی</FieldLabel>
      <Select
        name="sort"
        value={query.sort}
        onValueChange={(value) => {
          if (EXPLORER_SORTS.includes(value as ExplorerSort)) {
            onChange(value as ExplorerSort);
          }
        }}
      >
        <SelectTrigger id="classic-sort" className="w-full">
          <SelectValue>{sortLabels[query.sort]}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {Object.entries(sortLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </Field>
  );
}

function ClassicFilterFields({
  query,
  categories,
  priceBounds,
  priceValue,
  idPrefix,
  ...handlers
}: Pick<FootageExplorerViewProps, "query" | "categories" | "priceBounds"> &
  FilterHandlers & { priceValue: [number, number]; idPrefix: string }) {
  return (
    <FieldGroup>
      <SearchField
        query={query.query}
        id={`${idPrefix}-search`}
        onChange={handlers.onSearchChange}
        icon={
          <Search className="size-4 text-muted-foreground" aria-hidden="true" />
        }
      />
      <div className="border-t border-border pt-5">
        <CategoryField
          query={query}
          categories={categories}
          id={`${idPrefix}-category`}
          onChange={handlers.onCategoryChange}
          icon={
            <LayoutGrid
              className="size-4 text-muted-foreground"
              aria-hidden="true"
            />
          }
        />
      </div>
      <div className="border-t border-border pt-5">
        <div className="mb-3 flex items-center gap-2 text-sm font-medium">
          <Wallet className="size-4 text-muted-foreground" aria-hidden="true" />
          قیمت
        </div>
        <PriceFields
          query={query}
          priceBounds={priceBounds}
          value={priceValue}
          id={`${idPrefix}-price-range`}
          onChange={handlers.onPriceChange}
          onCommit={handlers.onPriceCommit}
          onReset={handlers.onPriceReset}
        />
      </div>
      <div className="border-t border-border pt-5">
        <DurationField
          query={query}
          id={`${idPrefix}-duration`}
          onChange={handlers.onDurationChange}
          icon={
            <Clock3
              className="size-4 text-muted-foreground"
              aria-hidden="true"
            />
          }
        />
      </div>
      <div className="border-t border-border pt-5">
        <SortField
          query={query}
          onChange={handlers.onSortChange}
          icon={
            <ArrowDownUp
              className="size-4 text-muted-foreground"
              aria-hidden="true"
            />
          }
        />
      </div>
    </FieldGroup>
  );
}

function ModernFilterFields({
  query,
  categories,
  priceBounds,
  priceValue,
  idPrefix,
  ...handlers
}: Pick<FootageExplorerViewProps, "query" | "categories" | "priceBounds"> &
  FilterHandlers & { priceValue: [number, number]; idPrefix: string }) {
  return (
    <div className="flex flex-col divide-y divide-border">
      <div className="pb-4">
        <SearchField
          query={query.query}
          id={`${idPrefix}-search`}
          onChange={handlers.onSearchChange}
        />
      </div>
      <details open className="group py-4">
        <summary className="cursor-pointer list-none font-medium marker:hidden">
          دسته‌بندی{" "}
          <span className="float-start text-muted-foreground transition-transform group-open:rotate-180">
            ⌄
          </span>
        </summary>
        <div className="pt-3">
          <CategoryField
            query={query}
            categories={categories}
            id={`${idPrefix}-category`}
            onChange={handlers.onCategoryChange}
          />
        </div>
      </details>
      <details className="group py-4">
        <summary className="cursor-pointer list-none font-medium marker:hidden">
          قیمت{" "}
          <span className="float-start text-muted-foreground transition-transform group-open:rotate-180">
            ⌄
          </span>
        </summary>
        <div className="pt-3">
          <PriceFields
            query={query}
            priceBounds={priceBounds}
            value={priceValue}
            id={`${idPrefix}-price-range`}
            onChange={handlers.onPriceChange}
            onCommit={handlers.onPriceCommit}
            onReset={handlers.onPriceReset}
          />
        </div>
      </details>
      <details className="group py-4">
        <summary className="cursor-pointer list-none font-medium marker:hidden">
          مدت{" "}
          <span className="float-start text-muted-foreground transition-transform group-open:rotate-180">
            ⌄
          </span>
        </summary>
        <div className="pt-3">
          <DurationField
            query={query}
            id={`${idPrefix}-duration`}
            onChange={handlers.onDurationChange}
          />
        </div>
      </details>
    </div>
  );
}

function MinimalFilterFields({
  query,
  categories,
  priceBounds,
  priceValue,
  idPrefix,
  ...handlers
}: Pick<FootageExplorerViewProps, "query" | "categories" | "priceBounds"> &
  FilterHandlers & { priceValue: [number, number]; idPrefix: string }) {
  return (
    <div className="flex flex-col gap-3 text-sm">
      <SearchField
        query={query.query}
        id={`${idPrefix}-search`}
        onChange={handlers.onSearchChange}
      />
      <CategoryField
        query={query}
        categories={categories}
        id={`${idPrefix}-category`}
        onChange={handlers.onCategoryChange}
      />
      <div className="grid grid-cols-2 gap-2">
        <PriceFields
          query={query}
          priceBounds={priceBounds}
          value={priceValue}
          id={`${idPrefix}-price-range`}
          onChange={handlers.onPriceChange}
          onCommit={handlers.onPriceCommit}
          onReset={handlers.onPriceReset}
        />
      </div>
      <DurationField
        query={query}
        id={`${idPrefix}-duration`}
        onChange={handlers.onDurationChange}
      />
    </div>
  );
}

function FilterPanel({
  query,
  categories,
  priceBounds,
  priceValue,
  idPrefix,
  onSubmit,
  className,
  children,
  variant,
  ...handlers
}: Pick<FootageExplorerViewProps, "query" | "categories" | "priceBounds"> &
  FilterHandlers & {
    priceValue: [number, number];
    idPrefix: string;
    onSubmit: (event: FormEvent<HTMLFormElement>) => void;
    className?: string;
    children?: ReactNode;
    variant: FootageExplorerVariant;
  }) {
  return (
    <form className={className} onSubmit={onSubmit}>
      {variant === "classic" && (
        <ClassicFilterFields
          query={query}
          categories={categories}
          priceBounds={priceBounds}
          priceValue={priceValue}
          idPrefix={idPrefix}
          {...handlers}
        />
      )}
      {variant === "modern" && (
        <ModernFilterFields
          query={query}
          categories={categories}
          priceBounds={priceBounds}
          priceValue={priceValue}
          idPrefix={idPrefix}
          {...handlers}
        />
      )}
      {variant === "minimal" && (
        <MinimalFilterFields
          query={query}
          categories={categories}
          priceBounds={priceBounds}
          priceValue={priceValue}
          idPrefix={idPrefix}
          {...handlers}
        />
      )}
      {children}
    </form>
  );
}

function ActiveFilters({
  query,
  categories,
  onRemove,
}: Pick<FootageExplorerViewProps, "query" | "categories"> & {
  onRemove: (filter: keyof FootageExplorerQuery) => void;
}) {
  if (!hasActiveExplorerSelections(query)) {
    return null;
  }
  const categoryLabel = categories.find(
    (item) => item.value === query.category,
  )?.labelFa;
  const removableBadge = (
    filter: keyof FootageExplorerQuery,
    label: string,
  ) => (
    <Badge key={filter} variant="secondary" className="gap-1 pe-1">
      <span>{label}</span>
      <button
        type="button"
        aria-label={`حذف ${label}`}
        onClick={() => onRemove(filter)}
        className="inline-flex size-5 items-center justify-center rounded-full hover:bg-background/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <X className="size-3" aria-hidden="true" />
      </button>
    </Badge>
  );

  return (
    <div
      className="flex flex-wrap items-center gap-2"
      aria-label="فیلترهای فعال"
    >
      {query.query && removableBadge("query", `جست‌وجو: ${query.query}`)}
      {categoryLabel &&
        removableBadge("category", `دسته‌بندی: ${categoryLabel}`)}
      {(query.minPrice !== undefined || query.maxPrice !== undefined) &&
        removableBadge("minPrice", formatPriceRange(query))}
      {query.duration !== "all" &&
        removableBadge(
          "duration",
          `مدت‌زمان: ${durationLabels[query.duration]}`,
        )}
      {query.sort !== "relevance" &&
        removableBadge("sort", `مرتب‌سازی: ${sortLabels[query.sort]}`)}
    </div>
  );
}

function EmptyResults({ query }: Pick<FootageExplorerViewProps, "query">) {
  const router = useRouter();
  return (
    <div
      className="rounded-2xl border border-dashed border-border bg-muted/40 px-6 py-16 text-center"
      role="status"
    >
      <h2 className="text-xl font-semibold">
        نتیجه‌ای برای این ترکیب پیدا نشد
      </h2>
      <p className="mx-auto mt-2 max-w-md text-muted-foreground">
        فیلترها را کمی بازتر کن یا عبارت جست‌وجو را تغییر بده.
      </p>
      <Button
        type="button"
        variant="outline"
        className="mt-6"
        onClick={() => router.push("?")}
      >
        پاک کردن فیلترها
      </Button>
      <span className="sr-only">{query.query}</span>
    </div>
  );
}

export function FootageExplorerView(props: FootageExplorerViewProps) {
  const {
    variant,
    query,
    categories,
    priceBounds,
    footage,
    filteredCount,
    totalPages,
  } = props;
  const router = useRouter();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [searchDraft, setSearchDraft] = useState(query.query);
  const [priceDraft, setPriceDraft] = useState<[number, number]>(
    getSliderValues(query, priceBounds),
  );
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchRevisionRef = useRef(0);
  const activeFilterCount = getExplorerActiveFilterCount(query);
  const shellClass = variant === "minimal" ? "bg-muted/20" : "bg-background";

  useEffect(() => {
    const syncTimer = setTimeout(() => setSearchDraft(query.query), 0);
    return () => clearTimeout(syncTimer);
  }, [query.query]);

  useEffect(() => {
    const syncTimer = setTimeout(
      () => setPriceDraft(getSliderValues(query, priceBounds)),
      0,
    );
    return () => clearTimeout(syncTimer);
  }, [priceBounds, query]);

  useEffect(() => {
    if (searchDraft === query.query) return;
    const revision = searchRevisionRef.current;
    searchTimerRef.current = setTimeout(() => {
      if (revision !== searchRevisionRef.current) return;
      const next = serializeFootageExplorerQuery({
        ...query,
        query: searchDraft,
        page: 1,
      });
      const current = serializeFootageExplorerQuery(query);
      if (next !== current) router.replace(next ? `?${next}` : "?");
    }, 400);

    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    };
  }, [query, router, searchDraft]);

  function cancelPendingSearch() {
    searchRevisionRef.current += 1;
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
      searchTimerRef.current = null;
    }
  }

  function replaceDiscoveryState(overrides: Partial<FootageExplorerQuery>) {
    cancelPendingSearch();
    const next = serializeFootageExplorerQuery({
      ...query,
      query: searchDraft,
      ...overrides,
      page: 1,
    });
    const current = serializeFootageExplorerQuery(query);
    if (next !== current) router.replace(next ? `?${next}` : "?");
  }

  function handleFilterSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    replaceDiscoveryState({});
  }

  function handlePriceCommit(value: [number, number]) {
    replaceDiscoveryState({
      minPrice: value[0] <= priceBounds.min ? undefined : value[0],
      maxPrice: value[1] >= priceBounds.max ? undefined : value[1],
    });
  }

  function handlePriceReset() {
    setPriceDraft([priceBounds.min, priceBounds.max]);
    replaceDiscoveryState({ minPrice: undefined, maxPrice: undefined });
  }

  function handleRemoveFilter(filter: keyof FootageExplorerQuery) {
    if (filter === "minPrice" || filter === "maxPrice") {
      handlePriceReset();
      return;
    }
    if (filter === "query") {
      setSearchDraft("");
      replaceDiscoveryState({ query: "" });
      return;
    }
    if (filter === "category") {
      replaceDiscoveryState({ category: "" });
      return;
    }
    if (filter === "duration") {
      replaceDiscoveryState({ duration: "all" });
      return;
    }
    if (filter === "sort") {
      replaceDiscoveryState({ sort: "relevance" });
    }
  }

  function handleClearAll() {
    cancelPendingSearch();
    setSearchDraft("");
    setPriceDraft([priceBounds.min, priceBounds.max]);
    if (serializeFootageExplorerQuery(query)) router.replace("?");
  }

  return (
    <div
      className={`min-h-screen ${shellClass}`}
      data-explorer-variant={variant}
    >
      <main className="container-storefront py-4 md:py-6">
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <section
            className="min-w-0"
            aria-labelledby="explorer-results-heading"
          >
            <div className="mb-4 flex min-h-10 flex-wrap items-center justify-between gap-3">
              <ActiveFilters
                query={query}
                categories={categories}
                onRemove={handleRemoveFilter}
              />
              <div className="flex items-center gap-2">
                <p className="text-sm text-muted-foreground">
                  {filteredCount.toLocaleString("fa-IR")} نتیجه
                </p>
                {hasActiveExplorerSelections(query) && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleClearAll}
                  >
                    پاک کردن همه
                  </Button>
                )}
              </div>
              <div className="flex items-center gap-2">
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
                    <FilterPanel
                      query={query}
                      categories={categories}
                      priceBounds={priceBounds}
                      priceValue={priceDraft}
                      onSubmit={handleFilterSubmit}
                      onSearchChange={setSearchDraft}
                      onCategoryChange={(value) =>
                        replaceDiscoveryState({
                          category: value === "all" ? "" : value,
                        })
                      }
                      onPriceChange={setPriceDraft}
                      onPriceCommit={handlePriceCommit}
                      onPriceReset={handlePriceReset}
                      onDurationChange={(value) =>
                        replaceDiscoveryState({ duration: value })
                      }
                      onSortChange={(value) =>
                        replaceDiscoveryState({ sort: value })
                      }
                      idPrefix="mobile-explorer"
                      className="flex flex-col gap-6 px-4"
                      variant={variant}
                    >
                      {hasActiveExplorerSelections(query) && (
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => {
                            handleClearAll();
                          }}
                        >
                          پاک کردن همه
                        </Button>
                      )}
                    </FilterPanel>
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
              <EmptyResults query={query} />
            ) : (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                {footage.map((item) => (
                  <FootageCard key={item.id} footage={item} />
                ))}
              </div>
            )}
            {totalPages > 1 && (
              <nav
                className="mt-8 flex justify-center gap-2"
                aria-label="صفحه‌بندی نتایج"
              >
                {Array.from(
                  { length: totalPages },
                  (_, index) => index + 1,
                ).map((page) => (
                  <a
                    key={page}
                    href={createFootageExplorerHref(query, { page })}
                    aria-current={page === query.page ? "page" : undefined}
                    className={`inline-flex size-10 items-center justify-center rounded-lg border text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${page === query.page ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:bg-accent"}`}
                  >
                    {page.toLocaleString("fa-IR")}
                  </a>
                ))}
              </nav>
            )}
          </section>

          <aside
            className={`sticky top-6 hidden max-h-[calc(100vh-2rem)] overflow-y-auto lg:block ${variant === "classic" ? "rounded-2xl border bg-card p-5 shadow-sm" : variant === "modern" ? "border-s border-border/70 ps-5" : "bg-transparent"}`}
            aria-label="فیلترهای فوتیج"
          >
            <div
              className={`mb-4 flex items-center gap-2 ${variant === "minimal" ? "text-sm text-muted-foreground" : ""}`}
            >
              <Filter data-icon="inline-start" aria-hidden="true" />
              <h2 className="font-semibold">فیلترها</h2>
            </div>
            <FilterPanel
              query={query}
              categories={categories}
              priceBounds={priceBounds}
              priceValue={priceDraft}
              onSubmit={handleFilterSubmit}
              onSearchChange={setSearchDraft}
              onCategoryChange={(value) =>
                replaceDiscoveryState({
                  category: value === "all" ? "" : value,
                })
              }
              onPriceChange={setPriceDraft}
              onPriceCommit={handlePriceCommit}
              onPriceReset={handlePriceReset}
              onDurationChange={(value) =>
                replaceDiscoveryState({ duration: value })
              }
              onSortChange={(value) => replaceDiscoveryState({ sort: value })}
              idPrefix="desktop-explorer"
              className={
                variant === "classic"
                  ? "flex flex-col gap-6"
                  : variant === "modern"
                    ? "flex flex-col"
                    : "flex flex-col gap-3"
              }
              variant={variant}
            >
              <div
                className={`flex flex-col gap-2 ${variant === "classic" ? "border-t border-border pt-5" : "pt-3"}`}
              >
                {hasActiveExplorerSelections(query) && (
                  <Button
                    type="button"
                    variant="ghost"
                    size={variant === "minimal" ? "sm" : "default"}
                    onClick={handleClearAll}
                  >
                    پاک کردن همه
                  </Button>
                )}
              </div>
            </FilterPanel>
          </aside>
        </div>
      </main>
    </div>
  );
}
