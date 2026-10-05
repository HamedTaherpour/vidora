import {
  InvalidIranianMobileNumberError,
  normalizeIranianMobile,
} from "@/modules/auth/normalize-iranian-mobile";
import { assertOtpHashSecret } from "@/modules/auth/otp-hash";
import { OTP_PURPOSE_CUSTOMER } from "@/modules/auth/otp-purpose";
import type { OtpVerificationStore } from "@/modules/auth/otp-verification-store";
import { SESSION_TOKEN_PATTERN } from "@/modules/auth/session-policy";
import {
  generateSessionToken,
  hashSessionToken,
  sessionExpiresAt,
} from "@/modules/auth/session-token";

export type VerifyOtpResult =
  | {
      status: "authenticated";
      sessionToken: string;
      expiresAt: Date;
    }
  | { status: "invalid_phone" }
  | { status: "invalid_code" }
  | { status: "attempt_limit" }
  | { status: "rejected" };

export type PublicOtpVerificationResult =
  | { status: "authenticated"; expiresAt: string }
  | { status: "invalid_phone" }
  | { status: "invalid_code" }
  | { status: "attempt_limit" }
  | { status: "rejected" };

export type VerifyOtpLogEvent = {
  operation: "otp_verify";
  outcome: VerifyOtpResult["status"];
};

export type VerifyOtpParams = {
  phoneNumber: string;
  code: string;
  now: Date;
  otpHashSecret: string;
  store: OtpVerificationStore;
  generateToken?: () => string;
  log?: (event: VerifyOtpLogEvent) => void;
};

function defaultLog(event: VerifyOtpLogEvent): void {
  console.info(JSON.stringify(event));
}

/**
 * JSON body for a verification response.
 * The raw session token is not included. The caller sets it as an HttpOnly cookie.
 */
export function toPublicOtpVerificationResult(
  result: VerifyOtpResult,
): PublicOtpVerificationResult {
  if (result.status === "authenticated") {
    return {
      status: "authenticated",
      expiresAt: result.expiresAt.toISOString(),
    };
  }

  return { status: result.status };
}

/**
 * Verify a submitted OTP and, on success, create a customer session.
 * The returned token is for the cookie boundary only. Do not log it or put it
 * in a response body. `toPublicOtpVerificationResult` is the JSON shape.
 */
export async function verifyOtp({
  phoneNumber,
  code,
  now,
  otpHashSecret,
  store,
  generateToken = generateSessionToken,
  log = defaultLog,
}: VerifyOtpParams): Promise<VerifyOtpResult> {
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
    purpose: OTP_PURPOSE_CUSTOMER,
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
