import { describe, expect, it } from "vitest";

import { dashboardLoginHref } from "./dashboard-login-href";

describe("account login continuation", () => {
  it("encodes an internal destination", () => {
    expect(dashboardLoginHref("/dashboard/orders")).toBe(
      "/login?returnTo=%2Fdashboard%2Forders",
    );
  });

  it("falls back instead of accepting an external destination", () => {
    expect(dashboardLoginHref("https://example.com")).toBe(
      "/login?returnTo=%2Fdashboard",
    );
    expect(dashboardLoginHref("//example.com")).toBe(
      "/login?returnTo=%2Fdashboard",
    );
  });

  it("canonicalizes legacy customer destinations", () => {
    expect(dashboardLoginHref("/account")).toBe("/login?returnTo=%2Fdashboard");
    expect(dashboardLoginHref("/library/purchase-1")).toBe(
      "/login?returnTo=%2Fdashboard%2Flibrary%2Fpurchase-1",
    );
  });
});
