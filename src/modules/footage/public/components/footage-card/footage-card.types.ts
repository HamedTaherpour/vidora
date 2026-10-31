import type { PublicFootageCatalogItem } from "@/modules/footage/public/catalog/public-footage-catalog-store";

/** Data required to render the static footage card presentation. */
export type FootageCardProps = {
  footage: PublicFootageCatalogItem;
};

/** Data passed across the Server Component/client preview boundary. */
export type FootagePreviewProps = {
  footage: PublicFootageCatalogItem;
};
