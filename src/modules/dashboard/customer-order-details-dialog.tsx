import { Download, Printer } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog/dialog";
import { formatToman } from "@/lib/utils";
import { formatCustomerOrderDate } from "./customer-orders";
import { OrderStatusBadge } from "./order-status-badge";
import type { CustomerOrderDetailsDialogProps } from "./customer-order-details-dialog.types";

export function CustomerOrderDetailsDialog(
  props: CustomerOrderDetailsDialogProps,
) {
  const order = props.order;

  return (
    <Dialog
      open={props.open}
      onOpenChange={props.onOpenChange}
      title="جزئیات سفارش"
      className="!max-w-[32rem]"
    >
      {order ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="text-muted-foreground">وضعیت پرداخت</span>
            <OrderStatusBadge status={order.paymentStatus} />
          </div>

          <dl className="overflow-hidden rounded-control border border-border text-sm">
            <div className="grid grid-cols-[minmax(7rem,0.8fr)_minmax(0,1.2fr)] gap-x-4 border-b border-border px-3 py-3 last:border-b-0 sm:px-4">
              <dt className="text-muted-foreground">شماره سفارش</dt>
              <dd dir="ltr" className="min-w-0 text-start font-medium">
                {order.reference}
              </dd>
            </div>
            {order.invoice ? (
              <div className="grid grid-cols-[minmax(7rem,0.8fr)_minmax(0,1.2fr)] gap-x-4 border-b border-border px-3 py-3 last:border-b-0 sm:px-4">
                <dt className="text-muted-foreground">شماره فاکتور</dt>
                <dd dir="ltr" className="min-w-0 text-start font-medium">
                  {order.invoice.number}
                </dd>
              </div>
            ) : null}
            <div className="grid grid-cols-[minmax(7rem,0.8fr)_minmax(0,1.2fr)] gap-x-4 border-b border-border px-3 py-3 last:border-b-0 sm:px-4">
              <dt className="text-muted-foreground">عنوان فوتیج</dt>
              <dd className="min-w-0 text-end font-medium leading-relaxed">
                {order.titleSnapshot}
              </dd>
            </div>
            <div className="grid grid-cols-[minmax(7rem,0.8fr)_minmax(0,1.2fr)] gap-x-4 border-b border-border px-3 py-3 last:border-b-0 sm:px-4">
              <dt className="text-muted-foreground">تاریخ خرید</dt>
              <dd className="min-w-0 text-end">
                {formatCustomerOrderDate(order.purchaseDate)}
              </dd>
            </div>
            {order.invoice ? (
              <div className="grid grid-cols-[minmax(7rem,0.8fr)_minmax(0,1.2fr)] gap-x-4 border-b border-border px-3 py-3 last:border-b-0 sm:px-4">
                <dt className="text-muted-foreground">شماره همراه</dt>
                <dd dir="ltr" className="min-w-0 text-start">
                  {order.invoice.maskedCustomerPhone}
                </dd>
              </div>
            ) : null}
            <div className="grid grid-cols-[minmax(7rem,0.8fr)_minmax(0,1.2fr)] gap-x-4 border-b border-border px-3 py-3 last:border-b-0 sm:px-4">
              <dt className="text-muted-foreground">
                {order.invoice ? "مبلغ پرداخت‌شده" : "مبلغ سفارش"}
              </dt>
              <dd className="min-w-0 text-end tabular-nums">
                {formatToman(order.invoice?.amountToman ?? order.amountToman)}
              </dd>
            </div>
            {(order.invoice?.paymentReference ?? order.paymentReference) ? (
              <div className="grid grid-cols-[minmax(7rem,0.8fr)_minmax(0,1.2fr)] gap-x-4 px-3 py-3 sm:px-4">
                <dt className="text-muted-foreground">شناسه پرداخت</dt>
                <dd dir="ltr" className="min-w-0 break-words text-start">
                  {order.invoice?.paymentReference ?? order.paymentReference}
                </dd>
              </div>
            ) : null}
          </dl>

          {order.invoice ? (
            <div className="space-y-3">
              <div className="flex flex-col gap-2 border-t border-border pt-3 sm:flex-row">
                <Button disabled variant="secondary">
                  <Download aria-hidden="true" />
                  دانلود PDF
                </Button>
                <Button disabled variant="outline">
                  <Printer aria-hidden="true" />
                  چاپ فاکتور
                </Button>
              </div>
              <p
                className="text-xs leading-relaxed text-muted-foreground"
                role="status"
              >
                دانلود و چاپ فاکتور پس از آماده‌شدن زیرساخت رسمی فعال می‌شود.
              </p>
            </div>
          ) : (
            <p
              className="text-sm leading-relaxed text-muted-foreground"
              role="status"
            >
              {order.paymentStatus === "paid"
                ? "پرداخت این سفارش موفق بوده است، اما اطلاعات فاکتور هنوز در دسترس نیست."
                : "برای این وضعیت پرداخت، فاکتور تأییدشده‌ای در دسترس نیست."}
            </p>
          )}
        </div>
      ) : null}
    </Dialog>
  );
}
