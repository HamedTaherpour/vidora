import {
  ADMIN_SESSION_COOKIE_NAME,
  SESSION_LIFETIME_SECONDS,
} from "@/modules/auth/sessions/session-policy";

export { ADMIN_SESSION_COOKIE_NAME };

export type AdminSessionCookieOptions = {
  httpOnly: true;
  sameSite: "lax";
  secure: boolean;
  path: "/";
  maxAge: number;
};

/**
 * Cookie attributes for `vidora_admin_session`.
 * Same transport rules as the customer cookie. Separate name and table.
 */
export function adminSessionCookieOptions(
  nodeEnv: string | undefined,
): AdminSessionCookieOptions {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: nodeEnv === "production",
    path: "/",
    maxAge: SESSION_LIFETIME_SECONDS,
  };
}
