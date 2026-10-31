import type { PublicFootageCatalogItem } from "@/modules/footage/public/catalog/public-footage-catalog-store";
import type { PublicFootageCategoryOption } from "@/modules/footage/public/catalog/public-footage-catalog-store";
import type { UiMockScenario } from "@/modules/ui-mock/scenarios";

export const HOME_EXPLORATION_VARIANTS = ["balanced"] as const;

export type HomeExplorationVariant = (typeof HOME_EXPLORATION_VARIANTS)[number];

export type HomeExplorationProps = {
  variant: HomeExplorationVariant;
  footage: PublicFootageCatalogItem[];
  categories: PublicFootageCategoryOption[];
  scenario?: UiMockScenario;
  scenarioParam?: string;
  query?: string;
  category?: string;
  messageFa?: string;
  requestedPage?: number;
};
