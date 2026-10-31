import type { SearchSort } from "../search";

/** Persian labels for the supported Search sort orders. */
export const searchSortLabels: Record<SearchSort, string> = {
  relevance: "مرتبط‌ترین",
  "price-asc": "ارزان‌ترین",
  "price-desc": "گران‌ترین",
  "duration-asc": "کوتاه‌ترین مدت",
  "duration-desc": "طولانی‌ترین مدت",
};

/** Persian labels for the supported Search duration filters. */
export const searchDurationLabels = {
  all: "همه مدت‌ها",
  short: "کوتاه؛ تا ۳۰ ثانیه",
  medium: "متوسط؛ ۳۱ تا ۶۰ ثانیه",
  long: "بلند؛ بیشتر از ۶۰ ثانیه",
} as const;
