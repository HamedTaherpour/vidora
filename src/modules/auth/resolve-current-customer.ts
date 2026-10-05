import "server-only";

import { prisma } from "@/lib/db/client";
import { readCustomerSessionToken } from "@/modules/auth/customer-session-cookie-store";
import { createPrismaOtpVerificationStore } from "@/modules/auth/prisma-otp-verification-store";
import {
  resolveCustomerSession,
  type ResolvedCustomer,
} from "@/modules/auth/resolve-customer-session";

/**
 * Customer for the current request cookie.
 * Server Components and Route Handlers may read this.
 * It does not extend the session.
 */
export async function resolveCurrentCustomer(
  now = new Date(),
): Promise<ResolvedCustomer> {
  const sessionToken = await readCustomerSessionToken();
  const store = createPrismaOtpVerificationStore(prisma);

  return resolveCustomerSession({
    sessionToken,
    now,
    findSession: (secretHash) => store.findSessionBySecretHash(secretHash),
  });
}
