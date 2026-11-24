import { CustomerDashboardShell } from "@/modules/dashboard/components/customer-dashboard-shell";
import type { CustomerDashboardLayoutProps } from "./layout.types";

export default function CustomerDashboardLayout(
  props: CustomerDashboardLayoutProps,
) {
  return <CustomerDashboardShell>{props.children}</CustomerDashboardShell>;
}
