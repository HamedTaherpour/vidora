import type { PublicFootageCatalogItem } from "./public-footage-catalog-store";

/** Development-only catalogue data. It is never selected when NODE_ENV=production. */
const developmentRows: ReadonlyArray<[string, string, string, number]> = [
  ["پرواز آرام بر فراز کوهستان", "nature", "طبیعت", 20],
  ["خیابان بارانی در شب", "urban", "شهر", 45],
  ["ساحل طلایی در ساعت آبی", "nature", "طبیعت", 30],
  ["رفت‌وآمد مردم در میدان", "people", "آدم‌ها", 18],
  ["نمای هوایی از جادهٔ کویری", "aerial", "هوایی", 60],
  ["نورهای نئونی شهر", "urban", "شهر", 24],
  ["باد در میان گندم‌زار", "nature", "طبیعت", 36],
  ["دست‌ها و ساختن یک ایده", "people", "آدم‌ها", 28],
  ["ابرها از پنجرهٔ هواپیما", "aerial", "هوایی", 42],
  ["حرکت نرم دوربین در کوچه", "urban", "شهر", 32],
  ["صبح مه‌آلود کنار دریاچه", "nature", "طبیعت", 55],
  ["سایه‌ها روی دیوار سفید", "abstract", "انتزاعی", 15],
  ["قطار در دوردست", "urban", "شهر", 48],
  ["پرتره‌ای در نور پنجره", "people", "آدم‌ها", 25],
  ["خط ساحل از نمای بالا", "aerial", "هوایی", 38],
];

const developmentImages = [
  "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=960&q=80",
  "https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=960&q=80",
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=960&q=80",
  "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=960&q=80",
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=960&q=80",
  "https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=960&q=80",
  "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=960&q=80",
  "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=960&q=80",
  "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=960&q=80",
  "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=960&q=80",
  "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=960&q=80",
  "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=960&q=80",
  "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=960&q=80",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=960&q=80",
  "https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?auto=format&fit=crop&w=960&q=80",
];

const developmentPreviewUrl =
  "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";

export const publicFootageDevelopmentFixtures: PublicFootageCatalogItem[] =
  developmentRows.map(([titleFa, slug, nameFa, durationSeconds], index) => ({
    id: `development-footage-${index + 1}`,
    slug: `development-footage-${index + 1}`,
    titleFa,
    priceToman: 220_000 + index * 15_000,
    durationSeconds,
    category: { slug, nameFa },
    cover: {
      status: "ready" as const,
      src: developmentImages[index],
      altFa: `تصویر نمایشی برای ${titleFa}`,
    },
    preview:
      index < 3
        ? { status: "ready" as const, videoUrl: developmentPreviewUrl }
        : { status: "unavailable" as const },
  }));
