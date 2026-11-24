import { Eye } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatToman } from "@/lib/utils";
import { formatCustomerOrderDate } from "./customer-orders";
import { OrderStatusBadge } from "./order-status-badge";
import type { CustomerOrdersTableProps } from "./customer-orders-table.types";

export function CustomerOrdersTable(props: CustomerOrdersTableProps) {
  return (
    <>
      <div className="hidden overflow-hidden rounded-surface border-line border-border bg-card shadow-surface md:block">
        <table className="w-full text-sm">
          <caption className="sr-only">فهرست سفارش‌های من</caption>
          <thead className="border-b border-border bg-muted/50 text-xs text-muted-foreground">
            <tr>
              <th scope="col" className="px-4 py-3 text-start font-medium">
                شماره سفارش
              </th>
              <th scope="col" className="px-4 py-3 text-start font-medium">
                عنوان فوتیج
              </th>
              <th scope="col" className="px-4 py-3 text-start font-medium">
                تاریخ
              </th>
              <th scope="col" className="px-4 py-3 text-start font-medium">
                مبلغ
              </th>
              <th scope="col" className="px-4 py-3 text-start font-medium">
                وضعیت پرداخت
              </th>
              <th scope="col" className="px-4 py-3 text-start font-medium">
                جزئیات
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {props.orders.map((order) => (
              <tr
                key={order.reference}
                className="transition-colors hover:bg-accent/40"
              >
                <td className="px-4 py-4 align-middle">
                  <span dir="ltr" className="font-medium">
                    {order.reference}
                  </span>
                </td>
                <td className="max-w-xs px-4 py-4 align-middle font-medium">
                  {order.titleSnapshot}
                </td>
                <td className="px-4 py-4 align-middle text-muted-foreground">
                  {formatCustomerOrderDate(order.purchaseDate)}
                </td>
                <td className="px-4 py-4 align-middle tabular-nums">
                  {formatToman(order.amountToman)}
                </td>
                <td className="px-4 py-4 align-middle">
                  <OrderStatusBadge status={order.paymentStatus} />
                </td>
                <td className="px-4 py-4 align-middle">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => props.onDetails(order)}
                  >
                    <Eye aria-hidden="true" />
                    مشاهده
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-3 md:hidden">
        {props.orders.map((order) => (
          <article
            key={order.reference}
            className="rounded-surface border-line border-border bg-card p-4 shadow-surface"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">شماره سفارش</p>
                <p dir="ltr" className="mt-1 truncate font-medium">
                  {order.reference}
                </p>
              </div>
              <OrderStatusBadge status={order.paymentStatus} />
            </div>
            <h3 className="mt-4 font-semibold leading-relaxed">
              {order.titleSnapshot}
            </h3>
            <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-3 text-sm">
              <div>
                <dt className="text-xs text-muted-foreground">تاریخ</dt>
                <dd className="mt-1">
                  {formatCustomerOrderDate(order.purchaseDate)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">مبلغ</dt>
                <dd className="mt-1 tabular-nums">
                  {formatToman(order.amountToman)}
                </dd>
              </div>
            </dl>
            <Button
              variant="outline"
              className="mt-4 w-full"
              onClick={() => props.onDetails(order)}
            >
              <Eye aria-hidden="true" />
              مشاهده جزئیات و فاکتور
            </Button>
          </article>
        ))}
      </div>
    </>
  );
}
