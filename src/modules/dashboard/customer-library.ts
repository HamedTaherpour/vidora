import type { PublicFootageCatalogItem } from "@/modules/footage/public/catalog/public-footage-catalog-store";

import { CUSTOMER_DASHBOARD_ROUTES } from "./dashboard-navigation";

export type CustomerLibraryDataState = "empty" | "unavailable" | "error";

export type CustomerLibraryStateCopy = {
  title: string;
  description: string;
};

/** Filters only the already-authorized library collection. */
export function filterCustomerLibraryItems(
  items: ReadonlyArray<PublicFootageCatalogItem>,
  query: string,
) {
  const normalizedQuery = normalizePersianText(query);
  if (!normalizedQuery) return [...items];

  return items.filter((item) =>
    normalizePersianText(
      [item.titleFa, item.category.nameFa, item.slug].join(" "),
    ).includes(normalizedQuery),
  );
}

/** Builds a safe customer-owned detail destination for a library card. */
export function createCustomerLibraryDetailHref(reference: string) {
  return `${CUSTOMER_DASHBOARD_ROUTES.library}/${encodeURIComponent(reference)}`;
}

function normalizePersianText(value: string) {
  return value
    .replace(/[يى]/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/[\u064B-\u065F\u0670]/g, "")
    .replace(/[\u200C\u200E\u200F]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLocaleLowerCase("fa-IR");
}

/** Keeps library presentation honest when the authorized purchase source varies. */
export function getCustomerLibraryStateCopy(
  state: CustomerLibraryDataState,
): CustomerLibraryStateCopy {
  if (state === "empty") {
    return {
      title: "هنوز فوتیجی در کتابخانه ندارید",
      description:
        "پس از خرید، فوتیج‌های شما همراه با کیفیت‌های قابل دانلود در این بخش نمایش داده می‌شوند.",
    };
  }

  if (state === "error") {
    return {
      title: "نمایش کتابخانه ممکن نیست",
      description: "لطفاً بعداً دوباره تلاش کنید.",
    };
  }

  return {
    title: "کتابخانهٔ شما فعلاً در دسترس نیست",
    description:
      "منبع مجاز خریدهای شما هنوز آماده نیست؛ هیچ فوتیج یا لینک دانلودی به‌صورت ساختگی نمایش داده نمی‌شود.",
  };
}
