import { prisma } from "@/lib/db/client";
import { createPrismaPublicFootageCatalogStore } from "@/modules/footage/public/catalog/prisma-public-footage-catalog-store";
import { listHomepageFootage } from "@/modules/footage/public/catalog/list-homepage-footage";
import type { PublicFootageCatalogItem } from "@/modules/footage/public/catalog/public-footage-catalog-store";
import {
  discoverPublicFootage,
  getFootagePriceBounds,
  parseSearchQuery,
} from "@/modules/footage/public/search/search";
import { SearchPage } from "@/modules/footage/public/search/search-page/search-page";

export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function SearchRoute({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  let footage: PublicFootageCatalogItem[] = [];
  let dataError = false;
  let fixtureMode = false;

  try {
    const result = await listHomepageFootage({
      store: createPrismaPublicFootageCatalogStore(prisma),
      nodeEnv: process.env.NODE_ENV,
    });
    footage = result.items;
    fixtureMode = result.source === "development-fixtures";
  } catch (error) {
    console.error(
      "Failed to load public footage for search",
      error instanceof Error ? error.message : "unknown error",
    );
    dataError = true;
  }

  const categoryMap = new Map<
    string,
    { slug: string; nameFa: string; count: number }
  >();
  footage.forEach((item) => {
    const current = categoryMap.get(item.category.slug);
    categoryMap.set(
      item.category.slug,
      current
        ? { ...current, count: current.count + 1 }
        : { ...item.category, count: 1 },
    );
  });
  const categories = [...categoryMap.values()];
  const query = parseSearchQuery(
    params,
    categories.map((category) => ({ value: category.slug })),
  );
  const result = discoverPublicFootage(footage, query);

  return (
    <SearchPage
      categories={categories}
      dataError={dataError}
      fixtureMode={fixtureMode}
      priceBounds={getFootagePriceBounds(footage)}
      query={query}
      result={result}
    />
  );
}
