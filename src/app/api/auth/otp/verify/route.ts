import { serverEnv } from "@/lib/env/server";
import { setCustomerSessionCookie } from "@/modules/auth/customer-session-cookie-store";
import { handleOtpVerificationRequest } from "@/modules/auth/handle-otp-verification-request";
import { verifyCustomerOtp } from "@/modules/auth/verify-customer-otp";

export const dynamic = "force-dynamic";

export async function POST(request: Request): Promise<Response> {
  return handleOtpVerificationRequest({
    request,
    appOrigin: serverEnv.APP_ORIGIN,
    nodeEnv: process.env.NODE_ENV,
    verify: ({ phoneNumber, code }) => verifyCustomerOtp({ phoneNumber, code }),
    setSessionCookie: setCustomerSessionCookie,
  });
}
