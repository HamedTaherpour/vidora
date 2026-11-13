import type { PublicFootageCatalogItem } from "./public-footage-catalog-store";

export const publicFootageTestFixtures: PublicFootageCatalogItem[] = [
  ...Array.from({ length: 24 }, (_, index) => ({
    id: `test-footage-${index + 1}`,
    slug: `test-footage-${index + 1}`,
    titleFa: index === 1 ? "خیابان بارانی" : `فوتیج آزمایشی ${index + 1}`,
    priceToman: 220_000 + index * 5_000,
    durationSeconds: index % 2 === 0 ? 20 : 45,
    category: {
      slug: index === 1 ? "urban" : "nature",
      nameFa: index === 1 ? "شهر" : "طبیعت",
    },
    cover: { status: "unavailable" as const, altFa: "تصویر آزمایشی" },
    preview: { status: "unavailable" as const },
  })),
  {
    id: "test-footage-450",
    slug: "test-footage-450",
    titleFa: "فوتیج گران‌تر",
    priceToman: 450_000,
    durationSeconds: 20,
    category: { slug: "nature", nameFa: "طبیعت" },
    cover: { status: "unavailable", altFa: "تصویر آزمایشی" },
    preview: { status: "unavailable" },
  },
];
