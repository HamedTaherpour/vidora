import Link from "next/link";
import { Clapperboard } from "lucide-react";
import { HomeCategoryMenu } from "./home-category-menu";
import type { HomeHeaderProps } from "./home-header.types";

export function HomeHeader(props: HomeHeaderProps) {
  const { className, categories } = props;
  return (
    <header className={`sticky top-0 z-40 ${className ?? ""}`}>
      <div className="mx-auto flex min-h-18 max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:gap-6 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-control focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className="flex size-10 items-center justify-center rounded-control bg-primary text-primary-foreground">
            <Clapperboard aria-hidden="true" className="size-5" />
          </span>
          <span>
            <strong className="block text-lg leading-none">ویدورا</strong>
            <span className="text-xs text-muted-foreground">
              فوتیج برای قاب‌های ماندگار
            </span>
          </span>
        </Link>
        <nav
          aria-label="ناوبری اصلی"
          className="flex items-center gap-2 text-sm text-muted-foreground sm:gap-5"
        >
          <HomeCategoryMenu categories={categories} />
          <Link
            href="/search"
            className="hidden min-h-11 items-center transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:inline-flex"
          >
            جست‌وجوی فوتیج
          </Link>
          <Link
            href="/blog"
            className="hidden min-h-11 items-center transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:inline-flex"
          >
            مجله
          </Link>
          <Link
            href="/library"
            className="hidden min-h-11 items-center transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:inline-flex"
          >
            کتابخانهٔ من
          </Link>
        </nav>
        <Link
          href="/login"
          className="min-h-11 shrink-0 rounded-control border-line border-border px-3 py-2 text-sm font-semibold transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:px-4"
        >
          ورود
        </Link>
      </div>
    </header>
  );
}
