import "server-only";

import { prisma } from "@/lib/db/client";
import { readAdminSessionToken } from "@/modules/auth/admin-session-cookie-store";
import { createPrismaAdminOtpVerificationStore } from "@/modules/auth/prisma-admin-otp-verification-store";
import {
  resolveAdminSession,
  type ResolvedAdmin,
} from "@/modules/auth/resolve-admin-session";

/**
 * Admin for the current request Admin cookie.
 * Server Components and Route Handlers may read this.
 * It does not extend the session. The customer cookie is ignored.
 */
export async function resolveCurrentAdmin(
  now = new Date(),
): Promise<ResolvedAdmin> {
  const sessionToken = await readAdminSessionToken();
  const store = createPrismaAdminOtpVerificationStore(prisma);

  return resolveAdminSession({
    sessionToken,
    now,
    findSession: (secretHash) => store.findSessionBySecretHash(secretHash),
  });
}
