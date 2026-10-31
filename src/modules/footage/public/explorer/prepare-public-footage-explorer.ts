import type { PublicFootageCategoryOption } from "@/modules/footage/public/catalog/public-footage-catalog-store";
import {
  discoverPublicFootage,
  getFootagePriceBounds,
  parseFootageExplorerQuery,
} from "./footage-explorer";
import { publicFootageFixtures } from "@/modules/ui-mock/fixtures/public-footage";

function getPublicFootageCategories(): PublicFootageCategoryOption[] {
  return Array.from(
    new Map(
      publicFootageFixtures.map((item) => [
        item.category.slug,
        item.category.nameFa,
      ]),
    ),
  ).map(([value, labelFa]) => ({ value, labelFa }));
}

export function preparePublicFootageExplorer(
  params: Record<string, string | string[] | undefined>,
) {
  const categories = getPublicFootageCategories();
  const query = parseFootageExplorerQuery(params, categories);
  const result = discoverPublicFootage(publicFootageFixtures, query);
  const priceBounds = getFootagePriceBounds(publicFootageFixtures);

  return { categories, priceBounds, query, result };
}
