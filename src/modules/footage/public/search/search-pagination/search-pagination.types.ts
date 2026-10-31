import type { SearchQuery } from "../search";

/** Props for URL-preserving Search pagination. */
export type SearchPaginationProps = {
  query: SearchQuery;
  totalPages: number;
};
