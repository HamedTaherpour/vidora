import type { RequiredCustomer } from "@/modules/auth/authorization/require-current-customer";

export type CustomerPurchaseState = "empty" | "unavailable" | "error";

export type CustomerDashboardProps = {
  customer: RequiredCustomer;
  purchaseState: CustomerPurchaseState;
};

export type CustomerPurchaseStateCopy = {
  summary: string;
  description: string;
  title: string;
  emptyDescription: string;
};
