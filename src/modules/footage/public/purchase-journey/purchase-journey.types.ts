import type { PublicFootageDetail } from "../detail/public-footage-detail.types";

export const purchaseJourneyStates = [
  "review",
  "initiating",
  "init-failed",
  "pending",
  "returned",
  "verification-pending",
  "verification-failed",
  "failure",
  "success",
] as const;

export type PurchaseJourneyState = (typeof purchaseJourneyStates)[number];

export type PurchaseJourneyProps = {
  footage: PublicFootageDetail;
  initialState: PurchaseJourneyState;
  authenticated: boolean;
};

export type PurchaseSnapshot = Pick<
  PublicFootageDetail,
  "id" | "slug" | "titleFa" | "priceToman" | "qualities" | "category"
> & {
  cover: Extract<PublicFootageDetail["cover"], { status: "ready" }>;
};
