import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { DEVELOPMENT_USER_ID } from "@/modules/auth/development/dev-auth-bypass";
import { getCustomerLibraryPreview } from "./customer-library-preview";

const previewCustomer = {
  status: "authenticated" as const,
  userId: DEVELOPMENT_USER_ID,
  phone: "+989000000001",
  expiresAt: new Date("2026-11-13T13:00:00.000Z"),
  isDevelopmentBypass: true,
};

describe("customer library development preview", () => {
  it("returns deterministic presentation items only for enabled preview access", () => {
    const items = getCustomerLibraryPreview(previewCustomer, {
      NODE_ENV: "development",
      DEV_AUTH_BYPASS: "true",
    });

    expect(items).toHaveLength(15);
    expect(items?.[0].reference).toBe("development-library-1");
    expect(items?.[0].qualityVariants).toEqual(["1080p", "4K"]);
    expect(items?.[0].item.titleFa).toContain("کوهستان");
  });

  it("does not provide fixtures in production or for a real customer", () => {
    expect(
      getCustomerLibraryPreview(previewCustomer, {
        NODE_ENV: "production",
        DEV_AUTH_BYPASS: "true",
      }),
    ).toBeNull();
    expect(
      getCustomerLibraryPreview(
        { ...previewCustomer, isDevelopmentBypass: false },
        { NODE_ENV: "development", DEV_AUTH_BYPASS: "true" },
      ),
    ).toBeNull();
  });
});
