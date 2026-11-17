"use client";

import { AlertTriangle } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import type { DashboardLibraryErrorProps } from "./error.types";

export default function DashboardLibraryError({
  reset,
}: DashboardLibraryErrorProps) {
  return (
    <Card>
      <CardContent className="pt-5">
        <EmptyState
          icon={AlertTriangle}
          title="نمایش کتابخانه با مشکل روبه‌رو شد"
          description="اطلاعات خرید شما فعلاً قابل بارگذاری نیست."
          action={
            <button
              type="button"
              onClick={reset}
              className="inline-flex min-h-10 items-center justify-center rounded-control bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              تلاش دوباره
            </button>
          }
        />
      </CardContent>
    </Card>
  );
}
