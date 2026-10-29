import "server-only";

import {
  requireAuthenticatedAdmin,
  type RequiredAdmin,
} from "@/modules/auth/authorization/authorization";
import { resolveCurrentAdmin } from "@/modules/auth/sessions/resolve-current-admin";

export {
  AdminAuthorizationError,
  type RequiredAdmin,
} from "@/modules/auth/authorization/authorization";

/**
 * Require a valid Admin session for a protected Admin operation.
 * A customer session alone is not Admin authorization.
 */
export async function requireCurrentAdmin(
  now = new Date(),
): Promise<RequiredAdmin> {
  return requireAuthenticatedAdmin(await resolveCurrentAdmin(now));
}
