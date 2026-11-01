"use client";

import { useEffect } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { PublicSiteFooter } from "@/modules/footage/public/components/public-site-footer";
import { PublicSiteHeader } from "@/modules/footage/public/components/public-site-header";
import { preparePublicFootageCategories } from "@/modules/footage/public/detail/prepare-public-footage-detail";

type FootageErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function FootageError({ error, reset }: FootageErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background">
      <PublicSiteHeader categories={preparePublicFootageCategories()} />
      <main className="container-storefront flex min-h-[55vh] flex-col items-center justify-center gap-5 py-16 text-center">
        <p className="text-sm font-medium text-destructive">
          خطا در نمایش فوتیج
        </p>
        <h1 className="text-3xl leading-10 font-bold">
          نمایش این صفحه ممکن نشد
        </h1>
        <p className="max-w-prose text-base leading-8 text-muted-foreground">
          لطفاً دوباره تلاش کنید. اگر مشکل ادامه داشت، بعداً به این صفحه
          برگردید.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button onClick={reset}>تلاش دوباره</Button>
          <Button
            render={<Link href="/search" />}
            nativeButton={false}
            variant="outline"
          >
            بازگشت به فوتیج‌ها
          </Button>
        </div>
      </main>
      <PublicSiteFooter />
    </div>
  );
}
