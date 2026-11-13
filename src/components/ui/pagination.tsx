"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { fa } from "@/lib/utils";

export type PaginationProps = {
  page: number;
  total: number;
  onChange: (page: number) => void;
};

export function Pagination({ page, total, onChange }: PaginationProps) {
  if (total <= 1) return null;
  return (
    <nav
      aria-label="صفحه‌بندی"
      className="flex items-center justify-center gap-2"
    >
      <button
        type="button"
        aria-label="صفحهٔ قبل"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        className="flex size-11 items-center justify-center rounded-control border-line border-border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-40"
      >
        <ChevronRight aria-hidden="true" className="size-4" />
      </button>
      {Array.from({ length: total }, (_, index) => index + 1).map((item) => (
        <button
          key={item}
          type="button"
          aria-current={item === page ? "page" : undefined}
          onClick={() => onChange(item)}
          className={`flex size-11 items-center justify-center rounded-control border-line border-border text-sm transition-colors ${item === page ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground"}`}
        >
          {fa(item)}
        </button>
      ))}
      <button
        type="button"
        aria-label="صفحهٔ بعد"
        disabled={page >= total}
        onClick={() => onChange(page + 1)}
        className="flex size-11 items-center justify-center rounded-control border-line border-border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-40"
      >
        <ChevronLeft aria-hidden="true" className="size-4" />
      </button>
    </nav>
  );
}
