import {
  publicFootageFixtures,
  publicMediaUnavailableFixture,
} from "@/modules/ui-mock/fixtures/public-footage";

import type { PublicFootageDetail } from "./public-footage-detail.types";

const detailCopy = {
  descriptionFa:
    "پروازی آرام بر فراز خط کوهستان؛ مناسب برای آغاز روایت‌های سفر، طبیعت و مستندهای کوتاه.",
  tagsFa: ["کوهستان", "پرندگان", "مه صبحگاهی", "طبیعت"],
  resolution: "4K UHD",
  frameRate: "25 fps",
  format: "MP4 · H.264",
  qualities: ["1080p", "4K", "Master"],
} as const;

/** Loads deterministic public-only detail data without querying production sources. */
export function preparePublicFootageDetail(
  slug: string,
  scenario: "ready" | "unavailable" = "ready",
): PublicFootageDetail | null {
  const footage = publicFootageFixtures.find((item) => item.slug === slug);
  if (!footage) return null;

  if (scenario === "unavailable") {
    return {
      ...footage,
      cover: {
        status: "unavailable",
        altFa: publicMediaUnavailableFixture.cover.altFa,
      },
      preview: { status: "unavailable" },
      ...detailCopy,
    };
  }

  return { ...footage, ...detailCopy };
}

/** Returns the deterministic category options used by the existing public shell. */
export function preparePublicFootageCategories() {
  return Array.from(
    new Map(
      publicFootageFixtures.map((item) => [
        item.category.slug,
        item.category.nameFa,
      ]),
    ),
  ).map(([value, labelFa]) => ({ value, labelFa }));
}
