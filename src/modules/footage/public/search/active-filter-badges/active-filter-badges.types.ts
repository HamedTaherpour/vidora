import type { SearchCategory } from "../search-page/search-page.types";
import type { SearchQuery } from "../search";

export type ActiveFilterBadgesProps = {
  query: SearchQuery;
  categories: SearchCategory[];
  onRemove: (
    filter: "query" | "category" | "price" | "duration" | "sort",
  ) => void;
};
