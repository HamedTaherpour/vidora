/**
 * Approved OTP request policy.
 * Change these only together with `instructions/security.md`.
 * They are not columns on `OtpChallenge`.
 */

export const OTP_CODE_LENGTH = 6;

export const OTP_LIFETIME_SECONDS = 5 * 60;

export const OTP_RESEND_COOLDOWN_SECONDS = 60;

export const OTP_MAX_VERIFICATION_ATTEMPTS = 5;

export const OTP_PHONE_REQUEST_LIMIT = 5;

export const OTP_IP_REQUEST_LIMIT = 20;

export const OTP_REQUEST_WINDOW_SECONDS = 60 * 60;

export const OTP_LIFETIME_MS = OTP_LIFETIME_SECONDS * 1000;

export const OTP_RESEND_COOLDOWN_MS = OTP_RESEND_COOLDOWN_SECONDS * 1000;

export const OTP_REQUEST_WINDOW_MS = OTP_REQUEST_WINDOW_SECONDS * 1000;
