import "server-only";

import { cookies } from "next/headers";

import {
  CUSTOMER_SESSION_COOKIE_NAME,
  customerSessionCookieOptions,
} from "@/modules/auth/customer-session-cookie";
import { SESSION_TOKEN_PATTERN } from "@/modules/auth/session-policy";

/**
 * Read the customer session cookie.
 * Safe from a Server Component. The value is the opaque token, or null.
 */
export async function readCustomerSessionToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const value = cookieStore.get(CUSTOMER_SESSION_COOKIE_NAME)?.value;

  if (!value || !SESSION_TOKEN_PATTERN.test(value)) {
    return null;
  }

  return value;
}

/**
 * Set the customer session cookie.
 * Call this only from a Route Handler or Server Function.
 * Next.js rejects cookie writes during Server Component render.
 */
export async function setCustomerSessionCookie(
  sessionToken: string,
): Promise<void> {
  if (!SESSION_TOKEN_PATTERN.test(sessionToken)) {
    throw new Error("Session token must be 32 bytes.");
  }

  const cookieStore = await cookies();

  cookieStore.set(
    CUSTOMER_SESSION_COOKIE_NAME,
    sessionToken,
    customerSessionCookieOptions(process.env.NODE_ENV),
  );
}
