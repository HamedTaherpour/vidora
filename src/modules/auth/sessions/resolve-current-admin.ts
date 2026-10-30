import "server-only";

import { prisma } from "@/lib/db/client";
import {
  DEVELOPMENT_ADMIN_ID,
  DEVELOPMENT_ADMIN_PHONE,
  developmentIdentityExpiry,
  isDevelopmentAuthBypassEnabled,
} from "@/modules/auth/development/dev-auth-bypass";
import { readAdminSessionToken } from "@/modules/auth/sessions/admin-session-cookie-store";
import { createPrismaAdminOtpVerificationStore } from "@/modules/auth/otp/prisma-admin-otp-verification-store";
import {
  resolveAdminSession,
  type ResolvedAdmin,
} from "@/modules/auth/sessions/resolve-admin-session";

/**
 * Admin for the current request Admin cookie.
 * Server Components and Route Handlers may read this.
 * It does not extend the session. The customer cookie is ignored.
 */
export async function resolveCurrentAdmin(
  now = new Date(),
): Promise<ResolvedAdmin> {
  if (isDevelopmentAuthBypassEnabled()) {
    return {
      status: "authenticated",
      adminId: DEVELOPMENT_ADMIN_ID,
      phone: DEVELOPMENT_ADMIN_PHONE,
      expiresAt: developmentIdentityExpiry(now),
      isDevelopmentBypass: true,
    };
  }

  const sessionToken = await readAdminSessionToken();
  const store = createPrismaAdminOtpVerificationStore(prisma);

  return resolveAdminSession({
    sessionToken,
    now,
    findSession: (secretHash) => store.findSessionBySecretHash(secretHash),
  });
}
