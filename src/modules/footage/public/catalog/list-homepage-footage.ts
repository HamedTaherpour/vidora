import { publicFootageDevelopmentFixtures } from "./public-footage-development-fixtures";
import { listPublishedFootage } from "./list-published-footage";
import type {
  HomepageFootageResult,
  ListHomepageFootageParams,
} from "./list-homepage-footage.types";

/** Homepage-only boundary: local empty catalogues use fixtures; production never does. */
export async function listHomepageFootage({
  store,
  nodeEnv,
}: ListHomepageFootageParams): Promise<HomepageFootageResult> {
  const items = await listPublishedFootage({ store });
  return nodeEnv === "development" && items.length === 0
    ? {
        items: publicFootageDevelopmentFixtures,
        source: "development-fixtures",
      }
    : { items, source: "catalog" };
}
