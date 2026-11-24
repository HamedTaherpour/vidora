import { describe, expect, it } from "vitest";

import { DEVELOPMENT_USER_ID } from "@/modules/auth/development/dev-auth-bypass";
import { createCustomerProfileView } from "./customer-profile";

const customer = {
  status: "authenticated" as const,
  userId: DEVELOPMENT_USER_ID,
  phone: "+989121234567",
  expiresAt: new Date("2026-11-24T00:00:00.000Z"),
};

describe("customer profile view", () => {
  it("exposes the complete phone from the authenticated customer identity", () => {
    expect(createCustomerProfileView(customer)).toEqual({
      phone: "۰۹۱۲۱۲۳۴۵۶۷",
    });
    expect(createCustomerProfileView(customer).phone).not.toContain("*");
  });

  it("does not expose authentication fields in the profile view", () => {
    const view = createCustomerProfileView(customer);

    expect(view).toEqual({
      phone: "۰۹۱۲۱۲۳۴۵۶۷",
    });
    expect(JSON.stringify(view)).not.toContain("userId");
    expect(JSON.stringify(view)).not.toContain("expiresAt");
  });
});
