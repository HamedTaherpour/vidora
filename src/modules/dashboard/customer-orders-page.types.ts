import type { CustomerOrdersSource } from "./customer-orders.types";

export type CustomerOrdersPageProps = {
  source: CustomerOrdersSource;
  initialQuery: string;
  initialStatus: string;
  initialPage: number;
};
