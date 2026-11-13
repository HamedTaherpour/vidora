import Link from "next/link";
import { fa } from "@/lib/utils";
import type { HomeFooterProps } from "./home-footer.types";
import { createHomeCategoryHref } from "./home-page.utils";

export function HomeFooter(props: HomeFooterProps) {
  const { categories } = props;
  return (
    <footer className="border-t border-border/70">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 text-sm text-muted-foreground sm:px-6 md:grid-cols-[1.4fr_1fr_1fr] lg:px-8">
        <div>
          <strong className="text-base text-foreground">ویدورا</strong>
          <p className="mt-2 max-w-sm leading-7">
            بازار فوتیج حرفه‌ای برای پیدا کردن قاب مناسب پروژه‌های تصویری.
          </p>
          <p className="mt-4 text-xs">© {fa(2026)} ویدورا</p>
        </div>
        <nav
          aria-label="پیوندهای ویدورا"
          className="flex flex-col items-start gap-2"
        >
          <span className="font-semibold text-foreground">دسترسی سریع</span>
          <Link href="/search" className="min-h-10 py-1 hover:text-foreground">
            جست‌وجوی فوتیج
          </Link>
          <Link href="/blog" className="min-h-10 py-1 hover:text-foreground">
            مجلهٔ ویدورا
          </Link>
          <Link href="/login" className="min-h-10 py-1 hover:text-foreground">
            ورود
          </Link>
        </nav>
        <nav
          aria-label="دسته‌بندی‌های پایانی"
          className="flex flex-col items-start gap-2"
        >
          <span className="font-semibold text-foreground">دسته‌بندی‌ها</span>
          {categories.slice(0, 4).map((category) => (
            <Link
              key={category.slug}
              href={createHomeCategoryHref(category.slug)}
              className="min-h-10 py-1 hover:text-foreground"
            >
              {category.nameFa} · {fa(category.count)} فوتیج
            </Link>
          ))}
          {!categories.length && (
            <span className="text-xs">هنوز دسته‌ای منتشر نشده است.</span>
          )}
        </nav>
      </div>
    </footer>
  );
}
