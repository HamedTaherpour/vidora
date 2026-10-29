import "server-only";

import {
  requireAuthenticatedCustomer,
  type RequiredCustomer,
} from "@/modules/auth/authorization/authorization";
import { resolveCurrentCustomer } from "@/modules/auth/sessions/resolve-current-customer";

export {
  CustomerAuthorizationError,
  type RequiredCustomer,
} from "@/modules/auth/authorization/authorization";

/**
 * Require a valid customer session for a protected customer operation.
 * An Admin session alone is not a customer session.
 */
export async function requireCurrentCustomer(
  now = new Date(),
): Promise<RequiredCustomer> {
  return requireAuthenticatedCustomer(await resolveCurrentCustomer(now));
}
