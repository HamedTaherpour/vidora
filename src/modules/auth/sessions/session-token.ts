import { createHash, randomBytes } from "node:crypto";

import {
  SESSION_LIFETIME_MS,
  SESSION_TOKEN_BYTES,
  SESSION_TOKEN_PATTERN,
} from "@/modules/auth/sessions/session-policy";

export function sessionExpiresAt(now: Date): Date {
  return new Date(now.getTime() + SESSION_LIFETIME_MS);
}

/**
 * 32 cryptographically random bytes, base64url, safe to store in a cookie.
 * The database stores `hashSessionToken` of this string, not the token.
 */
export function generateSessionToken(): string {
  const token = randomBytes(SESSION_TOKEN_BYTES).toString("base64url");

  if (!SESSION_TOKEN_PATTERN.test(token)) {
    throw new Error("Session token generator did not return 32 bytes.");
  }

  return token;
}

/** SHA-256 hex digest of the UTF-8 cookie token. */
export function hashSessionToken(sessionToken: string): string {
  return createHash("sha256").update(sessionToken, "utf8").digest("hex");
}
