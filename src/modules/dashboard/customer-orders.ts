import type {
  CustomerOrder,
  CustomerOrderPaymentStatus,
} from "./customer-orders.types";

export const CUSTOMER_ORDERS_PAGE_SIZE = 5;

export function normalizeCustomerOrderSearchText(value: string) {
  return value
    .replace(/[يى]/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/[٠-٩]/g, (digit) => String(digit.charCodeAt(0) - 0x0660))
    .replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)))
    .replace(/[\u064B-\u065F\u0670]/g, "")
    .replace(/[\u200C\u200E\u200F]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLocaleLowerCase("fa-IR");
}

export function filterCustomerOrders(
  orders: readonly CustomerOrder[],
  query: string,
  status: CustomerOrderPaymentStatus | "all" = "all",
) {
  const normalizedQuery = normalizeCustomerOrderSearchText(query);

  return orders.filter((order) => {
    const matchesStatus = status === "all" || order.paymentStatus === status;
    const searchable = normalizeCustomerOrderSearchText(
      `${order.reference} ${order.titleSnapshot}`,
    );
    return (
      matchesStatus &&
      (!normalizedQuery || searchable.includes(normalizedQuery))
    );
  });
}

export function getCustomerOrderPageCount(
  total: number,
  pageSize = CUSTOMER_ORDERS_PAGE_SIZE,
) {
  return Math.max(1, Math.ceil(total / pageSize));
}

export function getCustomerOrdersPageItems(
  orders: readonly CustomerOrder[],
  page: number,
  pageSize = CUSTOMER_ORDERS_PAGE_SIZE,
) {
  const pages = getCustomerOrderPageCount(orders.length, pageSize);
  const currentPage = Math.min(Math.max(page, 1), pages);
  return orders.slice((currentPage - 1) * pageSize, currentPage * pageSize);
}

export function getCustomerOrdersSearchQuery(
  value: string | string[] | undefined,
) {
  const query = Array.isArray(value) ? value[0] : value;
  return query?.trim() ?? "";
}

export function getCustomerOrdersStatus(value: string | string[] | undefined) {
  const status = Array.isArray(value) ? value[0] : value;
  return status === "paid" || status === "pending" || status === "failed"
    ? status
    : "all";
}

export function getCustomerOrdersPage(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  const page = Number(raw);
  return Number.isInteger(page) && page > 0 ? page : 1;
}

export function createCustomerOrdersHref({
  query,
  status,
  page,
}: {
  query: string;
  status: string;
  page: number;
}) {
  const params = new URLSearchParams();
  if (query.trim()) params.set("q", query.trim());
  if (status !== "all") params.set("status", status);
  if (page > 1) params.set("page", String(page));
  const encoded = params.toString();
  return encoded ? `/dashboard/orders?${encoded}` : "/dashboard/orders";
}

export function formatCustomerOrderDate(value: string) {
  return new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

export function getCustomerOrderStatusCopy(status: CustomerOrderPaymentStatus) {
  return {
    paid: { label: "پرداخت موفق", className: "text-success" },
    pending: { label: "در انتظار بررسی", className: "text-warning" },
    failed: { label: "پرداخت ناموفق", className: "text-destructive" },
  }[status];
}
