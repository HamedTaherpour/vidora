import "server-only";

import { redirect } from "next/navigation";

import {
  CustomerAuthorizationError,
  requireCustomerPageAccess,
} from "@/modules/auth/authorization/authorization";
import { resolveCurrentCustomer } from "@/modules/auth/sessions/resolve-current-customer";
import { dashboardLoginHref } from "./dashboard-login-href";

/** Protect an account page and preserve its known internal destination. */
export async function requireDashboardCustomer(returnTo: string) {
  try {
    return requireCustomerPageAccess(await resolveCurrentCustomer());
  } catch (error) {
    if (error instanceof CustomerAuthorizationError) {
      redirect(dashboardLoginHref(returnTo));
    }

    throw error;
  }
}
