import "server-only";

import { redirect } from "next/navigation";

import {
  CustomerAuthorizationError,
  requireCustomerPageAccess,
} from "@/modules/auth/authorization/authorization";
import { resolveCurrentCustomer } from "@/modules/auth/sessions/resolve-current-customer";
import { accountLoginHref } from "./account-login-href";

/** Protect an account page and preserve its known internal destination. */
export async function requireAccountCustomer(returnTo: string) {
  try {
    return requireCustomerPageAccess(await resolveCurrentCustomer());
  } catch (error) {
    if (error instanceof CustomerAuthorizationError) {
      redirect(accountLoginHref(returnTo));
    }

    throw error;
  }
}
