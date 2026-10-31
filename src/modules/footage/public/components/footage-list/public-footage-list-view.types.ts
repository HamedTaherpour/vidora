import type { PublicFootageCatalogItem } from "@/modules/footage/public/catalog/public-footage-catalog-store";
import type { UiMockScenario } from "@/modules/ui-mock/scenarios";

export type PublicFootageListViewProps = {
  footage: PublicFootageCatalogItem[];
  scenario?: UiMockScenario;
  query?: string;
  category?: string;
  messageFa?: string;
};
