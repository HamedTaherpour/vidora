export const CUSTOMER_LIBRARY_SCREENS = [
  "library",
  "detail",
  "invoice",
] as const;

export type CustomerLibraryScreen = (typeof CUSTOMER_LIBRARY_SCREENS)[number];

export const CUSTOMER_LIBRARY_SCENARIOS = [
  "populated",
  "one-purchase",
  "empty",
  "loading",
  "error",
  "unauthenticated",
] as const;

export type CustomerLibraryScenario =
  (typeof CUSTOMER_LIBRARY_SCENARIOS)[number];

export type CustomerFileState =
  "available" | "unavailable" | "access-denied" | "not-found";

export type CustomerDownloadState = "idle" | "pending" | "denied" | "success";

export type CustomerLibraryItem = {
  footageId: string;
  titleFa: string;
  coverSrc: string;
  coverAltFa: string;
  purchasedAt: string;
  purchaseReference: string;
  priceToman: number;
};

export type CustomerFileVariant = {
  label: string;
  format: string;
  dimensions: string;
  state: "available" | "unavailable";
};

export type CustomerPurchaseDetail = CustomerLibraryItem & {
  files: CustomerFileVariant[];
};

export type CustomerInvoice = {
  orderReference: string;
  purchaseReference: string;
  purchasedAt: string;
  titleSnapshotFa: string;
  amountToman: number;
  maskedPhone: string;
  status: "fixture";
};
