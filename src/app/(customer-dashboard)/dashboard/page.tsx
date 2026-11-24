import { CustomerDashboard } from "@/modules/dashboard/components/customer-dashboard";
import { CUSTOMER_DASHBOARD_ROUTES } from "@/modules/dashboard/dashboard-navigation";
import { requireDashboardCustomer } from "@/modules/dashboard/require-dashboard-customer";

export default async function DashboardPage() {
  const customer = await requireDashboardCustomer(
    CUSTOMER_DASHBOARD_ROUTES.dashboard,
  );
  return <CustomerDashboard customer={customer} purchaseState="unavailable" />;
}
