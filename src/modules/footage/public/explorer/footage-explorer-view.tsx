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
import { useState, type FormEvent, type ReactNode } from "react";

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
import {
  createFootageExplorerHref,
  EXPLORER_SORTS,
  getExplorerActiveFilterCount,
  hasActiveExplorerFilters,
  serializeFootageExplorerQuery,
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
  footage: PublicFootageCatalogItem[];
  filteredCount: number;
  totalPages: number;
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

function submitQuery(
  event: FormEvent<HTMLFormElement>,
  router: ReturnType<typeof useRouter>,
  onDone?: () => void,
) {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  const next: FootageExplorerQuery = {
    query: String(formData.get("q") ?? "").trim(),
    category: readCategory(String(formData.get("category") ?? "")),
    minPrice: parseOptionalNumber(formData.get("minPrice")),
    maxPrice: parseOptionalNumber(formData.get("maxPrice")),
    duration: readDuration(String(formData.get("duration") ?? "all")),
    sort: readSort(String(formData.get("sort") ?? "relevance")),
    page: 1,
  };
  const params = serializeFootageExplorerQuery(next);
  router.push(params ? `?${params}` : "?");
  onDone?.();
}

function parseOptionalNumber(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  if (!/^\d+$/.test(text)) return undefined;
  const number = Number(text);
  return Number.isSafeInteger(number) ? number : undefined;
}

function readDuration(value: string): FootageExplorerQuery["duration"] {
  return value === "short" || value === "medium" || value === "long"
    ? value
    : "all";
}

function readSort(value: string): ExplorerSort {
  return EXPLORER_SORTS.includes(value as ExplorerSort)
    ? (value as ExplorerSort)
    : "relevance";
}

function readCategory(value: string) {
  return value === "all" ? "" : value;
}

function SearchField({
  query,
  id = "explorer-filter-search",
  icon,
}: {
  query: string;
  id?: string;
  icon?: ReactNode;
}) {
  return (
    <Field>
      <FieldLabel htmlFor={id}>{icon}جست‌وجوی فوتیج</FieldLabel>
      <Input
        id={id}
        name="q"
        type="search"
        defaultValue={query}
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
}: Pick<FootageExplorerViewProps, "query" | "categories"> & {
  id?: string;
  icon?: ReactNode;
}) {
  return (
    <Field>
      <FieldLabel htmlFor={id}>{icon}دسته‌بندی</FieldLabel>
      <Select name="category" defaultValue={query.category || "all"}>
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
  compact = false,
}: Pick<FootageExplorerViewProps, "query"> & { compact?: boolean }) {
  return (
    <div className={compact ? "grid grid-cols-2 gap-2" : "flex flex-col gap-5"}>
      <Field>
        <FieldLabel
          htmlFor={
            compact ? "explorer-min-price-compact" : "explorer-min-price"
          }
        >
          حداقل قیمت (تومان)
        </FieldLabel>
        <Input
          id={compact ? "explorer-min-price-compact" : "explorer-min-price"}
          name="minPrice"
          inputMode="numeric"
          defaultValue={query.minPrice ?? ""}
          placeholder="مثلاً ۲۵۰۰۰۰"
        />
      </Field>
      <Field>
        <FieldLabel
          htmlFor={
            compact ? "explorer-max-price-compact" : "explorer-max-price"
          }
        >
          حداکثر قیمت (تومان)
        </FieldLabel>
        <Input
          id={compact ? "explorer-max-price-compact" : "explorer-max-price"}
          name="maxPrice"
          inputMode="numeric"
          defaultValue={query.maxPrice ?? ""}
          placeholder="مثلاً ۵۰۰۰۰۰"
        />
      </Field>
    </div>
  );
}

function DurationField({
  query,
  id = "explorer-duration",
  icon,
}: Pick<FootageExplorerViewProps, "query"> & {
  id?: string;
  icon?: ReactNode;
}) {
  return (
    <Field>
      <FieldLabel htmlFor={id}>{icon}مدت</FieldLabel>
      <Select name="duration" defaultValue={query.duration}>
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
}: Pick<FootageExplorerViewProps, "query"> & { icon?: ReactNode }) {
  return (
    <Field>
      <FieldLabel htmlFor="classic-sort">{icon}مرتب‌سازی</FieldLabel>
      <Select name="sort" defaultValue={query.sort}>
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
}: Pick<FootageExplorerViewProps, "query" | "categories">) {
  return (
    <FieldGroup>
      <SearchField
        query={query.query}
        icon={
          <Search className="size-4 text-muted-foreground" aria-hidden="true" />
        }
      />
      <div className="border-t border-border pt-5">
        <CategoryField
          query={query}
          categories={categories}
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
        <PriceFields query={query} />
      </div>
      <div className="border-t border-border pt-5">
        <DurationField
          query={query}
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
}: Pick<FootageExplorerViewProps, "query" | "categories">) {
  return (
    <div className="flex flex-col divide-y divide-border">
      <div className="pb-4">
        <SearchField query={query.query} id="modern-filter-search" />
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
            id="modern-category"
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
          <PriceFields query={query} compact />
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
          <DurationField query={query} id="modern-duration" />
        </div>
      </details>
    </div>
  );
}

function MinimalFilterFields({
  query,
  categories,
}: Pick<FootageExplorerViewProps, "query" | "categories">) {
  return (
    <div className="flex flex-col gap-3 text-sm">
      <SearchField query={query.query} id="minimal-filter-search" />
      <CategoryField
        query={query}
        categories={categories}
        id="minimal-category"
      />
      <div className="grid grid-cols-2 gap-2">
        <PriceFields query={query} compact />
      </div>
      <DurationField query={query} id="minimal-duration" />
    </div>
  );
}

function FilterPanel({
  query,
  categories,
  onSubmit,
  className,
  children,
  variant,
}: Pick<FootageExplorerViewProps, "query" | "categories"> & {
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  className?: string;
  children?: ReactNode;
  variant: FootageExplorerVariant;
}) {
  return (
    <form className={className} onSubmit={onSubmit}>
      {variant === "classic" && (
        <ClassicFilterFields query={query} categories={categories} />
      )}
      {variant === "modern" && (
        <ModernFilterFields query={query} categories={categories} />
      )}
      {variant === "minimal" && (
        <MinimalFilterFields query={query} categories={categories} />
      )}
      {children}
    </form>
  );
}

function ActiveFilters({
  query,
  categories,
}: Pick<FootageExplorerViewProps, "query" | "categories">) {
  if (!hasActiveExplorerFilters(query)) return null;
  const categoryLabel = categories.find(
    (item) => item.value === query.category,
  )?.labelFa;
  return (
    <div
      className="flex flex-wrap items-center gap-2"
      aria-label="فیلترهای فعال"
    >
      {query.query && <Badge variant="secondary">جست‌وجو: {query.query}</Badge>}
      {categoryLabel && (
        <Badge variant="secondary">دسته: {categoryLabel}</Badge>
      )}
      {(query.minPrice !== undefined || query.maxPrice !== undefined) && (
        <Badge variant="secondary">محدوده قیمت</Badge>
      )}
      {query.duration !== "all" && (
        <Badge variant="secondary">{durationLabels[query.duration]}</Badge>
      )}
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
  const { variant, query, categories, footage, filteredCount, totalPages } =
    props;
  const router = useRouter();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const activeFilterCount = getExplorerActiveFilterCount(query);
  const shellClass = variant === "minimal" ? "bg-muted/20" : "bg-background";

  function handleFilterSubmit(event: FormEvent<HTMLFormElement>) {
    submitQuery(event, router, () => setMobileFiltersOpen(false));
  }

  function handleSort(value: string | null) {
    if (!value) return;
    router.push(
      createFootageExplorerHref(query, {
        sort: value as ExplorerSort,
        page: 1,
      }),
    );
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
              <div className="flex flex-wrap items-center gap-3">
                <p
                  id="explorer-results-heading"
                  className="text-sm text-muted-foreground"
                >
                  {filteredCount.toLocaleString("fa-IR")} نتیجه
                </p>
                <ActiveFilters query={query} categories={categories} />
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
                      onSubmit={handleFilterSubmit}
                      className="flex flex-col gap-6 px-4"
                      variant={variant}
                    >
                      <Button type="submit">اعمال فیلترها</Button>
                      {hasActiveExplorerFilters(query) && (
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => {
                            setMobileFiltersOpen(false);
                            router.push("?");
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
                {variant !== "classic" && (
                  <Select value={query.sort} onValueChange={handleSort}>
                    <SelectTrigger
                      aria-label="مرتب‌سازی"
                      className="w-44 bg-card"
                    >
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
                )}
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
              onSubmit={handleFilterSubmit}
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
                <Button
                  type="submit"
                  size={variant === "minimal" ? "sm" : "default"}
                >
                  اعمال فیلترها
                </Button>
                {hasActiveExplorerFilters(query) && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => router.push("?")}
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
