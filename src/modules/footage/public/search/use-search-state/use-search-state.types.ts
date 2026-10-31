import type { SearchQuery, FootagePriceBounds } from "../search";

/** Inputs required to synchronize Search drafts with URL-owned state. */
export type UseSearchStateParams = {
  query: SearchQuery;
  priceBounds: FootagePriceBounds;
};
