import { describe, expect, it } from "vitest";

import { getPurchaseStateCopy } from "./customer-dashboard";

describe("customer dashboard purchase states", () => {
  it("describes an unavailable source without presenting it as an empty account", () => {
    const copy = getPurchaseStateCopy("unavailable");

    expect(copy.summary).toContain("در دسترس نیست");
    expect(copy.title).toContain("در دسترس نیست");
    expect(copy.emptyDescription).toContain("ساختگی");
    expect(copy.summary).not.toContain("هنوز خریدی ثبت نشده");
  });

  it("keeps confirmed empty and error states distinct", () => {
    const empty = getPurchaseStateCopy("empty");
    const error = getPurchaseStateCopy("error");

    expect(empty.summary).toContain("ثبت نشده");
    expect(error.summary).toContain("ممکن نیست");
    expect(empty.summary).not.toBe(error.summary);
  });

  it("does not expose development-oriented integration language", () => {
    const states = ["empty", "unavailable", "error"] as const;

    for (const state of states) {
      expect(JSON.stringify(getPurchaseStateCopy(state))).not.toContain(
        "اتصال داده",
      );
      expect(JSON.stringify(getPurchaseStateCopy(state))).not.toContain(
        "منبع واقعی",
      );
    }
  });
});
