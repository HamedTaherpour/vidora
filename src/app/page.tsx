import { prisma } from "@/lib/db/client";
import { createPrismaPublicFootageCatalogStore } from "@/modules/footage/public/catalog/prisma-public-footage-catalog-store";
import { listHomepageFootage } from "@/modules/footage/public/catalog/list-homepage-footage";
import { paginatePublicFootage } from "@/modules/footage/public/catalog/filter-public-footage";
import type { PublicFootageCatalogItem } from "@/modules/footage/public/catalog/public-footage-catalog-store";
import { HomePage } from "@/modules/footage/public/home-exploration/home-page";

export const dynamic = "force-dynamic";

type HomeSearchParams = Promise<{ page?: string }>;

export default async function Home({
  searchParams,
}: {
  searchParams: HomeSearchParams;
}) {
  const params = await searchParams;
  const requestedPage = Number.parseInt(params.page ?? "1", 10);
  let allFootage: PublicFootageCatalogItem[] = [];
  let dataError = false;
  let fixtureMode = false;

  try {
    const result = await listHomepageFootage({
      store: createPrismaPublicFootageCatalogStore(prisma),
      nodeEnv: process.env.NODE_ENV,
    });
    allFootage = result.items;
    fixtureMode = result.source === "development-fixtures";
  } catch (error) {
    console.error(
      "Failed to load public footage for homepage",
      error instanceof Error ? error.message : "unknown error",
    );
    dataError = true;
  }

  const safePage =
    Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const paginated = paginatePublicFootage(allFootage, safePage);
  const categoryMap = new Map<
    string,
    { slug: string; nameFa: string; count: number }
  >();
  allFootage.forEach((item) => {
    const current = categoryMap.get(item.category.slug);
    categoryMap.set(
      item.category.slug,
      current
        ? { ...current, count: current.count + 1 }
        : { ...item.category, count: 1 },
    );
  });
  const categories = [...categoryMap.values()];

  return (
    <HomePage
      footage={paginated.items}
      categories={categories}
      page={paginated.page}
      totalPages={paginated.totalPages}
      dataError={dataError}
      fixtureMode={fixtureMode}
    />
  );
}
