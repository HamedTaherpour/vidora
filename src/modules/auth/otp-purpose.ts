/**
 * OTP authentication context.
 * Customer and Admin share `OtpChallenge` rows but never the same purpose.
 * A challenge issued for one purpose cannot authenticate the other.
 */

export const OTP_PURPOSE_CUSTOMER = "customer" as const;
export const OTP_PURPOSE_ADMIN = "admin" as const;

export type OtpPurpose = typeof OTP_PURPOSE_CUSTOMER | typeof OTP_PURPOSE_ADMIN;
