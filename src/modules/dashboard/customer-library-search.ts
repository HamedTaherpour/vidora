import { CUSTOMER_DASHBOARD_ROUTES } from "./dashboard-navigation";

/** Builds the customer-library destination while omitting an empty query. */
export function createCustomerLibrarySearchHref(value: string) {
  const query = value.trim();
  if (!query) return CUSTOMER_DASHBOARD_ROUTES.library;

  const params = new URLSearchParams({ q: query });
  return `${CUSTOMER_DASHBOARD_ROUTES.library}?${params.toString()}`;
}

/** Reads the stable library-search contract without treating it as purchase data. */
export function getCustomerLibrarySearchQuery(
  value: string | string[] | undefined,
) {
  const query = Array.isArray(value) ? value[0] : value;
  return query?.trim() ?? "";
}
