import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/client";
import { resolveCurrentCustomer } from "@/modules/auth/sessions/resolve-current-customer";
import { createPrismaPublicFootageDetailStore } from "@/modules/footage/public/catalog/prisma-public-footage-detail-store";
import { createPrismaPublicFootageCatalogStore } from "@/modules/footage/public/catalog/prisma-public-footage-catalog-store";
import { getPublicFootageDetail } from "@/modules/footage/public/catalog/get-public-footage-detail";
import { listHomepageFootage } from "@/modules/footage/public/catalog/list-homepage-footage";
import { publicFootageDevelopmentFixtures } from "@/modules/footage/public/catalog/public-footage-development-fixtures";
import { FootageDetail } from "@/modules/footage/public/detail/footage-detail";
import type { PublicFootageDetail } from "@/modules/footage/public/catalog/public-footage-detail-store";

export const dynamic = "force-dynamic";

type FootagePageProps = { params: Promise<{ slug: string }> };

export default async function FootagePage({ params }: FootagePageProps) {
  const { slug } = await params;
  const footage = await getPublicFootageDetail({
    slug,
    nodeEnv: process.env.NODE_ENV,
    store: createPrismaPublicFootageDetailStore(prisma),
  });
  if (!footage) notFound();
  const catalogResult = await listHomepageFootage({
    store: createPrismaPublicFootageCatalogStore(prisma),
    nodeEnv: process.env.NODE_ENV,
  });
  const categoryMap = new Map<
    string,
    { slug: string; nameFa: string; count: number }
  >();
  for (const item of catalogResult.items) {
    const current = categoryMap.get(item.category.slug);
    categoryMap.set(
      item.category.slug,
      current
        ? { ...current, count: current.count + 1 }
        : { ...item.category, count: 1 },
    );
  }
  const categories = [...categoryMap.values()];
  const sourceItems: PublicFootageDetail[] =
    process.env.NODE_ENV === "development"
      ? publicFootageDevelopmentFixtures.map((item, index) => ({
          ...item,
          descriptionFa: `یک پیش‌نمایش آزمایشی از ${item.titleFa} برای بررسی انتخاب دقیق‌تر در پروژه‌های ویدیویی.`,
          tags: [item.category.nameFa],
          technical:
            index === 0
              ? {
                  width: 3840,
                  height: 2160,
                  fps: 24,
                  codec: "H.264",
                  mimeType: "video/mp4",
                }
              : {},
          qualities: [],
          dataSource: "development-fixture" as const,
        }))
      : [];
  const related = sourceItems
    .filter(
      (item) =>
        item.slug !== footage.slug &&
        item.category.slug === footage.category.slug,
    )
    .slice(0, 4);
  const customer = await resolveCurrentCustomer();
  return (
    <FootageDetail
      footage={footage}
      related={related}
      categories={categories}
      session={customer.status}
    />
  );
}
