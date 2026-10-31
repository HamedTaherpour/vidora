import {
  selectUiMockScenario,
  type UiMockResult,
} from "@/modules/ui-mock/scenarios";
import type {
  CustomerFileState,
  CustomerInvoice,
  CustomerLibraryItem,
  CustomerLibraryScenario,
  CustomerPurchaseDetail,
} from "./types";

const coverSvg = (background: string, foreground: string, label: string) =>
  `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 450'%3E%3Crect width='800' height='450' fill='${background}'/%3E%3Ccircle cx='620' cy='90' r='130' fill='${foreground}' opacity='.28'/%3E%3Cpath d='M0 360 210 230 390 330 560 190 800 360V450H0Z' fill='${foreground}' opacity='.45'/%3E%3Ctext x='48' y='390' fill='white' font-size='30' font-family='sans-serif'%3E${label}%3C/text%3E%3C/svg%3E`;

export const customerLibraryFixtures: CustomerLibraryItem[] = [
  {
    footageId: "ftg-public-001",
    titleFa: "پرواز پرندگان بر فراز کوهستان در صبح مه‌آلود",
    coverSrc: coverSvg("%231d3557", "%23f4a261", "VIDORA / NATURE"),
    coverAltFa: "چشم‌انداز کوهستان و پرواز پرندگان",
    purchasedAt: "2026-10-03T14:20:00.000Z",
    purchaseReference: "PUR-2026-00041",
    priceToman: 450_000,
  },
  {
    footageId: "ftg-public-002",
    titleFa: "حرکت آرام دوربین در خیابان‌های بارانی تهران",
    coverSrc: coverSvg("%23264053", "%23e9c46a", "VIDORA / CITY"),
    coverAltFa: "خیابان شهری در نور بارانی",
    purchasedAt: "2026-09-18T09:05:00.000Z",
    purchaseReference: "PUR-2026-00028",
    priceToman: 320_000,
  },
  {
    footageId: "ftg-public-003",
    titleFa: "نور طلایی و سایه‌های بلند روی شن‌های کویر مرنجاب",
    coverSrc: coverSvg("%23a44a3f", "%23f6bd60", "VIDORA / TRAVEL"),
    coverAltFa: "تپه‌های شنی در نور طلایی",
    purchasedAt: "2026-08-22T16:40:00.000Z",
    purchaseReference: "PUR-2026-00017",
    priceToman: 275_000,
  },
];

export const customerPurchaseDetailFixture: CustomerPurchaseDetail = {
  ...customerLibraryFixtures[0]!,
  files: [
    {
      label: "1080p",
      format: "MP4 · H.264",
      dimensions: "1920×1080",
      state: "available",
    },
    {
      label: "4K",
      format: "MP4 · H.265",
      dimensions: "3840×2160",
      state: "available",
    },
    {
      label: "Master",
      format: "MOV · ProRes",
      dimensions: "3840×2160",
      state: "unavailable",
    },
  ],
};

export const customerInvoiceFixture: CustomerInvoice = {
  orderReference: "ORD-2026-00041",
  purchaseReference: "PUR-2026-00041",
  purchasedAt: "2026-10-03T14:20:00.000Z",
  titleSnapshotFa: customerPurchaseDetailFixture.titleFa,
  amountToman: customerPurchaseDetailFixture.priceToman,
  maskedPhone: "۰۹۱۲***۴۵۶۷",
  status: "fixture",
};

export function loadCustomerLibraryMock(
  scenario: CustomerLibraryScenario = "populated",
): UiMockResult<CustomerLibraryItem[]> {
  if (scenario === "one-purchase") {
    return {
      scenario: "populated",
      status: "ready",
      data: [structuredClone(customerLibraryFixtures[0]!)],
    };
  }

  if (scenario === "unauthenticated") {
    return {
      scenario: "unavailable",
      status: "unavailable",
      data: null,
      messageFa: "برای مشاهده کتابخانه، ابتدا وارد حساب کاربری شوید.",
    };
  }

  return selectUiMockScenario(scenario, {
    populated: customerLibraryFixtures,
    empty: [],
    unavailable: null,
    errorMessageFa: "کتابخانه فعلاً قابل دریافت نیست.",
  });
}

export function resolveCustomerFileState(state: CustomerFileState) {
  if (state === "available") return customerPurchaseDetailFixture;
  if (state === "unavailable")
    return {
      ...customerPurchaseDetailFixture,
      files: customerPurchaseDetailFixture.files.map((file) => ({
        ...file,
        state: "unavailable" as const,
      })),
    };
  return null;
}
