import type { PublicFootageCategoryOption } from "@/modules/footage/public/catalog/public-footage-catalog-store";

/** Props for the client-side homepage query and category controls. */
export type HomepageSearchControlsProps = {
  query: string;
  category: string;
  categories: PublicFootageCategoryOption[];
  scenario?: string;
};
