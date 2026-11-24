import type { RequiredCustomer } from "@/modules/auth/authorization/authorization";
import { formatCustomerPhone } from "./customer-phone";
import type { CustomerProfileView } from "./customer-profile.types";

/** Maps the authenticated identity to the minimal customer-facing profile view. */
export function createCustomerProfileView(
  customer: Pick<RequiredCustomer, "phone">,
): CustomerProfileView {
  return {
    phone: formatCustomerPhone(customer.phone),
  };
}
