import { publicFootageDevelopmentFixtures } from "./public-footage-development-fixtures";
import type {
  PublicFootageDetail,
  PublicFootageDetailStore,
} from "./public-footage-detail-store";

export type GetPublicFootageDetailParams = {
  slug: string;
  store: PublicFootageDetailStore;
  nodeEnv?: string;
};

export async function getPublicFootageDetail({
  slug,
  store,
  nodeEnv,
}: GetPublicFootageDetailParams): Promise<PublicFootageDetail | null> {
  const catalogItem = await store.findPublishedFootageBySlug(slug);
  if (catalogItem) return catalogItem;
  if (nodeEnv !== "development") return null;

  const fixture = publicFootageDevelopmentFixtures.find(
    (item) => item.slug === slug,
  );
  if (!fixture) return null;
  const index = publicFootageDevelopmentFixtures.indexOf(fixture);
  return {
    ...fixture,
    descriptionFa: `یک پیش‌نمایش آزمایشی از ${fixture.titleFa} برای بررسی انتخاب دقیق‌تر در پروژه‌های ویدیویی.`,
    tags: [fixture.category.nameFa, "پیش‌نمایش آزمایشی"],
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
    qualities:
      index === 0
        ? [
            {
              label: "۱۰۸۰p",
              width: 1920,
              height: 1080,
              mimeType: "video/mp4",
              codec: "H.264",
            },
            {
              label: "۴K",
              width: 3840,
              height: 2160,
              mimeType: "video/mp4",
              codec: "H.264",
            },
          ]
        : [],
    dataSource: "development-fixture",
  };
}
