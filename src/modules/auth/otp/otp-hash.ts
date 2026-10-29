import { createHmac, randomInt, timingSafeEqual } from "node:crypto";

import { OTP_CODE_LENGTH } from "@/modules/auth/otp/otp-policy";

const OTP_HASH_SECRET_MIN_LENGTH = 32;

export function assertOtpHashSecret(secret: string): void {
  if (secret.length < OTP_HASH_SECRET_MIN_LENGTH) {
    throw new Error("OTP_HASH_SECRET must be at least 32 characters.");
  }
}

/**
 * Cryptographically secure 6-digit code, including leading zeros.
 * `randomInt` uses a CSPRNG. `Math.random` must not be used for OTP codes.
 */
export function generateOtpCode(): string {
  const upperBound = 10 ** OTP_CODE_LENGTH;

  return randomInt(0, upperBound).toString().padStart(OTP_CODE_LENGTH, "0");
}

/**
 * HMAC-SHA256 hex digest of the UTF-8 OTP code.
 * AUTH-04 must verify submitted codes with `otpCodeMatchesHash`.
 */
export function hashOtpCode(code: string, secret: string): string {
  assertOtpHashSecret(secret);

  return createHmac("sha256", secret).update(code, "utf8").digest("hex");
}

export function otpCodeMatchesHash(
  code: string,
  codeHash: string,
  secret: string,
): boolean {
  const actual = Buffer.from(hashOtpCode(code, secret), "hex");
  const expected = Buffer.from(codeHash, "hex");

  if (actual.length === 0 || actual.length !== expected.length) {
    return false;
  }

  return timingSafeEqual(actual, expected);
}
