import { EmptyState } from "@/components/ui/empty-state";
import { fa } from "@/lib/utils";
import { CUSTOMER_DASHBOARD_ROUTES } from "@/modules/dashboard/dashboard-navigation";
import {
  filterCustomerLibraryItems,
  getCustomerLibraryStateCopy,
} from "@/modules/dashboard/customer-library";
import { CustomerLibraryCard } from "@/modules/dashboard/components/customer-library-card";
import { getCustomerLibraryPreview } from "@/modules/dashboard/customer-library-preview";
import { getCustomerLibrarySearchQuery } from "@/modules/dashboard/customer-library-search";
import { requireDashboardCustomer } from "@/modules/dashboard/require-dashboard-customer";
import { LibraryBig, SearchX } from "lucide-react";
import { CustomerLibrarySearch } from "@/modules/dashboard/components/customer-library-search";

type DashboardLibraryPageProps = {
  searchParams: Promise<{ q?: string | string[] }>;
};

export default async function DashboardLibraryPage({
  searchParams,
}: DashboardLibraryPageProps) {
  const customer = await requireDashboardCustomer(
    CUSTOMER_DASHBOARD_ROUTES.library,
  );
  const query = getCustomerLibrarySearchQuery((await searchParams).q);
  const previewItems = getCustomerLibraryPreview(customer);
  const filteredItems = previewItems
    ? filterCustomerLibraryItems(
        previewItems.map((preview) => preview.item),
        query,
      )
    : [];
  const filteredIds = new Set(filteredItems.map((item) => item.id));
  const visiblePreviewItems = previewItems?.filter(({ item }) =>
    filteredIds.has(item.id),
  );
  const stateCopy = getCustomerLibraryStateCopy("unavailable");
  return (
    <div className="space-y-5">
      <section className="space-y-1">
        <h2 className="text-3xl font-bold leading-tight">کتابخانه من</h2>
        <p className="max-w-2xl text-muted-foreground">
          فوتیج‌های خریداری‌شده خود را اینجا مشاهده و مدیریت کنید.
        </p>
      </section>

      <section aria-label="مجموعه کتابخانه" className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CustomerLibrarySearch />
          {visiblePreviewItems?.length ? (
            <p className="text-sm text-muted-foreground" aria-live="polite">
              {fa(visiblePreviewItems.length)} مورد
            </p>
          ) : null}
        </div>

        {visiblePreviewItems?.length ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {visiblePreviewItems.map((preview) => (
              <CustomerLibraryCard key={preview.reference} preview={preview} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={query ? SearchX : LibraryBig}
            title={
              previewItems
                ? "نتیجه‌ای برای جست‌وجوی شما پیدا نشد"
                : stateCopy.title
            }
            description={
              previewItems
                ? `برای «${query}» موردی در کتابخانهٔ نمایشی پیدا نشد.`
                : stateCopy.description
            }
          />
        )}
      </section>
    </div>
  );
}
