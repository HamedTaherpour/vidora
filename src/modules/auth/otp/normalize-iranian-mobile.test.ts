import { describe, expect, it } from "vitest";
import {
  InvalidIranianMobileNumberError,
  normalizeIranianMobile,
} from "@/modules/auth/otp/normalize-iranian-mobile";

const canonical = "+989121234567";

describe("normalizeIranianMobile", () => {
  it("normalizes the local 09 form", () => {
    expect(normalizeIranianMobile("09121234567")).toBe(canonical);
  });

  it("normalizes the 98 country-code form", () => {
    expect(normalizeIranianMobile("989121234567")).toBe(canonical);
  });

  it("accepts the +98 form unchanged", () => {
    expect(normalizeIranianMobile("+989121234567")).toBe(canonical);
  });

  it("resolves every supported form to the same canonical value", () => {
    expect([
      normalizeIranianMobile("09121234567"),
      normalizeIranianMobile("989121234567"),
      normalizeIranianMobile("+989121234567"),
    ]).toEqual([canonical, canonical, canonical]);
  });

  it("accepts other Iranian mobiles that start with 9", () => {
    expect(normalizeIranianMobile("09012345678")).toBe("+989012345678");
    expect(normalizeIranianMobile("989301234567")).toBe("+989301234567");
    expect(normalizeIranianMobile("+989901234567")).toBe("+989901234567");
  });

  it("keeps distinct valid numbers distinct", () => {
    expect(normalizeIranianMobile("09121234567")).not.toBe(
      normalizeIranianMobile("09121234568"),
    );
  });

  it.each(["0912123456", "091212345678", "98912123456", "+9891212345678", ""])(
    "rejects invalid length: %s",
    (phoneNumber) => {
      expect(() => normalizeIranianMobile(phoneNumber)).toThrow(
        InvalidIranianMobileNumberError,
      );
    },
  );

  it.each(["+14155552671", "14155552671", "+449121234567", "447911123456"])(
    "rejects a non-Iranian country code: %s",
    (phoneNumber) => {
      expect(() => normalizeIranianMobile(phoneNumber)).toThrow(
        InvalidIranianMobileNumberError,
      );
    },
  );

  it.each([
    "02187654321",
    "982112345678",
    "+982112345678",
    "988121234567",
    "+988121234567",
  ])("rejects an Iranian non-mobile number: %s", (phoneNumber) => {
    expect(() => normalizeIranianMobile(phoneNumber)).toThrow(
      InvalidIranianMobileNumberError,
    );
  });

  it.each([
    "0912abc4567",
    "0912 123 4567",
    "0912-123-4567",
    "+98 912 123 4567",
    "+9809121234567",
    "00989121234567",
    "9121234567",
    "۰۹۱۲۱۲۳۴۵۶۷",
    "+",
    "not-a-phone",
  ])("rejects malformed characters or unsupported forms: %s", (phoneNumber) => {
    expect(() => normalizeIranianMobile(phoneNumber)).toThrow(
      InvalidIranianMobileNumberError,
    );
  });

  it("rejects a non-string value instead of coercing it", () => {
    expect(() =>
      normalizeIranianMobile(989121234567 as unknown as string),
    ).toThrow(InvalidIranianMobileNumberError);
  });

  it("does not include the submitted value in the error", () => {
    const phoneNumber = "0912abc4567";

    expect(() => normalizeIranianMobile(phoneNumber)).toThrow(
      InvalidIranianMobileNumberError,
    );

    try {
      normalizeIranianMobile(phoneNumber);
    } catch (error) {
      expect(error).toBeInstanceOf(InvalidIranianMobileNumberError);
      expect((error as Error).message).not.toContain(phoneNumber);
      return;
    }

    throw new Error("expected normalization to fail");
  });
});
