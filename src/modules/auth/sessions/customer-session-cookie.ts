import {
  CUSTOMER_SESSION_COOKIE_NAME,
  SESSION_LIFETIME_SECONDS,
} from "@/modules/auth/sessions/session-policy";

export { CUSTOMER_SESSION_COOKIE_NAME };

export type CustomerSessionCookieOptions = {
  httpOnly: true;
  sameSite: "lax";
  secure: boolean;
  path: "/";
  maxAge: number;
};

/**
 * Cookie attributes for `vidora_customer_session`.
 * `Secure` is on only when Node is running in production.
 * Local development leaves it off because HTTPS is not available there.
 * Domain is omitted. There is no cross-subdomain requirement.
 */
export function customerSessionCookieOptions(
  nodeEnv: string | undefined,
): CustomerSessionCookieOptions {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: nodeEnv === "production",
    path: "/",
    maxAge: SESSION_LIFETIME_SECONDS,
  };
}
