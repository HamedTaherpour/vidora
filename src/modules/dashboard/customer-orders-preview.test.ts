import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { getCustomerOrdersPreview } from "./customer-orders-preview";

const previewCustomer = {
  status: "authenticated" as const,
  userId: "dev-user-bypass",
  phone: "+989000000001",
  expiresAt: new Date("2026-11-24T00:00:00.000Z"),
  isDevelopmentBypass: true,
};

describe("customer orders development preview", () => {
  it("returns deterministic preview data only for the explicit local bypass", () => {
    const source = getCustomerOrdersPreview(previewCustomer, {
      NODE_ENV: "development",
      DEV_AUTH_BYPASS: "true",
    });

    expect(source.status).toBe("preview");
    if (source.status === "preview") {
      expect(source.orders).toHaveLength(9);
      expect(source.orders[0]).toMatchObject({
        reference: "ORD-1405-0001",
        paymentStatus: "paid",
      });
    }
  });

  it("never exposes fixtures outside the development bypass", () => {
    expect(
      getCustomerOrdersPreview(previewCustomer, {
        NODE_ENV: "production",
        DEV_AUTH_BYPASS: "true",
      }),
    ).toEqual({ status: "unavailable" });
  });
});
