import { CUSTOMER_DASHBOARD_ROUTES } from "./account-navigation";

function canonicalizeCustomerReturnTo(returnTo: string): string {
  const legacyRouteMap: Record<string, string> = {
    "/account": CUSTOMER_DASHBOARD_ROUTES.dashboard,
    "/account/orders": CUSTOMER_DASHBOARD_ROUTES.orders,
    "/account/profile": CUSTOMER_DASHBOARD_ROUTES.profile,
    "/library": CUSTOMER_DASHBOARD_ROUTES.library,
  };

  if (legacyRouteMap[returnTo] !== undefined) {
    return legacyRouteMap[returnTo];
  }

  if (returnTo.startsWith("/library/")) {
    return `${CUSTOMER_DASHBOARD_ROUTES.library}${returnTo.slice("/library".length)}`;
  }

  return returnTo;
}

export function accountLoginHref(returnTo: string): string {
  const isInternalPath = returnTo.startsWith("/") && !returnTo.startsWith("//");
  const destination = isInternalPath
    ? canonicalizeCustomerReturnTo(returnTo)
    : CUSTOMER_DASHBOARD_ROUTES.dashboard;
  return `/login?returnTo=${encodeURIComponent(destination)}`;
}
