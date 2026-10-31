import { describe, expect, it } from "vitest";
import {
  isFixtureOtpSuccessful,
  normalizeOtpDigits,
  resolveSafeReturnDestination,
  toLatinDigits,
  validateFixtureOtp,
  validateCustomerPhone,
} from "./customer-auth";

describe("customer auth fixtures", () => {
  it("maps Persian and Arabic digits to Latin digits", () => {
    expect(toLatinDigits("۰۹۱۲١٢٣٤٥٦٧")).toBe("09121234567");
  });

  it("validates the same supported phone formats as auth", () => {
    expect(validateCustomerPhone("۰۹۱۲۱۲۳۴۵۶۷")).toBe("+989121234567");
    expect(validateCustomerPhone("0912-123-4567")).toContain("معتبر");
    expect(validateCustomerPhone("")).toBe("شماره موبایل را وارد کنید.");
  });

  it("keeps only safe internal return destinations", () => {
    expect(resolveSafeReturnDestination("/footage/morning-mountains")).toBe(
      "/footage/morning-mountains",
    );
    expect(resolveSafeReturnDestination("https://example.com")).toBe("/");
    expect(resolveSafeReturnDestination("//example.com")).toBe("/");
    expect(resolveSafeReturnDestination("/admin")).toBe("/");
    expect(resolveSafeReturnDestination("/login")).toBe("/");
    expect(resolveSafeReturnDestination("/session/continue")).toBe("/");
    expect(resolveSafeReturnDestination(undefined)).toBe("/");
  });

  it("keeps OTP behavior deterministic without exposing a real code", () => {
    expect(normalizeOtpDigits("۱۲۳۴۵۶")).toBe("123456");
    expect(validateFixtureOtp("۱۲۳۴۵")).toBe("کد باید دقیقاً شش رقم باشد.");
    expect(validateFixtureOtp("۰۰۰۰۰۰")).toBeNull();
    expect(isFixtureOtpSuccessful("۰۰۰۰۰۰")).toBe(false);
    expect(isFixtureOtpSuccessful("۱۲۳۴۵۶")).toBe(true);
  });
});
