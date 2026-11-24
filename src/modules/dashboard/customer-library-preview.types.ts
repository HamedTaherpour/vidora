import type { PublicFootageCatalogItem } from "@/modules/footage/public/catalog/public-footage-catalog-store";

export type CustomerLibraryPreviewItem = {
  reference: string;
  item: PublicFootageCatalogItem;
  qualityVariants: readonly string[];
};
