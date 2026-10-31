import type { CustomerSessionStatusProps } from "@/app/session/customer-session-status.types";
import {
  selectUiMockScenario,
  type UiMockResult,
  type UiMockScenario,
} from "@/modules/ui-mock/scenarios";

export type CustomerSessionMock = CustomerSessionStatusProps & {
  status: "anonymous" | "authenticated" | "pending" | "error";
};

export type PurchasePresentationMock = {
  footageId: string;
  titleFa: string;
  priceToman: number;
  status: "idle" | "pending" | "failed" | "verified";
  messageFa: string;
};

export type LibraryPresentationMock = {
  items: Array<{
    footageId: string;
    titleFa: string;
    purchasedAt: string;
    files: Array<{ label: string; status: "available" | "unavailable" }>;
  }>;
};

export type InvoicePresentationMock = {
  invoiceNumber: string;
  orderReference: string;
  purchasedAt: string;
  titleSnapshotFa: string;
  amountToman: number;
  maskedPhone: string;
  paymentStatus: "verified";
};

export const customerSessionFixtures: Record<
  "populated" | "empty" | "unavailable",
  CustomerSessionMock
> = {
  populated: {
    status: "authenticated",
    heading: "نشست مشتری برقرار است",
    continueHref: "/footage/پرواز-پرندگان-بر-فراز-کوهستان",
  },
  empty: { status: "anonymous", heading: "برای ادامه وارد شوید" },
  unavailable: {
    status: "error",
    heading: "وضعیت نشست فعلاً در دسترس نیست",
  },
};

export const purchasePresentationFixture: PurchasePresentationMock = {
  footageId: "ftg-public-001",
  titleFa: "پرواز پرندگان بر فراز کوهستان در صبح مه‌آلود",
  priceToman: 450_000,
  status: "idle",
  messageFa: "قیمت از اطلاعات معتبر فوتیج نمایش داده می‌شود.",
};

export const libraryPresentationFixture: LibraryPresentationMock = {
  items: [
    {
      footageId: "ftg-public-001",
      titleFa: "پرواز پرندگان بر فراز کوهستان در صبح مه‌آلود",
      purchasedAt: "2026-10-03T14:20:00.000Z",
      files: [
        { label: "1080p", status: "available" },
        { label: "4K", status: "available" },
      ],
    },
  ],
};

export const invoicePresentationFixture: InvoicePresentationMock = {
  invoiceNumber: "INV-2026-00041",
  orderReference: "ORD-2026-00041",
  purchasedAt: "2026-10-03T14:20:00.000Z",
  titleSnapshotFa: "پرواز پرندگان بر فراز کوهستان در صبح مه‌آلود",
  amountToman: 450_000,
  maskedPhone: "۰۹۱۲***۴۵۶۷",
  paymentStatus: "verified",
};

export function loadCustomerSessionMock(
  scenario: UiMockScenario = "populated",
): UiMockResult<CustomerSessionMock> {
  return selectUiMockScenario(scenario, {
    populated: customerSessionFixtures.populated,
    empty: customerSessionFixtures.empty,
    unavailable: customerSessionFixtures.unavailable,
    errorMessageFa: "وضعیت نشست قابل دریافت نیست.",
  });
}

export function loadPurchaseMock(
  scenario: UiMockScenario = "populated",
): UiMockResult<PurchasePresentationMock> {
  return selectUiMockScenario(scenario, {
    populated: purchasePresentationFixture,
    empty: { ...purchasePresentationFixture, status: "idle" },
    unavailable: { ...purchasePresentationFixture, status: "failed" },
    errorMessageFa: "وضعیت خرید قابل نمایش نیست.",
  });
}

export function loadLibraryMock(
  scenario: UiMockScenario = "populated",
): UiMockResult<LibraryPresentationMock> {
  return selectUiMockScenario(scenario, {
    populated: libraryPresentationFixture,
    empty: { items: [] },
    unavailable: null,
    errorMessageFa: "کتابخانه فعلاً قابل دریافت نیست.",
  });
}

export function loadInvoiceMock(
  scenario: UiMockScenario = "populated",
): UiMockResult<InvoicePresentationMock> {
  return selectUiMockScenario(scenario, {
    populated: invoicePresentationFixture,
    empty: invoicePresentationFixture,
    unavailable: null,
    errorMessageFa: "رسید خرید فعلاً قابل دریافت نیست.",
  });
}
