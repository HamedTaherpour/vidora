import type { ResolvedAdmin } from "@/modules/auth/resolve-admin-session";
import type { ResolvedCustomer } from "@/modules/auth/resolve-customer-session";

export type RequiredCustomer = Extract<
  ResolvedCustomer,
  { status: "authenticated" }
>;

export type RequiredAdmin = Extract<ResolvedAdmin, { status: "authenticated" }>;

export class CustomerAuthorizationError extends Error {
  readonly code = "customer_required" as const;

  constructor() {
    super("Authenticated customer required.");
    this.name = "CustomerAuthorizationError";
  }
}

export class AdminAuthorizationError extends Error {
  readonly code = "admin_required" as const;

  constructor() {
    super("Authenticated administrator required.");
    this.name = "AdminAuthorizationError";
  }
}

/**
 * Customer-required gate.
 * An Admin session alone is not represented here and cannot satisfy this check.
 */
export function requireAuthenticatedCustomer(
  customer: ResolvedCustomer,
): RequiredCustomer {
  if (customer.status !== "authenticated") {
    throw new CustomerAuthorizationError();
  }

  return customer;
}

/**
 * Admin-required gate.
 * A Customer session alone is not represented here and cannot satisfy this check.
 */
export function requireAuthenticatedAdmin(admin: ResolvedAdmin): RequiredAdmin {
  if (admin.status !== "authenticated") {
    throw new AdminAuthorizationError();
  }

  return admin;
}
