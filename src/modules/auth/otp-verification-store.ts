import type { OtpPurpose } from "@/modules/auth/otp-purpose";

export type CustomerSessionRecord = {
  userId: string;
  phone: string;
  expiresAt: Date;
};

export type AdminSessionRecord = {
  adminId: string;
  phone: string;
  expiresAt: Date;
};

export type CompleteOtpAuthenticationParams = {
  phone: string;
  purpose: OtpPurpose;
  code: string;
  now: Date;
  otpHashSecret: string;
  sessionSecretHash: string;
  sessionExpiresAt: Date;
};

export type CompleteOtpAuthenticationResult =
  | { status: "authenticated"; accountId: string }
  | { status: "invalid_code" }
  | { status: "attempt_limit" }
  | { status: "rejected" };

/**
 * Persistence for OTP verification and session lookup.
 * `completeAuthentication` must consume the challenge, resolve the account for
 * that purpose, and insert the matching session in one transaction. The
 * plaintext OTP and the raw session token are not part of this contract.
 */
export type OtpVerificationStore = {
  completeAuthentication(
    params: CompleteOtpAuthenticationParams,
  ): Promise<CompleteOtpAuthenticationResult>;
  findSessionBySecretHash(
    secretHash: string,
  ): Promise<CustomerSessionRecord | null>;
};

/**
 * Persistence for Admin OTP verification and Admin session lookup.
 * Successful verification never creates an Admin row. The Admin must already
 * exist. It never writes a customer `Session` or `User`.
 */
export type AdminOtpVerificationStore = {
  completeAuthentication(
    params: CompleteOtpAuthenticationParams,
  ): Promise<CompleteOtpAuthenticationResult>;
  findSessionBySecretHash(
    secretHash: string,
  ): Promise<AdminSessionRecord | null>;
};
