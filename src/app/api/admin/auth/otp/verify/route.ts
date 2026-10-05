import { serverEnv } from "@/lib/env/server";
import { setAdminSessionCookie } from "@/modules/auth/admin-session-cookie-store";
import { handleOtpVerificationRequest } from "@/modules/auth/handle-otp-verification-request";
import { verifyAdminOtpRequest } from "@/modules/auth/verify-admin-otp-request";

export const dynamic = "force-dynamic";

/**
 * Admin OTP verification.
 * Same Origin allowlist as customer OTP verification.
 * Sets `vidora_admin_session` only. Never the customer cookie.
 */
export async function POST(request: Request): Promise<Response> {
  return handleOtpVerificationRequest({
    request,
    appOrigin: serverEnv.APP_ORIGIN,
    nodeEnv: process.env.NODE_ENV,
    verify: ({ phoneNumber, code }) =>
      verifyAdminOtpRequest({ phoneNumber, code }),
    setSessionCookie: setAdminSessionCookie,
  });
}
