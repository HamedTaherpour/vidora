import {
  filterPublicFootage,
  normalizePublicCategory,
  parsePublicBrowseQuery,
} from "./filter-public-footage";
import type {
  PublicFootageCategoryOption,
  PublicFootageCatalogItem,
} from "./public-footage-catalog-store";
import {
  loadPublicFootageMock,
  publicFootageFixtures,
} from "@/modules/ui-mock/fixtures/public-footage";
import type { UiMockScenario } from "@/modules/ui-mock/scenarios";

/** Prepared public-home catalog state for route-level composition. */
export type PreparedPublicHomeCatalog = {
  footage: PublicFootageCatalogItem[];
  categories: PublicFootageCategoryOption[];
  query: string;
  category: string;
  messageFa?: string;
};

/**
 * Loads and prepares the current public catalog view while keeping filtering
 * and category derivation inside the Footage module.
 */
export function preparePublicHomeCatalog(
  scenario: UiMockScenario,
  params: { q?: string; category?: string },
): PreparedPublicHomeCatalog {
  const result = loadPublicFootageMock(scenario);
  const categories = Array.from(
    new Map(
      (result.data ?? publicFootageFixtures).map((item) => [
        item.category.slug,
        item.category.nameFa,
      ]),
    ),
  ).map(([value, labelFa]) => ({ value, labelFa }));
  const query = parsePublicBrowseQuery(params);
  const category = normalizePublicCategory(query.category, categories);

  return {
    footage: result.data
      ? filterPublicFootage(result.data, { query: query.query, category })
      : [],
    categories,
    query: query.query,
    category,
    messageFa: "messageFa" in result ? result.messageFa : undefined,
  };
}
