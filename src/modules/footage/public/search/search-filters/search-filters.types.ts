import type { SearchCategory } from "../search-page/search-page.types";
import type { FootagePriceBounds, SearchQuery } from "../search";

export type SearchFiltersProps = {
  categories: SearchCategory[];
  priceBounds: FootagePriceBounds;
  query: SearchQuery;
  mobile?: boolean;
  onClose?: () => void;
  searchDraft: string;
  setSearchDraft: (value: string) => void;
  priceDraft: [number, number];
  setPriceDraft: (value: [number, number]) => void;
  replaceDiscoveryState: (value: Partial<SearchQuery>) => void;
};
