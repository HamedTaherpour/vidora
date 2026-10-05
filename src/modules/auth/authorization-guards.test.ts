import { describe, expect, it } from "vitest";

import {
  AdminAuthorizationError,
  CustomerAuthorizationError,
  requireAuthenticatedAdmin,
  requireAuthenticatedCustomer,
} from "@/modules/auth/authorization";

const NOW = new Date("2026-10-05T12:00:00.000Z");

describe("authorization guards", () => {
  it("denies anonymous callers for customer-required operations", () => {
    expect(() => requireAuthenticatedCustomer({ status: "anonymous" })).toThrow(
      CustomerAuthorizationError,
    );
  });

  it("allows a valid customer session for customer-required operations", () => {
    expect(
      requireAuthenticatedCustomer({
        status: "authenticated",
        userId: "user-1",
        phone: "+989121234567",
        expiresAt: NOW,
      }),
    ).toEqual({
      status: "authenticated",
      userId: "user-1",
      phone: "+989121234567",
      expiresAt: NOW,
    });
  });

  it("denies anonymous callers for Admin-required operations", () => {
    expect(() => requireAuthenticatedAdmin({ status: "anonymous" })).toThrow(
      AdminAuthorizationError,
    );
  });

  it("allows a valid Admin session for Admin-required operations", () => {
    expect(
      requireAuthenticatedAdmin({
        status: "authenticated",
        adminId: "admin-1",
        phone: "+989121234567",
        expiresAt: NOW,
      }),
    ).toEqual({
      status: "authenticated",
      adminId: "admin-1",
      phone: "+989121234567",
      expiresAt: NOW,
    });
  });
});
