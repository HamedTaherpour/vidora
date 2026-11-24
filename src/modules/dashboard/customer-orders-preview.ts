import "server-only";

import {
  isDevelopmentAuthBypassEnabled,
  isDevelopmentAuthBypassIdentity,
} from "@/modules/auth/development/dev-auth-bypass";
import type { RequiredCustomer } from "@/modules/auth/authorization/authorization";
import type {
  CustomerOrder,
  CustomerOrdersSource,
} from "./customer-orders.types";

const titles = [
  "پرواز آرام بر فراز کوهستان",
  "خیابان بارانی در شب",
  "ساحل طلایی در ساعت آبی",
  "رفت‌وآمد مردم در میدان",
  "نمای هوایی از جادهٔ کویری",
  "نورهای نئونی شهر",
  "باد در میان گندم‌زار",
  "دست‌ها و ساختن یک ایده",
  "ابرها از پنجرهٔ هواپیما",
];

const statuses = [
  "paid",
  "pending",
  "failed",
  "paid",
  "pending",
  "paid",
  "failed",
  "paid",
  "pending",
] as const;

function createPreviewOrders(): readonly CustomerOrder[] {
  return titles.map((titleSnapshot, index) => {
    const paymentStatus = statuses[index];
    const reference = `ORD-1405-${String(index + 1).padStart(4, "0")}`;
    const purchaseDate = new Date(
      Date.UTC(2026, 9, 24 - index, 10, 0),
    ).toISOString();
    const amountToman = 220_000 + index * 15_000;
    const hasInvoice = paymentStatus === "paid" && index !== 5;

    return {
      reference,
      titleSnapshot,
      purchaseDate,
      amountToman,
      paymentStatus,
      paymentReference:
        paymentStatus === "paid"
          ? `PAY-1405-${String(index + 1).padStart(4, "0")}`
          : undefined,
      invoice: hasInvoice
        ? {
            number: `INV-1405-${String(index + 1).padStart(4, "0")}`,
            orderReference: reference,
            purchaseDate,
            titleSnapshot,
            amountToman,
            paymentStatus,
            paymentReference: `PAY-1405-${String(index + 1).padStart(4, "0")}`,
            maskedCustomerPhone: "+98 912 *** 6789",
          }
        : null,
    };
  });
}

/** Returns presentation-only orders for the explicit local preview identity. */
export function getCustomerOrdersPreview(
  customer: RequiredCustomer,
  environment: {
    NODE_ENV: string | undefined;
    DEV_AUTH_BYPASS: string | undefined;
  } = {
    NODE_ENV: process.env.NODE_ENV,
    DEV_AUTH_BYPASS: process.env.DEV_AUTH_BYPASS,
  },
): CustomerOrdersSource {
  if (
    !isDevelopmentAuthBypassEnabled(environment) ||
    !isDevelopmentAuthBypassIdentity(customer)
  ) {
    return { status: "unavailable" };
  }

  return { status: "preview", orders: createPreviewOrders() };
}
