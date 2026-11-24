import { CircleUserRound, LockKeyhole } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { CustomerProfileProps } from "./customer-profile.types";

export function CustomerProfile(props: CustomerProfileProps) {
  const { profile } = props;

  return (
    <div className="space-y-5">
      <header className="space-y-1">
        <h2 className="text-3xl font-bold leading-tight">پروفایل من</h2>
        <p className="max-w-2xl text-muted-foreground">
          اطلاعات حساب کاربری شما در این بخش نمایش داده می‌شود.
        </p>
      </header>

      <Card>
        <CardHeader className="gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CircleUserRound aria-hidden="true" className="size-4 text-brand" />
            <span>اطلاعات حساب</span>
          </div>
          <h3 className="text-xl font-semibold">حساب کاربری ویدورا</h3>
        </CardHeader>
        <CardContent>
          <dl className="divide-y divide-border rounded-control border border-border">
            <div className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <dt className="text-sm text-muted-foreground">شمارهٔ همراه</dt>
              <dd dir="ltr" className="font-semibold tabular-nums">
                {profile.phone}
              </dd>
            </div>
          </dl>
          <div className="mt-4 flex items-start gap-2 text-sm text-muted-foreground">
            <LockKeyhole
              aria-hidden="true"
              className="mt-0.5 size-4 shrink-0"
            />
            <p className="leading-relaxed">
              این شماره برای ورود و شناسایی حساب شما استفاده می‌شود و فعلاً قابل
              ویرایش نیست.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
