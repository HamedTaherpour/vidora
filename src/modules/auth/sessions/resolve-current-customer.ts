import "server-only";

import { prisma } from "@/lib/db/client";
import {
  DEVELOPMENT_USER_ID,
  DEVELOPMENT_USER_PHONE,
  developmentIdentityExpiry,
  isDevelopmentAuthBypassEnabled,
} from "@/modules/auth/development/dev-auth-bypass";
import { readCustomerSessionToken } from "@/modules/auth/sessions/customer-session-cookie-store";
import { createPrismaOtpVerificationStore } from "@/modules/auth/otp/prisma-otp-verification-store";
import {
  resolveCustomerSession,
  type ResolvedCustomer,
} from "@/modules/auth/sessions/resolve-customer-session";

/**
 * Customer for the current request cookie.
 * Server Components and Route Handlers may read this.
 * It does not extend the session.
 */
export async function resolveCurrentCustomer(
  now = new Date(),
): Promise<ResolvedCustomer> {
  if (isDevelopmentAuthBypassEnabled()) {
    return {
      status: "authenticated",
      userId: DEVELOPMENT_USER_ID,
      phone: DEVELOPMENT_USER_PHONE,
      expiresAt: developmentIdentityExpiry(now),
      isDevelopmentBypass: true,
    };
  }

  const sessionToken = await readCustomerSessionToken();
  const store = createPrismaOtpVerificationStore(prisma);

  return resolveCustomerSession({
    sessionToken,
    now,
    findSession: (secretHash) => store.findSessionBySecretHash(secretHash),
  });
}
