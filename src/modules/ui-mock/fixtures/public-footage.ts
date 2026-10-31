import type { PublicFootageCatalogItem } from "@/modules/footage/public/catalog/public-footage-catalog-store";
import {
  selectUiMockScenario,
  type UiMockResult,
  type UiMockScenario,
} from "@/modules/ui-mock/scenarios";

const COVER_FOREST =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1600 900'%3E%3Crect width='1600' height='900' fill='%231d3557'/%3E%3Ccircle cx='1240' cy='180' r='130' fill='%23f4a261'/%3E%3Cpath d='M0 700 420 360 760 700 1040 420 1600 900H0Z' fill='%232a9d8f'/%3E%3C/svg%3E";
const COVER_CITY =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1600 900'%3E%3Crect width='1600' height='900' fill='%23457794'/%3E%3Crect y='640' width='1600' height='260' fill='%231b4965'/%3E%3Cpath d='M100 640V300h180v340M390 640V180h220v460M720 640V360h160v280M980 640V220h230v420M1320 640V130h150v510' fill='%23f1faee' opacity='.8'/%3E%3C/svg%3E";
const COVER_DESERT =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1600 900'%3E%3Crect width='1600' height='900' fill='%23e9c46a'/%3E%3Ccircle cx='300' cy='190' r='120' fill='%23e76f51'/%3E%3Cpath d='M0 700 Q400 470 800 700 T1600 700V900H0Z' fill='%23c97c5d'/%3E%3C/svg%3E";

export const publicFootageFixtures = [
  {
    id: "ftg-public-001",
    slug: "پرواز-پرندگان-بر-فراز-کوهستان",
    titleFa: "پرواز پرندگان بر فراز کوهستان در صبح مه‌آلود",
    priceToman: 450_000,
    category: { slug: "nature", nameFa: "طبیعت" },
    cover: {
      status: "ready",
      src: COVER_FOREST,
      altFa: "نمایی از کوهستان و آسمان صبحگاهی",
    },
    preview: { status: "ready" },
  },
  {
    id: "ftg-public-002",
    slug: "حرکت-آرام-دوربین-در-خیابان-تهران",
    titleFa: "حرکت آرام دوربین در خیابان‌های بارانی تهران",
    priceToman: 320_000,
    category: { slug: "urban", nameFa: "شهری" },
    cover: {
      status: "ready",
      src: COVER_CITY,
      altFa: "ساختمان‌های شهری در نور غروب",
    },
    preview: { status: "unavailable" },
  },
  {
    id: "ftg-public-003",
    slug: "نور-طلایی-در-کویر-مرنجاب",
    titleFa: "نور طلایی و سایه‌های بلند روی شن‌های کویر مرنجاب",
    priceToman: 275_000,
    category: { slug: "travel", nameFa: "سفر" },
    cover: {
      status: "ready",
      src: COVER_DESERT,
      altFa: "تپه‌های شنی کویر در نور طلایی",
    },
    preview: { status: "ready" },
  },
  {
    id: "ftg-public-004",
    slug: "نور-نئون-در-آزمایشگاه-فناوری",
    titleFa: "نورهای نئون و تجهیزات مدرن در آزمایشگاه فناوری",
    priceToman: 390_000,
    category: { slug: "technology", nameFa: "تکنولوژی" },
    cover: {
      status: "ready",
      src: COVER_CITY,
      altFa: "تجهیزات مدرن در فضای آزمایشگاهی",
    },
    preview: { status: "ready" },
  },
  {
    id: "ftg-public-005",
    slug: "جلسه-تیمی-در-دفتر-روشن",
    titleFa: "همکاری تیمی در یک دفتر روشن و مدرن",
    priceToman: 360_000,
    category: { slug: "business", nameFa: "کسب‌وکار" },
    cover: {
      status: "ready",
      src: COVER_FOREST,
      altFa: "همکاری گروهی در محیط کاری روشن",
    },
    preview: { status: "ready" },
  },
  {
    id: "ftg-public-006",
    slug: "دویدن-در-مسیر-جنگلی",
    titleFa: "دویدن ورزشکار در مسیر جنگلی صبحگاهی",
    priceToman: 285_000,
    category: { slug: "sports", nameFa: "ورزش" },
    cover: {
      status: "ready",
      src: COVER_FOREST,
      altFa: "ورزشکار در مسیر جنگلی",
    },
    preview: { status: "ready" },
  },
  {
    id: "ftg-public-007",
    slug: "چیدمان-غذا-روی-میز-چوبی",
    titleFa: "چیدمان اشتهابرانگیز غذا روی میز چوبی",
    priceToman: 240_000,
    category: { slug: "food", nameFa: "غذا" },
    cover: {
      status: "ready",
      src: COVER_DESERT,
      altFa: "چیدمان غذا روی میز چوبی",
    },
    preview: { status: "ready" },
  },
  {
    id: "ftg-public-008",
    slug: "صبح-آرام-در-خانه-روشن",
    titleFa: "صبح آرام و نور طبیعی در یک خانه روشن",
    priceToman: 260_000,
    category: { slug: "lifestyle", nameFa: "سبک زندگی" },
    cover: {
      status: "ready",
      src: COVER_FOREST,
      altFa: "نور طبیعی در فضای خانه",
    },
    preview: { status: "ready" },
  },
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
