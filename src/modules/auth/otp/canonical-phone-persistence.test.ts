import { describe, expect, it } from "vitest";
import {
  InvalidIranianMobileNumberError,
  normalizeIranianMobile,
} from "@/modules/auth/otp/normalize-iranian-mobile";

/**
 * PostgreSQL CHECK on User.phone and OtpChallenge.phone.
 * The migration SQL is the database copy of this pattern.
 */
const CANONICAL_PERSISTED_PHONE = /^\+989[0-9]{9}$/;

describe("canonical phone persistence", () => {
  it("collapses supported forms to one value the database CHECK accepts", () => {
    const persisted = [
      normalizeIranianMobile("09121234567"),
      normalizeIranianMobile("989121234567"),
      normalizeIranianMobile("+989121234567"),
    ];

    expect(persisted).toEqual([
      "+989121234567",
      "+989121234567",
      "+989121234567",
    ]);

    for (const phone of persisted) {
      expect(phone).toMatch(CANONICAL_PERSISTED_PHONE);
    }
  });

  it("does not treat un-normalized supported forms as persisted identity", () => {
    expect(CANONICAL_PERSISTED_PHONE.test("09121234567")).toBe(false);
    expect(CANONICAL_PERSISTED_PHONE.test("989121234567")).toBe(false);
    expect(normalizeIranianMobile("09121234567")).toMatch(
      CANONICAL_PERSISTED_PHONE,
    );
    expect(normalizeIranianMobile("989121234567")).toMatch(
      CANONICAL_PERSISTED_PHONE,
    );
  });

  it.each(["+981212345678", "+98912123456", "+9891212345678"])(
    "rejects %s before it can be stored",
    (phoneNumber) => {
      expect(CANONICAL_PERSISTED_PHONE.test(phoneNumber)).toBe(false);
      expect(() => normalizeIranianMobile(phoneNumber)).toThrow(
        InvalidIranianMobileNumberError,
      );
    },
  );
});
