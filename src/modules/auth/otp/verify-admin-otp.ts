import {
  InvalidIranianMobileNumberError,
  normalizeIranianMobile,
} from "@/modules/auth/otp/normalize-iranian-mobile";
import { assertOtpHashSecret } from "@/modules/auth/otp/otp-hash";
import { OTP_PURPOSE_ADMIN } from "@/modules/auth/otp/otp-purpose";
import type { AdminOtpVerificationStore } from "@/modules/auth/otp/otp-verification-store";
import { SESSION_TOKEN_PATTERN } from "@/modules/auth/sessions/session-policy";
import {
  generateSessionToken,
  hashSessionToken,
  sessionExpiresAt,
} from "@/modules/auth/sessions/session-token";
import type {
  PublicOtpVerificationResult,
  VerifyOtpLogEvent,
  VerifyOtpResult,
} from "@/modules/auth/otp/verify-otp";
import { toPublicOtpVerificationResult } from "@/modules/auth/otp/verify-otp";

export type VerifyAdminOtpParams = {
  phoneNumber: string;
  code: string;
  now: Date;
  otpHashSecret: string;
  store: AdminOtpVerificationStore;
  generateToken?: () => string;
  log?: (event: VerifyOtpLogEvent) => void;
};

function defaultLog(event: VerifyOtpLogEvent): void {
  console.info(JSON.stringify(event));
}

/**
 * Verify an Admin OTP and, on success, create an Admin session.
 * Never creates an Admin or a customer User/Session.
 * The returned token is for the Admin cookie boundary only.
 */
export async function verifyAdminOtp({
  phoneNumber,
  code,
  now,
  otpHashSecret,
  store,
  generateToken = generateSessionToken,
  log = defaultLog,
}: VerifyAdminOtpParams): Promise<VerifyOtpResult> {
  let phone: string;

  try {
    phone = normalizeIranianMobile(phoneNumber);
  } catch (error) {
    if (error instanceof InvalidIranianMobileNumberError) {
      log({ operation: "otp_verify", outcome: "invalid_phone" });

      return { status: "invalid_phone" };
    }

    throw error;
  }

  assertOtpHashSecret(otpHashSecret);

  const sessionToken = generateToken();

  if (!SESSION_TOKEN_PATTERN.test(sessionToken)) {
    throw new Error("Session token must be 32 bytes.");
  }

  const expiresAt = sessionExpiresAt(now);
  const outcome = await store.completeAuthentication({
    phone,
    purpose: OTP_PURPOSE_ADMIN,
    code,
    now,
    otpHashSecret,
    sessionSecretHash: hashSessionToken(sessionToken),
    sessionExpiresAt: expiresAt,
  });

  if (outcome.status !== "authenticated") {
    log({ operation: "otp_verify", outcome: outcome.status });

    return { status: outcome.status };
  }

  log({ operation: "otp_verify", outcome: "authenticated" });

  return {
    status: "authenticated",
    sessionToken,
    expiresAt,
  };
}

export { toPublicOtpVerificationResult };
export type { PublicOtpVerificationResult };
