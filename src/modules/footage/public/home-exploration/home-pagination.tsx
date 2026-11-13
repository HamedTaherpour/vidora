import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { fa } from "@/lib/utils";
import { createHomePageHref } from "./home-page.utils";
import type { HomePaginationProps } from "./home-pagination.types";

export function HomePagination(props: HomePaginationProps) {
  const { page, totalPages } = props;
  if (totalPages <= 1) return null;
  return (
    <nav
      aria-label="صفحه‌های فوتیج"
      className="mt-8 flex items-center justify-center gap-2"
    >
      <span className="me-2 text-sm text-muted-foreground">
        صفحهٔ {fa(page)} از {fa(totalPages)}
      </span>
      {page > 1 && (
        <Link
          href={createHomePageHref(page - 1)}
          className="inline-flex min-h-11 items-center gap-2 rounded-control border-line border-border px-3 py-2 text-sm hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ArrowRight aria-hidden="true" className="size-4" />
          قبلی
        </Link>
      )}
      {page < totalPages && (
        <Link
          href={createHomePageHref(page + 1)}
          className="inline-flex min-h-11 items-center gap-2 rounded-control bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          بعدی
          <ArrowLeft aria-hidden="true" className="size-4" />
        </Link>
      )}
    </nav>
  );
}
