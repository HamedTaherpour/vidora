import { describe, expect, it } from "vitest";

import {
  CUSTOMER_DASHBOARD_NAVIGATION,
  CUSTOMER_DASHBOARD_ROUTES,
  isDashboardNavigationItemCurrent,
} from "./dashboard-navigation";

describe("customer account navigation", () => {
  it("keeps one shared set of customer destinations", () => {
    expect(CUSTOMER_DASHBOARD_NAVIGATION.map((item) => item.href)).toEqual([
      "/dashboard",
      "/dashboard/library",
      "/dashboard/orders",
      "/dashboard/profile",
    ]);
  });

  it("keeps the dashboard active only on the dashboard root", () => {
    expect(
      isDashboardNavigationItemCurrent(
        CUSTOMER_DASHBOARD_ROUTES.dashboard,
        "/dashboard",
      ),
    ).toBe(true);
    expect(
      isDashboardNavigationItemCurrent(
        CUSTOMER_DASHBOARD_ROUTES.dashboard,
        "/dashboard/library",
      ),
    ).toBe(false);
  });

  it("keeps nested library pages under the library navigation item", () => {
    expect(
      isDashboardNavigationItemCurrent(
        CUSTOMER_DASHBOARD_ROUTES.library,
        "/dashboard/library/purchase-1/invoice",
      ),
    ).toBe(true);
  });
});
