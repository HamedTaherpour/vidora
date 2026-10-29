import type { CustomerSessionRecord } from "@/modules/auth/otp/otp-verification-store";
import { SESSION_TOKEN_PATTERN } from "@/modules/auth/sessions/session-policy";
import { hashSessionToken } from "@/modules/auth/sessions/session-token";

export type ResolvedCustomer =
  | {
      status: "authenticated";
      userId: string;
      phone: string;
      expiresAt: Date;
    }
  | { status: "anonymous" };

export type ResolveCustomerSessionParams = {
  sessionToken: string | null;
  now: Date;
  findSession: (secretHash: string) => Promise<CustomerSessionRecord | null>;
};

/**
 * Restore a customer from an opaque session token.
 * Expired sessions are anonymous. This read does not change `expiresAt`.
 */
export async function resolveCustomerSession(
  params: ResolveCustomerSessionParams,
): Promise<ResolvedCustomer> {
  if (
    params.sessionToken === null ||
    !SESSION_TOKEN_PATTERN.test(params.sessionToken)
  ) {
    return { status: "anonymous" };
  }

  const session = await params.findSession(
    hashSessionToken(params.sessionToken),
  );

  if (!session || session.expiresAt.getTime() <= params.now.getTime()) {
    return { status: "anonymous" };
  }

  return {
    status: "authenticated",
    userId: session.userId,
    phone: session.phone,
    expiresAt: session.expiresAt,
  };
}
