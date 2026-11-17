"use client";

import Link from "next/link";
import { LayoutDashboard, Library, ReceiptText, UserRound } from "lucide-react";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";

import {
  ACCOUNT_NAVIGATION,
  isAccountNavigationItemCurrent,
} from "@/modules/account/account-navigation";

const navigationIcons: readonly LucideIcon[] = [
  LayoutDashboard,
  Library,
  ReceiptText,
  UserRound,
];

/** Renders the shared account routes with a reliable current-page state. */
export function CustomerAccountNavigation() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="ناوبری حساب کاربری"
      className="grid grid-cols-2 gap-2 pb-1 lg:grid-cols-1"
    >
      {ACCOUNT_NAVIGATION.map((item, index) => {
        const Icon = navigationIcons[index];
        const isCurrent = isAccountNavigationItemCurrent(item.href, pathname);

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isCurrent ? "page" : undefined}
            className={[
              "group flex min-h-12 min-w-0 items-center gap-3 rounded-control border px-3 py-3 text-sm transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              isCurrent
                ? "border-brand/50 bg-accent text-accent-foreground"
                : "border-border bg-card hover:bg-accent",
            ].join(" ")}
          >
            <Icon
              aria-hidden="true"
              className={
                isCurrent ? "size-4 shrink-0 text-brand" : "size-4 shrink-0"
              }
            />
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
