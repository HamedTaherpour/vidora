import type { PublicFootageCatalogItem } from "@/modules/footage/public/catalog/public-footage-catalog-store";
import type { UiMockScenario } from "@/modules/ui-mock/scenarios";

/** Props for rendering the public footage list and its loading/error states. */
export type PublicFootageListViewProps = {
  footage: PublicFootageCatalogItem[];
  scenario?: UiMockScenario;
  query?: string;
  category?: string;
  messageFa?: string;
  requestedPage?: number;
};
