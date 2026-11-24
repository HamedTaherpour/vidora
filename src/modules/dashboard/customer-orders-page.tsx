"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FileQuestion, Inbox, SearchX } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { SearchInput } from "@/components/ui/search-input";
import { fa } from "@/lib/utils";
import {
  createCustomerOrdersHref,
  filterCustomerOrders,
  getCustomerOrderPageCount,
  getCustomerOrdersPageItems,
  getCustomerOrdersPage as parseCustomerOrdersPage,
  getCustomerOrdersSearchQuery,
  getCustomerOrdersStatus,
} from "./customer-orders";
import { CustomerOrderDetailsDialog } from "./customer-order-details-dialog";
import { CustomerOrdersTable } from "./customer-orders-table";
import type { CustomerOrder } from "./customer-orders.types";
import type { CustomerOrdersPageProps } from "./customer-orders-page.types";

export function CustomerOrdersPage(props: CustomerOrdersPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedOrder, setSelectedOrder] = useState<CustomerOrder | null>(
    null,
  );
  const query = getCustomerOrdersSearchQuery(searchParams.getAll("q"));
  const status = getCustomerOrdersStatus(searchParams.getAll("status"));
  const page = parseCustomerOrdersPage(searchParams.getAll("page"));
  const source = props.source;

  function updateUrl(next: { query?: string; status?: string; page?: number }) {
    router.replace(
      createCustomerOrdersHref({
        query: next.query ?? query,
        status: next.status ?? status,
        page: next.page ?? 1,
      }),
    );
  }

  const filteredOrders = useMemo(
    () =>
      source.status === "preview"
        ? filterCustomerOrders(source.orders, query, status)
        : [],
    [query, source, status],
  );
  const pages = getCustomerOrderPageCount(filteredOrders.length);
  const currentPage = Math.min(page, pages);
  const visibleOrders = getCustomerOrdersPageItems(filteredOrders, currentPage);

  if (source.status !== "preview") {
    return (
      <div className="space-y-5">
        <OrdersPageIntro />
        <Card>
          <CardContent className="pt-5">
            <EmptyState
              icon={source.status === "error" ? FileQuestion : Inbox}
              title={
                source.status === "error"
                  ? "نمایش سفارش‌ها ممکن نیست"
                  : "سفارش‌ها فعلاً در دسترس نیستند"
              }
              description={
                source.status === "error"
                  ? "لطفاً بعداً دوباره تلاش کنید."
                  : "منبع معتبر سفارش‌های شما هنوز آماده نیست؛ هیچ سابقهٔ خریدی به‌صورت ساختگی نمایش داده نمی‌شود."
              }
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <OrdersPageIntro />
      <section aria-label="جست‌وجو و فیلتر سفارش‌ها" className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="w-full sm:max-w-md">
            <label htmlFor="customer-orders-search" className="sr-only">
              جست‌وجو در سفارش‌ها
            </label>
            <SearchInput
              key={query}
              id="customer-orders-search"
              aria-label="جست‌وجو در سفارش‌ها"
              placeholder="شماره سفارش یا عنوان فوتیج"
              defaultValue={query}
              onSearch={(value) => updateUrl({ query: value, page: 1 })}
              debounce={400}
            />
          </div>
          <div className="flex items-center gap-2">
            <label
              htmlFor="customer-orders-status"
              className="text-sm text-muted-foreground"
            >
              وضعیت
            </label>
            <select
              id="customer-orders-status"
              value={status}
              onChange={(event) =>
                updateUrl({ status: event.target.value, page: 1 })
              }
              className="min-h-11 rounded-field border-line-field border-input bg-field px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="all">همه سفارش‌ها</option>
              <option value="paid">پرداخت موفق</option>
              <option value="pending">در انتظار بررسی</option>
              <option value="failed">پرداخت ناموفق</option>
            </select>
          </div>
        </div>
      </section>

      {visibleOrders.length ? (
        <CustomerOrdersTable
          orders={visibleOrders}
          onDetails={setSelectedOrder}
        />
      ) : (
        <EmptyState
          icon={SearchX}
          title="سفارشی پیدا نشد"
          description="عبارت جست‌وجو یا فیلتر وضعیت را تغییر دهید."
          action={
            <Button
              variant="outline"
              onClick={() => updateUrl({ query: "", status: "all", page: 1 })}
            >
              پاک کردن جست‌وجو و فیلتر
            </Button>
          }
        />
      )}

      {pages > 1 ? (
        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            صفحهٔ {fa(currentPage)} از {fa(pages)}
          </p>
          <Pagination
            page={currentPage}
            total={pages}
            onChange={(nextPage) => updateUrl({ page: nextPage })}
          />
        </div>
      ) : null}

      <CustomerOrderDetailsDialog
        open={Boolean(selectedOrder)}
        order={selectedOrder}
        onOpenChange={(open) => {
          if (!open) setSelectedOrder(null);
        }}
      />
    </div>
  );
}

function OrdersPageIntro() {
  return (
    <header className="space-y-1">
      <h2 className="text-3xl font-bold leading-tight">سفارش‌های من</h2>
      <p className="max-w-2xl text-muted-foreground">
        سوابق خرید، وضعیت پرداخت و اطلاعات فاکتورهای شما در یکجا.
      </p>
    </header>
  );
}
