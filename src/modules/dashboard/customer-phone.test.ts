import { describe, expect, it } from "vitest";

import { maskCustomerPhone } from "./customer-phone";

describe("maskCustomerPhone", () => {
  it("masks the customer phone and uses Persian digits", () => {
    expect(maskCustomerPhone("+989121234567")).toBe("۰۹۱۲ *** ۴۵۶۷");
  });

  it("does not expose short malformed values", () => {
    expect(maskCustomerPhone("۱۲۳")).toBe("۱۲۳");
  });
});
