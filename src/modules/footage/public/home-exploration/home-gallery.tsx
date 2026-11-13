import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Reveal } from "@/components/animations/reveal";
import { FootageCard } from "./footage-card";
import { HomePagination } from "./home-pagination";
import type { HomeGalleryProps } from "./home-gallery.types";

export function HomeGallery(props: HomeGalleryProps) {
  const { footage, page, totalPages, dataError, fixtureMode } = props;
  return (
    <Reveal>
      <section
        className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24"
        aria-labelledby="gallery-title"
      >
        <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="mb-2 text-sm font-semibold text-brand">
              کتابخانهٔ تصویری ویدورا
            </p>
            <h2 id="gallery-title" className="text-3xl font-bold leading-tight">
              قاب‌هایی برای شروع داستان
            </h2>
            {fixtureMode && (
              <p className="mt-2 text-xs text-muted-foreground">
                داده‌های نمایشی توسعه برای بررسی چیدمان
              </p>
            )}
          </div>
          <Link
            href="/search"
            className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground"
          >
            مشاهدهٔ همهٔ فوتیج‌ها
            <ArrowLeft aria-hidden="true" className="size-4" />
          </Link>
        </div>
        {dataError ? (
          <Card className="p-8 text-center">
            <h3 className="text-lg font-semibold">اتصال به آرشیو برقرار نشد</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              فوتیج‌ها موقتاً بارگذاری نشدند. دوباره تلاش کنید یا جست‌وجوی خود
              را ادامه دهید.
            </p>
          </Card>
        ) : footage.length === 0 ? (
          <Card className="p-8 text-center">
            <h3 className="text-lg font-semibold">
              هنوز فوتیجی برای نمایش نیست
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              به‌زودی قاب‌های تازه‌ای به آرشیو ویدورا اضافه می‌شود.
            </p>
          </Card>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {footage.map((item) => (
              <FootageCard
                key={item.id}
                item={item}
                developmentOnly={fixtureMode}
              />
            ))}
          </div>
        )}
        <HomePagination page={page} totalPages={totalPages} />
      </section>
    </Reveal>
  );
}
