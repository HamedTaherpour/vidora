import type { CustomerOrder } from "./customer-orders.types";

export type CustomerOrderDetailsDialogProps = {
  order: CustomerOrder | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};
