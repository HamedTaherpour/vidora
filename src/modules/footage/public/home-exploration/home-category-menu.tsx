"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { fa } from "@/lib/utils";
import { createHomeCategoryMenuItems } from "./home-page.utils";
import type { HomeCategoryMenuProps } from "./home-category-menu.types";

export function HomeCategoryMenu(props: HomeCategoryMenuProps) {
  const { categories } = props;
  const menuItems = createHomeCategoryMenuItems(categories);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const firstItemRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        triggerRef.current?.focus();
        return;
      }
      if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
      const items = Array.from(
        rootRef.current?.querySelectorAll<HTMLAnchorElement>(
          '[role="menuitem"]',
        ) ?? [],
      );
      const currentIndex = items.indexOf(
        document.activeElement as HTMLAnchorElement,
      );
      if (currentIndex < 0 || !items.length) return;
      event.preventDefault();
      const nextIndex =
        (currentIndex + (event.key === "ArrowDown" ? 1 : -1) + items.length) %
        items.length;
      items[nextIndex]?.focus();
    };
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    firstItemRef.current?.focus();
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        className="inline-flex min-h-11 items-center gap-1 rounded-control px-2 font-semibold text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:px-3"
        onClick={() => setOpen((current) => !current)}
      >
        دسته‌بندی‌ها
        <ChevronDown aria-hidden="true" className="size-4" />
      </button>
      {open && (
        <div
          role="menu"
          aria-label="دسته‌بندی‌های فوتیج"
          className="absolute inset-s-0 top-full z-50 mt-2 min-w-56 rounded-overlay border-line border-border bg-popover p-2 text-sm text-popover-foreground shadow-overlay"
        >
          {menuItems.length ? (
            menuItems.map((category, index) => (
              <Link
                key={category.slug}
                ref={index === 0 ? firstItemRef : undefined}
                href={category.href}
                role="menuitem"
                className="flex min-h-11 items-center justify-between gap-4 rounded-control px-3 py-2 text-start transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                onClick={() => setOpen(false)}
              >
                <span>{category.nameFa}</span>
                <span className="text-xs text-muted-foreground">
                  {fa(category.count)} فوتیج
                </span>
              </Link>
            ))
          ) : (
            <p
              role="menuitem"
              aria-disabled="true"
              className="px-3 py-2 text-sm text-muted-foreground"
            >
              هنوز دسته‌بندی‌ای برای نمایش وجود ندارد.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
