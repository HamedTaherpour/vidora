import { describe, expect, it } from "vitest";

import {
  filterCustomerOrders,
  createCustomerOrdersHref,
  getCustomerOrderPageCount,
  getCustomerOrdersPageItems,
  getCustomerOrdersSearchQuery,
  getCustomerOrdersStatus,
  normalizeCustomerOrderSearchText,
} from "./customer-orders";
import type { CustomerOrder } from "./customer-orders.types";

const orders: CustomerOrder[] = [
  {
    reference: "ORD-1405-0001",
    titleSnapshot: "پرواز آرام بر فراز کوهستان",
    purchaseDate: "2026-10-24T10:00:00.000Z",
    amountToman: 220000,
    paymentStatus: "paid",
    paymentReference: "PAY-1405-0001",
    invoice: {
      number: "INV-1405-0001",
      orderReference: "ORD-1405-0001",
      purchaseDate: "2026-10-24T10:00:00.000Z",
      titleSnapshot: "پرواز آرام بر فراز کوهستان",
      amountToman: 220000,
      paymentStatus: "paid",
      paymentReference: "PAY-1405-0001",
      maskedCustomerPhone: "+98 912 *** 6789",
    },
  },
  {
    reference: "ORD-1405-0002",
    titleSnapshot: "خیابان بارانی در شب",
    purchaseDate: "2026-10-23T10:00:00.000Z",
    amountToman: 235000,
    paymentStatus: "pending",
    invoice: null,
  },
];

describe("customer orders presentation contract", () => {
  it("normalizes Persian and Arabic text for search", () => {
    expect(normalizeCustomerOrderSearchText(" كوهستان ١٢ ")).toBe("کوهستان 12");
  });

  it("searches order references and historical titles", () => {
    expect(filterCustomerOrders(orders, "0001")).toHaveLength(1);
    expect(filterCustomerOrders(orders, "بارانی")).toHaveLength(1);
    expect(filterCustomerOrders(orders, "", "pending")).toHaveLength(1);
  });

  it("accepts only known URL status and page values", () => {
    expect(getCustomerOrdersStatus("pending")).toBe("pending");
    expect(getCustomerOrdersStatus("paid")).toBe("paid");
    expect(getCustomerOrdersStatus("unknown")).toBe("all");
    expect(getCustomerOrdersSearchQuery(["  کوهستان ", "ignored"])).toBe(
      "کوهستان",
    );
  });

  it("paginates deterministically and clamps the page", () => {
    expect(getCustomerOrderPageCount(11, 5)).toBe(3);
    expect(getCustomerOrdersPageItems(orders, 1, 1)).toHaveLength(1);
    expect(getCustomerOrdersPageItems(orders, 9, 1)).toHaveLength(1);
  });

  it("resets the URL page when search or filters change", () => {
    expect(
      createCustomerOrdersHref({ query: "بارانی", status: "pending", page: 1 }),
    ).toBe(
      "/dashboard/orders?q=%D8%A8%D8%A7%D8%B1%D8%A7%D9%86%DB%8C&status=pending",
    );
    expect(
      createCustomerOrdersHref({ query: "", status: "all", page: 1 }),
    ).toBe("/dashboard/orders");
  });
});
