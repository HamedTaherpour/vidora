import { describe, expect, it } from "vitest";

import {
  ACCOUNT_NAVIGATION,
  CUSTOMER_DASHBOARD_ROUTES,
  isAccountNavigationItemCurrent,
} from "./account-navigation";

describe("customer account navigation", () => {
  it("keeps one shared set of customer destinations", () => {
    expect(ACCOUNT_NAVIGATION.map((item) => item.href)).toEqual([
      "/dashboard",
      "/dashboard/library",
      "/dashboard/orders",
      "/dashboard/profile",
    ]);
  });

  it("keeps the dashboard active only on the dashboard root", () => {
    expect(
      isAccountNavigationItemCurrent(
        CUSTOMER_DASHBOARD_ROUTES.dashboard,
        "/dashboard",
      ),
    ).toBe(true);
    expect(
      isAccountNavigationItemCurrent(
        CUSTOMER_DASHBOARD_ROUTES.dashboard,
        "/dashboard/library",
      ),
    ).toBe(false);
  });

  it("keeps nested library pages under the library navigation item", () => {
    expect(
      isAccountNavigationItemCurrent(
        CUSTOMER_DASHBOARD_ROUTES.library,
        "/dashboard/library/purchase-1/invoice",
      ),
    ).toBe(true);
  });
});
