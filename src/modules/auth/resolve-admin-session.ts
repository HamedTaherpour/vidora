import type { AdminSessionRecord } from "@/modules/auth/otp-verification-store";
import { SESSION_TOKEN_PATTERN } from "@/modules/auth/session-policy";
import { hashSessionToken } from "@/modules/auth/session-token";

export type ResolvedAdmin =
  | {
      status: "authenticated";
      adminId: string;
      phone: string;
      expiresAt: Date;
    }
  | { status: "anonymous" };

/**
 * Restore an Admin from an opaque Admin session token.
 * Expired sessions are anonymous. This read does not change `expiresAt`.
 * Customer session tokens are not accepted here.
 */
export async function resolveAdminSession(params: {
  sessionToken: string | null;
  now: Date;
  findSession: (secretHash: string) => Promise<AdminSessionRecord | null>;
}): Promise<ResolvedAdmin> {
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
    adminId: session.adminId,
    phone: session.phone,
    expiresAt: session.expiresAt,
  };
}
