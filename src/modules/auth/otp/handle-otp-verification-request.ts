import {
  allowedBrowserAuthOrigins,
  isAllowedBrowserAuthOrigin,
} from "@/modules/auth/browser/browser-auth-origin";
import {
  toPublicOtpVerificationResult,
  type PublicOtpVerificationResult,
  type VerifyOtpResult,
} from "@/modules/auth/otp/verify-otp";

export type VerifyOtpRequestBody = {
  phoneNumber: string;
  code: string;
};

export type OtpVerificationRequestVerify = (
  params: VerifyOtpRequestBody,
) => Promise<VerifyOtpResult>;

export type HandleOtpVerificationRequestParams = {
  request: Request;
  appOrigin: string | undefined;
  nodeEnv: string | undefined;
  verify: OtpVerificationRequestVerify;
  setSessionCookie: (sessionToken: string) => Promise<void>;
};

function isVerifyOtpBody(
  value: unknown,
): value is { phoneNumber: string; code: string } {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const body = value as Record<string, unknown>;

  return typeof body.phoneNumber === "string" && typeof body.code === "string";
}

function json(body: PublicOtpVerificationResult, status: number): Response {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

/**
 * HTTP boundary for browser OTP verification mutations.
 * Used by `POST /api/auth/otp/verify` and `POST /api/admin/auth/otp/verify`.
 * Origin is checked before verification so a rejected browser request
 * does not consume the OTP or set a session cookie.
 */
export async function handleOtpVerificationRequest({
  request,
  appOrigin,
  nodeEnv,
  verify,
  setSessionCookie,
}: HandleOtpVerificationRequestParams): Promise<Response> {
  const allowedOrigins = allowedBrowserAuthOrigins(appOrigin, nodeEnv);

  if (
    !isAllowedBrowserAuthOrigin({
      originHeader: request.headers.get("origin"),
      allowedOrigins,
    })
  ) {
    return json({ status: "rejected" }, 403);
  }

  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return json({ status: "rejected" }, 400);
  }

  if (!isVerifyOtpBody(payload)) {
    return json({ status: "rejected" }, 400);
  }

  const result = await verify({
    phoneNumber: payload.phoneNumber,
    code: payload.code,
  });
  const body = toPublicOtpVerificationResult(result);

  if (result.status !== "authenticated") {
    return json(body, 400);
  }

  await setSessionCookie(result.sessionToken);

  return json(body, 200);
}
