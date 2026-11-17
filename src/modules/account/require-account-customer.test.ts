import { describe, expect, it } from "vitest";

import { accountLoginHref } from "./account-login-href";

describe("account login continuation", () => {
  it("encodes an internal destination", () => {
    expect(accountLoginHref("/dashboard/orders")).toBe(
      "/login?returnTo=%2Fdashboard%2Forders",
    );
  });

  it("falls back instead of accepting an external destination", () => {
    expect(accountLoginHref("https://example.com")).toBe(
      "/login?returnTo=%2Fdashboard",
    );
    expect(accountLoginHref("//example.com")).toBe(
      "/login?returnTo=%2Fdashboard",
    );
  });

  it("canonicalizes legacy customer destinations", () => {
    expect(accountLoginHref("/account")).toBe("/login?returnTo=%2Fdashboard");
    expect(accountLoginHref("/library/purchase-1")).toBe(
      "/login?returnTo=%2Fdashboard%2Flibrary%2Fpurchase-1",
    );
  });
});
