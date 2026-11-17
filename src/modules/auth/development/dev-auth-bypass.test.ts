import { describe, expect, it } from "vitest";

import {
  isDevelopmentAuthBypassEnabled,
  isDevelopmentAuthBypassIdentity,
} from "@/modules/auth/development/dev-auth-bypass";
import {
  requireAdminPageAccess,
  requireAuthenticatedCustomer,
  requireAuthenticatedAdmin,
  requireCustomerPageAccess,
} from "@/modules/auth/authorization/authorization";

const DEV_ADMIN = {
  status: "authenticated" as const,
  adminId: "dev-admin-bypass",
  phone: "+989000000000",
  expiresAt: new Date("2026-10-29T13:00:00.000Z"),
  isDevelopmentBypass: true,
};

const DEV_CUSTOMER = {
  status: "authenticated" as const,
  userId: "dev-user-bypass",
  phone: "+989000000001",
  expiresAt: new Date("2026-10-29T13:00:00.000Z"),
  isDevelopmentBypass: true,
};

describe("development authentication bypass", () => {
  it("is disabled by default and requires both development and explicit opt-in", () => {
    expect(
      isDevelopmentAuthBypassEnabled({
        NODE_ENV: "development",
        DEV_AUTH_BYPASS: undefined,
      }),
    ).toBe(false);
    expect(
      isDevelopmentAuthBypassEnabled({
        NODE_ENV: "test",
        DEV_AUTH_BYPASS: "true",
      }),
    ).toBe(false);
    expect(
      isDevelopmentAuthBypassEnabled({
        NODE_ENV: "production",
        DEV_AUTH_BYPASS: "true",
      }),
    ).toBe(false);
    expect(
      isDevelopmentAuthBypassEnabled({
        NODE_ENV: "development",
        DEV_AUTH_BYPASS: "true",
      }),
    ).toBe(true);
  });

  it("allows protected page loading but keeps privileged mutations protected", () => {
    expect(isDevelopmentAuthBypassIdentity(DEV_ADMIN)).toBe(true);
    expect(requireAdminPageAccess(DEV_ADMIN)).toEqual(DEV_ADMIN);
    expect(() => requireAuthenticatedAdmin(DEV_ADMIN)).toThrow(
      "Authenticated administrator required.",
    );
    expect(() => requireAuthenticatedCustomer(DEV_CUSTOMER)).toThrow(
      "Authenticated customer required.",
    );
    expect(requireCustomerPageAccess(DEV_CUSTOMER)).toEqual(DEV_CUSTOMER);
  });
});
