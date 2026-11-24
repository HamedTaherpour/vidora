import { CUSTOMER_DASHBOARD_ROUTES } from "@/modules/dashboard/dashboard-navigation";
import { CustomerProfile } from "@/modules/dashboard/customer-profile/customer-profile";
import { createCustomerProfileView } from "@/modules/dashboard/customer-profile";
import { requireDashboardCustomer } from "@/modules/dashboard/require-dashboard-customer";

export default async function DashboardProfilePage() {
  const customer = await requireDashboardCustomer(
    CUSTOMER_DASHBOARD_ROUTES.profile,
  );
  return <CustomerProfile profile={createCustomerProfileView(customer)} />;
}
