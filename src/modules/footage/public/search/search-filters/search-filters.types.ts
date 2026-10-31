import type { FormEvent, ReactNode } from "react";

import type { PublicFootageCategoryOption } from "@/modules/footage/public/catalog/public-footage-catalog-store";

import type { FootagePriceBounds, SearchQuery, SearchSort } from "../search";

/** Shared callback contract for Search filter controls. */
export type SearchFilterHandlers = {
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onPriceChange: (value: [number, number]) => void;
  onPriceCommit: (value: [number, number]) => void;
  onPriceReset: () => void;
  onDurationChange: (value: SearchQuery["duration"]) => void;
  onSortChange: (value: SearchSort) => void;
};

/** Shared props for the Search filter-fields composition. */
export type SearchFilterFieldsProps = SearchFilterHandlers & {
  query: SearchQuery;
  categories: PublicFootageCategoryOption[];
  priceBounds: FootagePriceBounds;
  priceValue: [number, number];
  idPrefix: string;
};

/** Props for the Search filter form. */
export type SearchFiltersProps = SearchFilterFieldsProps & {
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  className?: string;
};

/** Props for the Search input field. */
export type SearchFieldProps = {
  query: string;
  id?: string;
  icon?: ReactNode;
  onChange: (value: string) => void;
};

/** Props for the Search category select field. */
export type SearchCategoryFieldProps = {
  query: SearchQuery;
  categories: PublicFootageCategoryOption[];
  id?: string;
  icon?: ReactNode;
  onChange: (value: string) => void;
};

/** Props for the Search price field. */
export type SearchPriceFieldsProps = {
  query: SearchQuery;
  priceBounds: FootagePriceBounds;
  value: [number, number];
  id: string;
  onChange: (value: [number, number]) => void;
  onCommit: (value: [number, number]) => void;
  onReset: () => void;
};

/** Props for the Search duration field. */
export type SearchDurationFieldProps = {
  query: SearchQuery;
  id?: string;
  icon?: ReactNode;
  onChange: (value: SearchQuery["duration"]) => void;
};

/** Props for the Search sort field. */
export type SearchSortFieldProps = {
  query: SearchQuery;
  id: string;
  icon?: ReactNode;
  onChange: (value: SearchSort) => void;
};

/** Props for active Search filter badges. */
export type SearchActiveFiltersProps = {
  query: SearchQuery;
  categories: PublicFootageCategoryOption[];
  onRemove: (
    filter: "query" | "category" | "minPrice" | "duration" | "sort",
  ) => void;
};

/** Props for the desktop Search filter sidebar. */
export type SearchFilterSidebarProps = SearchFilterFieldsProps & {
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};
