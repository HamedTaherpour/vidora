import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { fa } from "@/lib/utils";
import { Marquee } from "@/components/animations/marquee";
import { Reveal } from "@/components/animations/reveal";
import { createHomeCategoryHref } from "./home-page.utils";
import type { HomeCategoryDiscoveryProps } from "./home-category-discovery.types";

export function HomeCategoryDiscovery(props: HomeCategoryDiscoveryProps) {
  const { categories, fixtureMode } = props;
  return (
    <Reveal>
      <section
        className="border-y border-border/70 bg-card/40"
        aria-labelledby="categories-title"
      >
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-8 max-w-xl">
            <p className="mb-2 text-sm font-semibold text-brand">
              پیدا کردن فوتیج، از یک دسته شروع می‌شود
            </p>
            <h2 id="categories-title" className="text-3xl font-bold">
              جست‌وجوی فوتیج بر اساس دسته‌بندی
            </h2>
            <p className="mt-4 text-foreground/80">
              دسته‌ای را انتخاب کنید تا مستقیم به فوتیج‌های همان موضوع برسید.
            </p>
          </div>
          {categories.length ? (
            <Marquee>
              {categories.map((category) => (
                <Link
                  key={category.slug}
                  href={createHomeCategoryHref(category.slug)}
                  className="group inline-flex min-h-14 min-w-48 items-center justify-between gap-4 rounded-surface border-line border-border bg-background px-5 py-3 transition-colors hover:border-brand/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span>
                    <strong className="block text-lg">{category.nameFa}</strong>
                    <span className="text-sm text-muted-foreground">
                      {fa(category.count)} فوتیج
                    </span>
                  </span>
                  <ArrowLeft
                    aria-hidden="true"
                    className="size-5 text-muted-foreground"
                  />
                </Link>
              ))}
            </Marquee>
          ) : (
            <p className="rounded-surface border-line border-border bg-background p-6 text-sm text-muted-foreground">
              دسته‌بندی‌ها بعد از انتشار فوتیج‌ها اینجا نمایش داده می‌شوند.
            </p>
          )}
          {fixtureMode && (
            <p className="mt-4 text-xs text-muted-foreground">
              دسته‌های نمایشی فقط برای بررسی تجربهٔ محلی فعال‌اند.
            </p>
          )}
        </div>
      </section>
    </Reveal>
  );
}
