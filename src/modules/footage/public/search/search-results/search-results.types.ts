import type { PublicFootageCatalogItem } from "../../catalog/public-footage-catalog-store";
import type { SearchQuery } from "../search";

export type SearchResultsProps = {
  items: PublicFootageCatalogItem[];
  query: SearchQuery;
  total: number;
  totalPages: number;
  fixtureMode: boolean;
  dataError: boolean;
  onPageChange: (page: number) => void;
};
