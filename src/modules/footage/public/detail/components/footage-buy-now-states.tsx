import Link from "next/link";
import { CheckCircle2, CircleHelp, LogIn, ShoppingBag } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatTomanDisplay } from "@/modules/footage/format-toman-display";
import type { PublicFootageDetail } from "../public-footage-detail.types";

type FootageBuyNowStatesProps = {
  footage: PublicFootageDetail;
};

export function FootageBuyNowStates(props: FootageBuyNowStatesProps) {
  const { footage } = props;
  const authenticationHref = `/login?returnTo=${encodeURIComponent(`/purchase/${footage.slug}?customer=authenticated`)}`;

  return (
    <Card className="gap-0">
      <CardHeader className="gap-3 border-b">
        <div className="flex items-center justify-between gap-3">
          <CardTitle>خرید تکی فوتیج</CardTitle>
          <Badge variant="accent">بدون اشتراک</Badge>
        </div>
        <p className="text-2xl leading-9 font-bold tabular-nums">
          {formatTomanDisplay(footage.priceToman)}
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 pt-4">
        <div className="flex flex-col gap-2 text-sm leading-6">
          <p className="flex items-start gap-2">
            <CheckCircle2
              className="mt-1 size-4 shrink-0 text-primary"
              aria-hidden="true"
            />
            دسترسی به کیفیت‌های آماده: {footage.qualities.join("، ")}
          </p>
          <p className="flex items-start gap-2">
            <CheckCircle2
              className="mt-1 size-4 shrink-0 text-primary"
              aria-hidden="true"
            />
            خرید فقط برای همین فوتیج انجام می‌شود.
          </p>
        </div>
        <div className="flex flex-col gap-3" aria-label="وضعیت‌های امن خرید">
          <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
            <p className="mb-2 flex items-center gap-2 text-sm font-medium">
              <LogIn className="size-4" aria-hidden="true" /> مهمان
            </p>
            <Button
              render={<Link href={authenticationHref} />}
              nativeButton={false}
              className="w-full"
            >
              ورود و ادامه خرید
            </Button>
          </div>
          <div className="rounded-lg border border-border p-3">
            <p className="mb-2 flex items-center gap-2 text-sm font-medium">
              <ShoppingBag className="size-4" aria-hidden="true" /> کاربر
              واردشده
            </p>
            <Button disabled className="w-full">
              خرید پس از اتصال پرداخت
            </Button>
          </div>
          <Alert className="bg-muted/40">
            <CircleHelp aria-hidden="true" />
            <AlertTitle>وضعیت حساب نامشخص</AlertTitle>
            <AlertDescription>
              تا زمان مشخص‌شدن وضعیت ورود، اقدام خرید غیرفعال می‌ماند.
            </AlertDescription>
          </Alert>
        </div>
        <p className="text-xs leading-5 text-muted-foreground">
          پرداخت در این مرحله شبیه‌سازی‌شده است و سفارش، پرداخت یا دسترسی به
          فایل اصلی ایجاد نمی‌کند.
        </p>
      </CardContent>
    </Card>
  );
}
