import type { UiMockScenario } from "@/modules/ui-mock/scenarios";
import type { PublicFootageCatalogItem } from "@/modules/footage/public/catalog/public-footage-catalog-store";
import type { PublicFootageCategoryOption } from "@/modules/footage/public/catalog/public-footage-catalog-store";

/** Data and UI state required to render the public homepage composition. */
export type PublicHomePageProps = {
  footage: PublicFootageCatalogItem[];
  scenario: UiMockScenario;
  query: string;
  category: string;
  categories: PublicFootageCategoryOption[];
  scenarioParam?: string;
  messageFa?: string;
  requestedPage?: number;
};
