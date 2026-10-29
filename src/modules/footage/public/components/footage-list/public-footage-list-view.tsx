import { FootageCard } from "@/modules/footage/public/components/footage-card/footage-card";
import type { PublicFootageListViewProps } from "@/modules/footage/public/components/footage-list/public-footage-list-view.types";

export function PublicFootageListView(props: PublicFootageListViewProps) {
  const { footage } = props;

  return (
    <div className="container-storefront flex flex-col gap-8 py-10 md:gap-12 md:py-16">
      <header className="flex max-w-3xl flex-col gap-3">
        <p className="text-ui-small font-medium text-primary">ویدورا</p>
        <h1 className="text-ui-h1 font-semibold">فوتیج‌های منتخب</h1>
        <p className="text-ui-body text-muted-foreground">
          فوتیج‌های آماده برای استفاده در پروژه‌های ویدیویی شما.
        </p>
      </header>

      {footage.length === 0 ? (
        <p
          className="rounded-xl border border-dashed border-border bg-muted p-8 text-center text-muted-foreground"
          role="status"
        >
          هنوز فوتیج منتشرشده‌ای برای نمایش وجود ندارد.
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
