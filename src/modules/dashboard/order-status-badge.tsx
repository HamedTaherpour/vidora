import { getCustomerOrderStatusCopy } from "./customer-orders";
import type { OrderStatusBadgeProps } from "./order-status-badge.types";

export function OrderStatusBadge(props: OrderStatusBadgeProps) {
  const copy = getCustomerOrderStatusCopy(props.status);

  return (
    <span
      className={`inline-flex items-center text-xs font-medium leading-6 ${copy.className}`}
    >
      <span
        aria-hidden="true"
        className="me-1.5 size-1.5 rounded-full bg-current"
      />
      {copy.label}
    </span>
  );
}
