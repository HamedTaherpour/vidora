import { CUSTOMER_DASHBOARD_ROUTES } from "@/modules/dashboard/dashboard-navigation";
import {
  getCustomerOrdersPage,
  getCustomerOrdersSearchQuery,
  getCustomerOrdersStatus,
} from "@/modules/dashboard/customer-orders";
import { getCustomerOrdersPreview } from "@/modules/dashboard/customer-orders-preview";
import { CustomerOrdersPage } from "@/modules/dashboard/customer-orders-page";
import { requireDashboardCustomer } from "@/modules/dashboard/require-dashboard-customer";

type DashboardOrdersPageProps = {
  searchParams: Promise<{
    q?: string | string[];
    status?: string | string[];
    page?: string | string[];
  }>;
};

export default async function DashboardOrdersPage(
  props: DashboardOrdersPageProps,
) {
  const customer = await requireDashboardCustomer(
    CUSTOMER_DASHBOARD_ROUTES.orders,
  );
  const params = await props.searchParams;

  return (
    <CustomerOrdersPage
      source={getCustomerOrdersPreview(customer)}
      initialQuery={getCustomerOrdersSearchQuery(params.q)}
      initialStatus={getCustomerOrdersStatus(params.status)}
      initialPage={getCustomerOrdersPage(params.page)}
    />
  );
}
