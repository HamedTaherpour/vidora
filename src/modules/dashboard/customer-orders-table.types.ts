import type { CustomerOrder } from "./customer-orders.types";

export type CustomerOrdersTableProps = {
  orders: readonly CustomerOrder[];
  onDetails: (order: CustomerOrder) => void;
};
