export type CustomerSessionRecord = {
  userId: string;
  phone: string;
  expiresAt: Date;
};

export type CompleteOtpAuthenticationParams = {
  phone: string;
  code: string;
  now: Date;
  otpHashSecret: string;
  sessionSecretHash: string;
  sessionExpiresAt: Date;
};

export type CompleteOtpAuthenticationResult =
  | { status: "authenticated"; userId: string }
  | { status: "invalid_code" }
  | { status: "attempt_limit" }
  | { status: "rejected" };

/**
 * Persistence for OTP verification and session lookup.
 * `completeAuthentication` must consume the challenge, resolve the user, and
 * insert the session in one transaction. The plaintext OTP and the raw
 * session token are not part of this contract.
 */
export type OtpVerificationStore = {
  completeAuthentication(
    params: CompleteOtpAuthenticationParams,
  ): Promise<CompleteOtpAuthenticationResult>;
  findSessionBySecretHash(
    secretHash: string,
  ): Promise<CustomerSessionRecord | null>;
};
