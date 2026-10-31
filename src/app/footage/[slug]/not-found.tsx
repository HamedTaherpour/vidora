import Link from "next/link";

import { Button } from "@/components/ui/button";
import { PublicSiteFooter } from "@/modules/footage/public/components/public-site-footer";
import { PublicSiteHeader } from "@/modules/footage/public/components/public-site-header";
import { preparePublicFootageCategories } from "@/modules/footage/public/detail/prepare-public-footage-detail";

export default function FootageNotFound() {
  return (
    <div className="min-h-screen bg-background">
      <PublicSiteHeader categories={preparePublicFootageCategories()} />
      <main className="container-storefront flex min-h-[55vh] flex-col items-center justify-center gap-5 py-16 text-center">
        <p className="text-sm font-medium text-primary">فوتیج پیدا نشد</p>
        <h1 className="text-3xl leading-10 font-bold">
          این صفحه دیگر در دسترس نیست
        </h1>
        <p className="max-w-prose text-base leading-8 text-muted-foreground">
          لینک فوتیج را بررسی کنید یا از مجموعه عمومی، یک فوتیج دیگر انتخاب
          کنید.
        </p>
        <Button render={<Link href="/footage" />} nativeButton={false}>
          بازگشت به فوتیج‌ها
        </Button>
      </main>
      <PublicSiteFooter />
    </div>
  );
}
