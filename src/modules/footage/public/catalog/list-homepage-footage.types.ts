import type {
  PublicFootageCatalogItem,
  PublicFootageCatalogStore,
} from "./public-footage-catalog-store";

export type HomepageFootageSource = "catalog" | "development-fixtures";
export type ListHomepageFootageParams = {
  store: PublicFootageCatalogStore;
  nodeEnv: string | undefined;
};
export type HomepageFootageResult = {
  items: PublicFootageCatalogItem[];
  source: HomepageFootageSource;
};
