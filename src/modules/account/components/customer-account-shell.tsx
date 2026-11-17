import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { CustomerAccountNavigation } from "./customer-account-navigation";
import type { CustomerAccountShellProps } from "./customer-account-shell.types";

export function CustomerAccountShell(props: CustomerAccountShellProps) {
  const { children } = props;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-background/95">
        <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="inline-flex min-h-10 items-center gap-2 rounded-control px-2 font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="grid size-9 place-items-center rounded-control bg-brand text-brand-foreground">
              و
            </span>
            <span>ویدورا</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="hidden text-sm text-muted-foreground sm:inline">
              فضای شخصی شما
            </span>
            <Link
              href="/"
              className="inline-flex min-h-10 items-center gap-2 rounded-control px-3 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              بازگشت به فروشگاه
              <ArrowLeft aria-hidden="true" />
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[16rem_minmax(0,1fr)] lg:px-8 lg:py-10">
        <aside className="min-w-0">
          <div className="mb-4">
            <p className="text-sm text-muted-foreground">حساب کاربری</p>
            <h1 className="mt-1 text-xl font-bold">پنل شخصی ویدورا</h1>
          </div>
          <CustomerAccountNavigation />
        </aside>

        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
