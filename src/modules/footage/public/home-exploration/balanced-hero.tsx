import Image from "next/image";
import Link from "next/link";

import { HomepageSearchControls } from "@/modules/footage/public/components/homepage-search-controls";
import type { PublicFootageCatalogItem } from "@/modules/footage/public/catalog/public-footage-catalog-store";
import type { PublicFootageCategoryOption } from "@/modules/footage/public/catalog/public-footage-catalog-store";
import { SearchFirstBackground } from "./search-first-background";

export type BalancedHeroProps = {
  footage: PublicFootageCatalogItem[];
  categories: PublicFootageCategoryOption[];
  query?: string;
  category?: string;
  scenarioParam?: string;
};

function readyFootage(footage: PublicFootageCatalogItem[]) {
  return footage.filter(
    (
      item,
    ): item is PublicFootageCatalogItem & {
      cover: { status: "ready"; src: string; altFa: string };
    } => item.cover.status === "ready",
  );
}

function SearchPanel({
  categories,
  query = "",
  category = "",
  scenarioParam,
}: Pick<
  BalancedHeroProps,
  "categories" | "query" | "category" | "scenarioParam"
>) {
  return (
    <div className="w-full rounded-xl border border-border bg-card p-2 shadow-sm">
      <HomepageSearchControls
        query={query}
        category={category}
        categories={categories}
        scenario={scenarioParam}
      />
    </div>
  );
}

export function BalancedHero({
  footage,
  categories,
  query,
  category,
  scenarioParam,
}: BalancedHeroProps) {
  const supportingFootage = readyFootage(footage).slice(0, 3);

  return (
    <section
      data-hero-variant="search-first"
      data-background-variant="gradient"
      className="relative isolate overflow-hidden border-b border-border/70 bg-muted/30"
    >
      <SearchFirstBackground />
      <div className="container-storefront relative z-10 flex flex-col gap-7 py-10 md:py-14">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <p className="text-sm font-medium text-primary">جست‌وجوی فوتیج</p>
          <h1 className="text-4xl leading-tight font-bold tracking-tight md:text-5xl">
            چیزی که در قاب می‌خواهی، پیدا کن
          </h1>
          <p className="max-w-xl text-base leading-8 text-muted-foreground">
            با یک عبارت کوتاه شروع کن؛ بعد دسته‌بندی را انتخاب کن و نتیجه‌ها را
            ببین.
          </p>
        </div>
        <div className="mx-auto w-full max-w-4xl">
          <SearchPanel
            categories={categories}
            query={query}
            category={category}
            scenarioParam={scenarioParam}
          />
        </div>
        {supportingFootage.length > 0 && (
          <div className="grid grid-cols-3 gap-2 md:mx-auto md:max-w-3xl md:gap-4">
            {supportingFootage.map((item) => (
              <Link
                key={item.id}
                href={`/footage/${item.slug}`}
                className="group relative overflow-hidden rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Image
                  src={item.cover.src}
                  alt={item.cover.altFa}
                  width={640}
                  height={360}
                  unoptimized
                  className="aspect-[16/9] w-full object-cover transition-transform duration-200 group-hover:scale-[1.02] motion-reduce:transition-none"
                />
                <span className="absolute inset-x-0 bottom-0 bg-foreground/75 px-2 py-1.5 text-xs text-background">
                  {item.category.nameFa}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
