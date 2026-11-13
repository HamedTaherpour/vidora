import type { FootagePriceBounds, SearchQuery, SearchResult } from "../search";

export type SearchCategory = { slug: string; nameFa: string; count: number };

export type SearchPageProps = {
  categories: SearchCategory[];
  dataError: boolean;
  fixtureMode: boolean;
  priceBounds: FootagePriceBounds;
  query: SearchQuery;
  result: SearchResult;
};
