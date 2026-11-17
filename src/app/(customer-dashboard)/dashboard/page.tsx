import { CustomerDashboard } from "@/modules/account/components/customer-dashboard";
import { CUSTOMER_DASHBOARD_ROUTES } from "@/modules/account/account-navigation";
import { requireAccountCustomer } from "@/modules/account/require-account-customer";

export default async function DashboardPage() {
  const customer = await requireAccountCustomer(
    CUSTOMER_DASHBOARD_ROUTES.dashboard,
  );
  return <CustomerDashboard customer={customer} purchaseState="unavailable" />;
}
