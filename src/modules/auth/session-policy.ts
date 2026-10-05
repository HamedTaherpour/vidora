/**
 * Approved customer session policy.
 * Change these only together with `instructions/security.md`.
 * Lifetime is absolute. A request does not extend `expiresAt`.
 */

export const SESSION_TOKEN_BYTES = 32;

export const SESSION_LIFETIME_DAYS = 30;

export const SESSION_LIFETIME_SECONDS = SESSION_LIFETIME_DAYS * 24 * 60 * 60;

export const SESSION_LIFETIME_MS = SESSION_LIFETIME_SECONDS * 1000;

/**
 * Project-owned cookie name.
 * The value is the opaque session token and nothing else.
 */
export const CUSTOMER_SESSION_COOKIE_NAME = "vidora_customer_session";

/** base64url of 32 bytes, without padding. */
export const SESSION_TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/;
