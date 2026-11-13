import type { PublicFootageCatalogItem } from "@/modules/footage/public/catalog/public-footage-catalog-store";

export type HomeGalleryProps = {
  footage: PublicFootageCatalogItem[];
  page: number;
  totalPages: number;
  dataError?: boolean;
  fixtureMode: boolean;
};
