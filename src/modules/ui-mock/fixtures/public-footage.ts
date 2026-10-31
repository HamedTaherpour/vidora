import type { PublicFootageCatalogItem } from "@/modules/footage/public/catalog/public-footage-catalog-store";
import {
  selectUiMockScenario,
  type UiMockResult,
  type UiMockScenario,
} from "@/modules/ui-mock/scenarios";

const COVER_FOREST =
  "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1280&h=720&q=80";
const COVER_CITY =
  "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1280&h=720&q=80";
const COVER_DESERT =
  "https://images.unsplash.com/photo-1509316785289-025f5b846b35?auto=format&fit=crop&w=1280&h=720&q=80";
const PREVIEWS = [
  "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
  "https://www.w3schools.com/html/mov_bbb.mp4",
  "https://media.w3.org/2010/05/bunny/trailer.mp4",
] as const;

const featuredPublicFootageFixtures = [
  {
    id: "ftg-public-001",
    slug: "پرواز-پرندگان-بر-فراز-کوهستان",
    titleFa: "پرواز پرندگان بر فراز کوهستان در صبح مه‌آلود",
    priceToman: 450_000,
    durationSeconds: 24,
    category: { slug: "nature", nameFa: "طبیعت" },
    cover: {
      status: "ready",
      src: COVER_FOREST,
      altFa: "نمایی از کوهستان و آسمان صبحگاهی",
    },
    preview: { status: "ready", videoUrl: PREVIEWS[0] },
  },
  {
    id: "ftg-public-002",
    slug: "حرکت-آرام-دوربین-در-خیابان-تهران",
    titleFa: "حرکت آرام دوربین در خیابان‌های بارانی تهران",
    priceToman: 320_000,
    durationSeconds: 31,
    category: { slug: "urban", nameFa: "شهری" },
    cover: {
      status: "ready",
      src: COVER_CITY,
      altFa: "ساختمان‌های شهری در نور غروب",
    },
    preview: { status: "ready", videoUrl: PREVIEWS[1] },
  },
  {
    id: "ftg-public-003",
    slug: "نور-طلایی-در-کویر-مرنجاب",
    titleFa: "نور طلایی و سایه‌های بلند روی شن‌های کویر مرنجاب",
    priceToman: 275_000,
    durationSeconds: 18,
    category: { slug: "travel", nameFa: "سفر" },
    cover: {
      status: "ready",
      src: COVER_DESERT,
      altFa: "تپه‌های شنی کویر در نور طلایی",
    },
    preview: { status: "ready", videoUrl: PREVIEWS[2] },
  },
  {
    id: "ftg-public-004",
    slug: "نور-نئون-در-آزمایشگاه-فناوری",
    titleFa: "نورهای نئون و تجهیزات مدرن در آزمایشگاه فناوری",
    priceToman: 390_000,
    durationSeconds: 42,
    category: { slug: "technology", nameFa: "تکنولوژی" },
    cover: {
      status: "ready",
      src: COVER_CITY,
      altFa: "تجهیزات مدرن در فضای آزمایشگاهی",
    },
    preview: { status: "ready", videoUrl: PREVIEWS[0] },
  },
  {
    id: "ftg-public-005",
    slug: "جلسه-تیمی-در-دفتر-روشن",
    titleFa: "همکاری تیمی در یک دفتر روشن و مدرن",
    priceToman: 360_000,
    durationSeconds: 27,
    category: { slug: "business", nameFa: "کسب‌وکار" },
    cover: {
      status: "ready",
      src: COVER_FOREST,
      altFa: "همکاری گروهی در محیط کاری روشن",
    },
    preview: { status: "ready", videoUrl: PREVIEWS[1] },
  },
  {
    id: "ftg-public-006",
    slug: "دویدن-در-مسیر-جنگلی",
    titleFa: "دویدن ورزشکار در مسیر جنگلی صبحگاهی",
    priceToman: 285_000,
    durationSeconds: 36,
    category: { slug: "sports", nameFa: "ورزش" },
    cover: {
      status: "ready",
      src: COVER_FOREST,
      altFa: "ورزشکار در مسیر جنگلی",
    },
    preview: { status: "ready", videoUrl: PREVIEWS[2] },
  },
  {
    id: "ftg-public-007",
    slug: "چیدمان-غذا-روی-میز-چوبی",
    titleFa: "چیدمان اشتهابرانگیز غذا روی میز چوبی",
    priceToman: 240_000,
    durationSeconds: 22,
    category: { slug: "food", nameFa: "غذا" },
    cover: {
      status: "ready",
      src: COVER_DESERT,
      altFa: "چیدمان غذا روی میز چوبی",
    },
    preview: { status: "ready", videoUrl: PREVIEWS[0] },
  },
  {
    id: "ftg-public-008",
    slug: "صبح-آرام-در-خانه-روشن",
    titleFa: "صبح آرام و نور طبیعی در یک خانه روشن",
    priceToman: 260_000,
    durationSeconds: 29,
    category: { slug: "lifestyle", nameFa: "سبک زندگی" },
    cover: {
      status: "ready",
      src: COVER_FOREST,
      altFa: "نور طبیعی در فضای خانه",
    },
    preview: { status: "ready", videoUrl: PREVIEWS[1] },
  },
] satisfies readonly PublicFootageCatalogItem[];

const extraThemes = [
  ["nature", "طبیعت", "آرامش در چشم‌اندازهای بکر"],
  ["urban", "شهری", "ریتم زندگی در معماری مدرن"],
  ["travel", "سفر", "مسیرهای تازه برای کشف کردن"],
  ["technology", "تکنولوژی", "جزئیات آینده در قاب نزدیک"],
  ["business", "کسب‌وکار", "همکاری خلاقانه در یک روز کاری"],
  ["sports", "ورزش", "انرژی حرکت در فضای باز"],
  ["food", "غذا", "رنگ و بافت یک میز صمیمی"],
  ["lifestyle", "سبک زندگی", "نور نرم در یک صبح آرام"],
] as const;
const extraImages = [
  "photo-1500534623283-312aade485b7",
  "photo-1494526585095-c41746248156",
  "photo-1501785888041-af3ef285b470",
  "photo-1518770660439-4636190af475",
  "photo-1497366811353-6870744d04b2",
  "photo-1517964603305-11c0f6f66012",
  "photo-1547592180-85f173990554",
  "photo-1494438639946-1ebd1d20bf85",
  "photo-1500530855697-b586d89ba3ee",
  "photo-1519501025264-65ba15a82390",
  "photo-1500534314209-a25ddb2bd429",
  "photo-1531297484001-80022131f5a1",
  "photo-1521737711867-e3b97375f902",
  "photo-1534438327276-14e5300c3a48",
  "photo-1515003197210-e0cd71810b5f",
  "photo-1505693416388-ac5ce068fe85",
  "photo-1526778548025-fa2f459cd5c1",
  "photo-1521292270410-a8c4d716d518",
  "photo-1470071459604-3b5ec3a7fe05",
  "photo-1519681393784-d120267933ba",
  "photo-1500534623283-312aade485b7",
  "photo-1494526585095-c41746248156",
  "photo-1501785888041-af3ef285b470",
  "photo-1518770660439-4636190af475",
  "photo-1497366811353-6870744d04b2",
  "photo-1517964603305-11c0f6f66012",
  "photo-1547592180-85f173990554",
  "photo-1494438639946-1ebd1d20bf85",
] as const;

export const publicFootageFixtures = [
  ...featuredPublicFootageFixtures,
  ...extraImages.map((image, index) => {
    const [category, nameFa, titleFa] = extraThemes[index % extraThemes.length];
    return {
      id: `ftg-public-${String(index + 9).padStart(3, "0")}`,
      slug: `فوتیج-${index + 9}`,
      titleFa,
      priceToman: 220_000 + (index % 7) * 35_000,
      durationSeconds: 20 + (index % 8) * 6,
      category: { slug: category, nameFa },
      cover: {
        status: "ready" as const,
        src: `https://images.unsplash.com/${image}?auto=format&fit=crop&w=1280&h=720&q=80`,
        altFa: titleFa,
      },
      preview: {
        status: "ready" as const,
        videoUrl: PREVIEWS[index % PREVIEWS.length],
      },
    };
  }),
] satisfies readonly PublicFootageCatalogItem[];

export type PublicMediaUnavailableFixture = {
  footageId: string;
  titleFa: string;
  categoryNameFa: string;
  cover: { status: "unavailable"; altFa: string };
  preview: { status: "unavailable"; messageFa: string };
};

export const publicMediaUnavailableFixture: PublicMediaUnavailableFixture = {
  footageId: "ftg-public-004",
  titleFa: "عنوان طولانی برای بررسی چیدمان در صفحه‌های باریک و RTL",
  categoryNameFa: "مستند",
  cover: {
    status: "unavailable",
    altFa: "تصویر جلد این فوتیج در دسترس نیست",
  },
  preview: {
    status: "unavailable",
    messageFa: "پیش‌نمایش این فوتیج فعلاً آماده پخش نیست.",
  },
};

export function loadPublicFootageMock(
  scenario: UiMockScenario = "populated",
): UiMockResult<PublicFootageCatalogItem[]> {
  return selectUiMockScenario(scenario, {
    populated: [...publicFootageFixtures],
    empty: [],
    unavailable: [
      {
        ...publicFootageFixtures[1],
        cover: {
          status: "unavailable" as const,
          altFa: "تصویر جلد این فوتیج در دسترس نیست",
        },
      },
    ],
  });
}
