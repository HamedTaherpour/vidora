import Link from "next/link";
import { ArrowLeft, CircleUserRound, ReceiptText } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { maskCustomerPhone } from "@/modules/dashboard/customer-phone";
import type {
  CustomerDashboardProps,
  CustomerPurchaseState,
  CustomerPurchaseStateCopy,
} from "./customer-dashboard.types";

export function CustomerDashboard(props: CustomerDashboardProps) {
  const { customer, purchaseState } = props;
  const purchaseCopy = getPurchaseStateCopy(purchaseState);

  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <p className="text-sm text-brand">نمای کلی حساب</p>
        <h2 className="text-3xl font-bold leading-tight">خوش آمدید</h2>
        <p className="max-w-2xl text-muted-foreground">
          خریدها و فایل‌های در دسترس شما از همین‌جا قابل پیگیری است.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2" aria-label="خلاصه حساب">
        <Card>
          <CardHeader className="gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CircleUserRound
                aria-hidden="true"
                className="size-4 text-brand"
              />
              <span>حساب شما</span>
            </div>
            <p className="text-lg font-semibold" dir="ltr">
              {maskCustomerPhone(customer.phone)}
            </p>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              شمارهٔ همراه شما به‌صورت محافظت‌شده نمایش داده می‌شود.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <ReceiptText aria-hidden="true" className="size-4 text-brand" />
              <span>خریدها</span>
            </div>
            <p className="text-lg font-semibold">{purchaseCopy.summary}</p>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {purchaseCopy.description}
            </p>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold">خریدهای اخیر</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                خریدهای تأییدشده و دسترسی‌های شما اینجا نمایش داده می‌شوند.
              </p>
            </div>
            <ReceiptText aria-hidden="true" className="size-6 text-brand" />
          </div>
        </CardHeader>
        <CardContent>
          <EmptyState
            title={purchaseCopy.title}
            description={purchaseCopy.emptyDescription}
            action={
              <Link
                href="/search"
                className="inline-flex min-h-10 items-center gap-2 rounded-control bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                جست‌وجوی فوتیج
                <ArrowLeft aria-hidden="true" />
              </Link>
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}

export function getPurchaseStateCopy(
  state: CustomerPurchaseState,
): CustomerPurchaseStateCopy {
  if (state === "empty") {
    return {
      summary: "هنوز خریدی ثبت نشده",
      description:
        "پس از خرید، فوتیج‌های شما در کتابخانهٔ حساب قابل دسترسی هستند.",
      title: "هنوز خریدی برای نمایش ندارید",
      emptyDescription: "برای شروع، فوتیج‌های آمادهٔ ویدورا را بررسی کنید.",
    };
  }

  if (state === "error") {
    return {
      summary: "نمایش خریدها ممکن نیست",
      description: "لطفاً بعداً دوباره تلاش کنید.",
      title: "خریدها فعلاً در دسترس نیستند",
      emptyDescription: "نمایش سوابق خرید با مشکل روبه‌رو شده است.",
    };
  }

  return {
    summary: "اطلاعات خرید فعلاً در دسترس نیست",
    description:
      "به‌محض آماده‌شدن اطلاعات حساب، سوابق خرید شما اینجا نمایش داده می‌شود.",
    title: "سوابق خرید فعلاً در دسترس نیست",
    emptyDescription:
      "در حال حاضر امکان نمایش سوابق خرید وجود ندارد؛ هیچ سابقه‌ای به‌صورت ساختگی نمایش داده نمی‌شود.",
  };
}
