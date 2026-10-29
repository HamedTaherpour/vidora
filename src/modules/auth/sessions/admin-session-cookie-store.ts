import "server-only";

import { cookies } from "next/headers";

import {
  ADMIN_SESSION_COOKIE_NAME,
  adminSessionCookieOptions,
} from "@/modules/auth/sessions/admin-session-cookie";
import { SESSION_TOKEN_PATTERN } from "@/modules/auth/sessions/session-policy";

/**
 * Read the Admin session cookie.
 * Safe from a Server Component. The value is the opaque token, or null.
 */
export async function readAdminSessionToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const value = cookieStore.get(ADMIN_SESSION_COOKIE_NAME)?.value;

  if (!value || !SESSION_TOKEN_PATTERN.test(value)) {
    return null;
  }

  return value;
}

/**
 * Set the Admin session cookie.
 * Call this only from a Route Handler or Server Function.
 */
export async function setAdminSessionCookie(
  sessionToken: string,
): Promise<void> {
  if (!SESSION_TOKEN_PATTERN.test(sessionToken)) {
    throw new Error("Session token must be 32 bytes.");
  }

  const cookieStore = await cookies();

  cookieStore.set(
    ADMIN_SESSION_COOKIE_NAME,
    sessionToken,
    adminSessionCookieOptions(process.env.NODE_ENV),
  );
}
