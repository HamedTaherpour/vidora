import type { PublicFootageCategoryOption } from "@/modules/footage/public/catalog/public-footage-catalog-store";

/** Props required to render the public navigation header and its categories. */
export type PublicSiteHeaderProps = {
  categories: ReadonlyArray<PublicFootageCategoryOption>;
};
