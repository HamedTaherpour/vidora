import type { ReactNode } from "react";

import { formatTomanDisplay } from "@/modules/footage/format-toman-display";
import type { FootagePublicationStatus } from "@/modules/footage/footage-publication-status";
import type { AdminFootageCatalogViewProps } from "./admin-footage-catalog-view.types";

function catalogHref({ q, page }: { q: string; page: number }): string {
  const params = new URLSearchParams();

  if (q.length > 0) {
    params.set("q", q);
  }

  if (page > 1) {
    params.set("page", String(page));
  }

  const query = params.toString();
  return query.length > 0 ? `/admin/footage?${query}` : "/admin/footage";
}

function EmptyState({ children }: { children: ReactNode }) {
  return (
    <p role="status" className="border border-dashed border-border p-6 text-sm">
      {children}
    </p>
  );
}

function PublicationStatusLabel({
  status,
}: {
  status: FootagePublicationStatus;
}) {
  if (status === "PUBLISHED") {
    return <span>منتشر شده</span>;
  }

  return <span>پیش‌نویس</span>;
}

/**
 * Operational Admin catalog list presentation.
 * Search uses a GET form so the page can stay a Server Component.
 */
export function AdminFootageCatalogView(props: AdminFootageCatalogViewProps) {
  const { catalog } = props;
  const { items, q, page, totalCount, totalPages, emptyReason } = catalog;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 py-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">فهرست فوتیج</h1>
        <p className="text-sm text-muted-foreground">
          مدیریت عملیاتی فهرست فوتیج‌های پیش‌نویس و منتشرشده.
        </p>
      </header>

      <form
        method="get"
        action="/admin/footage"
        className="flex flex-wrap gap-2"
      >
        <label className="sr-only" htmlFor="admin-footage-search">
          جستجو بر اساس عنوان یا اسلاگ
        </label>
        <input
          id="admin-footage-search"
          name="q"
          type="search"
          defaultValue={q}
          placeholder="عنوان یا اسلاگ"
          className="min-w-64 flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="rounded-md border border-border bg-primary px-4 py-2 text-sm text-primary-foreground"
        >
          جستجو
        </button>
      </form>

      {emptyReason === "no_footage" ? (
        <EmptyState>هنوز فوتیجی ثبت نشده است.</EmptyState>
      ) : null}

      {emptyReason === "no_search_results" ? (
        <EmptyState>نتیجه‌ای برای این جستجو یافت نشد.</EmptyState>
      ) : null}

      {emptyReason === "page_out_of_range" ? (
        <EmptyState>
          صفحه درخواستی خارج از محدوده نتایج است.
          {totalPages > 0 ? (
            <>
              {" "}
              <a
                className="underline"
                href={catalogHref({ q, page: totalPages })}
              >
                رفتن به آخرین صفحه
              </a>
            </>
          ) : null}
        </EmptyState>
      ) : null}

      {items.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[48rem] border-collapse text-sm">
            <caption className="sr-only">فهرست فوتیج‌های مدیریتی</caption>
            <thead>
              <tr className="border-b border-border text-start">
                <th scope="col" className="px-3 py-2 font-medium">
                  عنوان
                </th>
                <th scope="col" className="px-3 py-2 font-medium">
                  اسلاگ
                </th>
                <th scope="col" className="px-3 py-2 font-medium">
                  دسته‌بندی
                </th>
                <th scope="col" className="px-3 py-2 font-medium">
                  قیمت
                </th>
                <th scope="col" className="px-3 py-2 font-medium">
                  وضعیت
                </th>
                <th scope="col" className="px-3 py-2 font-medium">
                  به‌روزرسانی
                </th>
                <th scope="col" className="px-3 py-2 font-medium">
                  عملیات
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((row) => (
                <tr key={row.id} className="border-b border-border">
                  <td className="px-3 py-2">{row.titleFa}</td>
                  <td className="px-3 py-2 font-mono text-xs" dir="ltr">
                    {row.slug}
                  </td>
                  <td className="px-3 py-2">{row.category.nameFa}</td>
                  <td className="px-3 py-2">
                    {formatTomanDisplay(row.priceToman)}
                  </td>
                  <td className="px-3 py-2">
                    <PublicationStatusLabel status={row.status} />
                    <span className="sr-only"> ({row.status})</span>
                  </td>
                  <td className="px-3 py-2">
                    <time dateTime={row.updatedAt.toISOString()}>
                      {row.updatedAt.toLocaleString("fa-IR")}
                    </time>
                  </td>
                  <td className="px-3 py-2">
                    <a
                      href={`/admin/footage/${row.id}/edit`}
                      className="underline"
                    >
                      ویرایش
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {totalCount > 0 && totalPages > 0 ? (
        <nav
          aria-label="صفحه‌بندی فهرست فوتیج"
          className="flex flex-wrap items-center justify-between gap-3 text-sm"
        >
          <p>
            صفحه {page.toLocaleString("fa-IR")} از{" "}
            {totalPages.toLocaleString("fa-IR")} — مجموع{" "}
            {totalCount.toLocaleString("fa-IR")} مورد
          </p>
          <div className="flex gap-3">
            {page > 1 ? (
              <a
                className="underline"
                href={catalogHref({ q, page: page - 1 })}
              >
                قبلی
              </a>
            ) : (
              <span className="text-muted-foreground">قبلی</span>
            )}
            {page < totalPages ? (
              <a
                className="underline"
                href={catalogHref({ q, page: page + 1 })}
              >
                بعدی
              </a>
            ) : (
              <span className="text-muted-foreground">بعدی</span>
            )}
          </div>
        </nav>
      ) : null}
    </div>
  );
}

export function AdminAccessDeniedView() {
  return (
    <main className="mx-auto max-w-lg p-6">
      <h1 className="text-xl font-semibold">دسترسی مجاز نیست</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        این بخش فقط برای مدیر سامانه در دسترس است.
      </p>
    </main>
  );
}
