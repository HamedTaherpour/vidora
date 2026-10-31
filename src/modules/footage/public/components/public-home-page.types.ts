import type { UiMockScenario } from "@/modules/ui-mock/scenarios";
import type { PublicFootageCatalogItem } from "@/modules/footage/public/catalog/public-footage-catalog-store";

export type PublicHomePageProps = {
  footage: PublicFootageCatalogItem[];
  scenario: UiMockScenario;
  query: string;
  category: string;
  categories: Array<{ value: string; labelFa: string }>;
  scenarioParam?: string;
  messageFa?: string;
};
