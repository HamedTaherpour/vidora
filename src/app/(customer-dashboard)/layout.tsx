import { CustomerAccountShell } from "@/modules/account/components/customer-account-shell";
import type { CustomerDashboardLayoutProps } from "./layout.types";

export default function CustomerDashboardLayout(
  props: CustomerDashboardLayoutProps,
) {
  return <CustomerAccountShell>{props.children}</CustomerAccountShell>;
}
