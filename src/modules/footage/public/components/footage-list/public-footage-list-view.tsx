import { FootageCard } from "@/modules/footage/public/components/footage-card/footage-card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import type { PublicFootageListViewProps } from "@/modules/footage/public/components/footage-list/public-footage-list-view.types";

export function PublicFootageListView(props: PublicFootageListViewProps) {
  const {
    footage,
    scenario = "populated",
    query = "",
    category = "",
    messageFa,
  } = props;

  if (scenario === "loading") {
    return (
      <section className="container-storefront py-10 md:py-16" aria-busy="true">
        <div className="flex flex-col gap-3" role="status">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-10 w-3/4 max-w-xl" />
          <Skeleton className="h-5 w-full max-w-2xl" />
        </div>
        <p className="mt-10 text-muted-foreground">در حال بارگذاری فوتیج‌ها…</p>
      </section>
    );
  }

  if (scenario === "error") {
    return (
      <section className="container-storefront py-10 md:py-16">
        <Alert variant="destructive">
          <AlertTitle>نمایش فوتیج‌ها ممکن نیست</AlertTitle>
          <AlertDescription>
            {messageFa ?? "بارگذاری اطلاعات با مشکل روبه‌رو شد."}
          </AlertDescription>
        </Alert>
      </section>
    );
  }

  return (
    <div className="container-storefront flex flex-col gap-8 py-10 md:gap-12 md:py-16">
      {scenario === "unavailable" && (
        <div
          className="rounded-2xl border border-dashed border-border bg-muted/50 p-6 text-center"
          role="status"
        >
          <h2 className="text-ui-h2 font-semibold">
            فوتیج‌ها فعلاً در دسترس نیستند
          </h2>
          <p className="mt-2 text-muted-foreground">
            {messageFa ?? "این بخش فعلاً در دسترس نیست."}
          </p>
        </div>
      )}
      {footage.length === 0 ? (
        <p
          className="rounded-xl border border-dashed border-border bg-muted p-8 text-center text-muted-foreground"
          role="status"
        >
          {query.length > 0 || category.length > 0
            ? "با این جست‌وجو یا دسته‌بندی فوتیجی پیدا نشد."
            : "هنوز فوتیج منتشرشده‌ای برای نمایش وجود ندارد."}
        </p>
      ) : (
        <section aria-labelledby="public-footage-heading">
          <h2 id="public-footage-heading" className="sr-only">
            فهرست فوتیج‌ها
          </h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {footage.map((item) => (
              <FootageCard key={item.id} footage={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
