import type { PublicFootageCatalogItem } from "@/modules/footage/public/catalog/public-footage-catalog-store";

export type HomeCategory = {
  slug: string;
  nameFa: string;
  count: number;
};

export type HomePageProps = {
  footage: PublicFootageCatalogItem[];
  categories: HomeCategory[];
  page: number;
  totalPages: number;
  dataError?: boolean;
  fixtureMode: boolean;
};
