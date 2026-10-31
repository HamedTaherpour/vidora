import type { PublicFootageCatalogItem } from "@/modules/footage/public/catalog/public-footage-catalog-store";

/** Technical and editorial presentation data for a public detail preview. */
export type PublicFootageDetail = PublicFootageCatalogItem & {
  descriptionFa: string;
  tagsFa: readonly string[];
  resolution: string;
  frameRate: string;
  format: string;
  qualities: readonly string[];
};
