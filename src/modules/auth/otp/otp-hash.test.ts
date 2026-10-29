import { describe, expect, it } from "vitest";

import {
  generateOtpCode,
  hashOtpCode,
  otpCodeMatchesHash,
} from "@/modules/auth/otp/otp-hash";
import {
  OTP_CODE_LENGTH,
  OTP_IP_REQUEST_LIMIT,
  OTP_LIFETIME_SECONDS,
  OTP_MAX_VERIFICATION_ATTEMPTS,
  OTP_PHONE_REQUEST_LIMIT,
  OTP_REQUEST_WINDOW_SECONDS,
  OTP_RESEND_COOLDOWN_SECONDS,
} from "@/modules/auth/otp/otp-policy";

const SECRET = "test-otp-hash-secret-0123456789ab";

describe("OTP policy constants", () => {
  it("matches the approved request policy", () => {
    expect(OTP_CODE_LENGTH).toBe(6);
    expect(OTP_LIFETIME_SECONDS).toBe(5 * 60);
    expect(OTP_RESEND_COOLDOWN_SECONDS).toBe(60);
    expect(OTP_MAX_VERIFICATION_ATTEMPTS).toBe(5);
    expect(OTP_PHONE_REQUEST_LIMIT).toBe(5);
    expect(OTP_IP_REQUEST_LIMIT).toBe(20);
    expect(OTP_REQUEST_WINDOW_SECONDS).toBe(60 * 60);
  });
});

describe("OTP hashing", () => {
  it("generates a 6-digit code", () => {
    const codes = new Set<string>();

    for (let index = 0; index < 20; index += 1) {
      const code = generateOtpCode();

      expect(code).toMatch(/^\d{6}$/);
      codes.add(code);
    }

    expect(codes.size).toBeGreaterThan(1);
  });

  it("stores an HMAC-SHA256 digest that matches only the same code and secret", () => {
    const digest = hashOtpCode("042817", SECRET);

    expect(digest).toMatch(/^[0-9a-f]{64}$/);
    expect(digest).not.toBe("042817");
    expect(otpCodeMatchesHash("042817", digest, SECRET)).toBe(true);
    expect(otpCodeMatchesHash("042818", digest, SECRET)).toBe(false);
    expect(otpCodeMatchesHash("042817", digest, `${SECRET}-other-key`)).toBe(
      false,
    );
    expect(otpCodeMatchesHash("042817", "zz", SECRET)).toBe(false);
  });

  it("rejects a short hash secret without echoing it", () => {
    const shortSecret = "too-short";

    expect(() => hashOtpCode("042817", shortSecret)).toThrow(
      "OTP_HASH_SECRET must be at least 32 characters.",
    );
  });
});
