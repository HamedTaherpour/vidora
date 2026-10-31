import Image from "next/image";
import Link from "next/link";
import { ArrowLeftIcon, ArrowUpLeftIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FootageCard } from "@/modules/footage/public/components/footage-card/footage-card";
import { PublicFootageListView } from "@/modules/footage/public/components/footage-list/public-footage-list-view";
import { PublicSiteFooter } from "@/modules/footage/public/components/public-site-footer";
import { PublicSiteHeader } from "@/modules/footage/public/components/public-site-header";
import { createPublicCategoryHref } from "@/modules/footage/public/components/public-site-header";
import { blogPreviewArticles } from "@/modules/blog/public/blog-preview-fixtures";
import { BalancedHero } from "./balanced-hero";
import type { HomeExplorationProps } from "./home-exploration.types";

function CategoryRail({
  categories,
}: Pick<HomeExplorationProps, "categories">) {
  return (
    <section
      aria-labelledby="homepage-categories-heading"
      className="container-storefront scroll-mt-20 py-10 md:py-14"
    >
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-primary">شروع سریع</p>
          <h2
            id="homepage-categories-heading"
            className="mt-1 text-2xl leading-9 font-bold"
          >
            موضوعی که دنبالش هستی
          </h2>
        </div>
        <Link
          className="hidden items-center gap-1 text-sm font-medium text-primary sm:flex"
          href="/#footage-listing"
        >
          همه فوتیج‌ها{" "}
          <ArrowLeftIcon data-icon="inline-end" aria-hidden="true" />
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {categories.slice(0, 8).map((category) => (
          <Link
            key={category.value}
            href={createPublicCategoryHref(category.value)}
            className="group rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/40 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="flex items-center justify-between gap-2 font-medium">
              {category.labelFa}
              <ArrowUpLeftIcon
                className="text-muted-foreground transition-transform group-hover:-translate-x-0.5 motion-reduce:transition-none"
                aria-hidden="true"
              />
            </span>
            <span className="mt-2 block text-xs text-muted-foreground">
              مشاهده قاب‌های مرتبط
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function FootageSection({
  id,
  title,
  eyebrow,
  footage,
}: {
  id: string;
  title: string;
  eyebrow: string;
  footage: HomeExplorationProps["footage"];
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className="container-storefront scroll-mt-20 py-10 md:py-14"
    >
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-primary">{eyebrow}</p>
          <h2
            id={`${id}-heading`}
            className="mt-1 text-2xl leading-9 font-bold"
          >
            {title}
          </h2>
        </div>
        <Link
          href="/#footage-listing"
          className="flex items-center gap-1 text-sm font-medium text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          مشاهده همه <ArrowLeftIcon data-icon="inline-end" aria-hidden="true" />
        </Link>
      </div>
      {footage.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {footage.slice(0, 4).map((item) => (
            <FootageCard key={item.id} footage={item} />
          ))}
        </div>
      ) : (
        <p
          className="rounded-xl border border-dashed border-border bg-muted p-8 text-center text-muted-foreground"
          role="status"
        >
          هنوز فوتیج منتشرشده‌ای برای نمایش وجود ندارد.
        </p>
      )}
    </section>
  );
}

function BlogSection() {
  return (
    <section
      aria-labelledby="homepage-blog-heading"
      className="border-t border-border/70 bg-muted/30"
    >
      <div className="container-storefront py-10 md:py-14">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-primary">یادگیری و ایده</p>
            <h2
              id="homepage-blog-heading"
              className="mt-1 text-2xl leading-9 font-bold"
            >
              یادداشت‌هایی برای روایت بهتر
            </h2>
          </div>
          <Link
            href="/blog"
            className="text-sm font-medium text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            همه یادداشت‌ها
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {blogPreviewArticles.map((article) => (
            <Card key={article.slug} className="overflow-hidden shadow-none">
              <Link
                href={`/blog/${article.slug}`}
                className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
              >
                <Image
                  src={article.coverSrc}
                  alt={article.coverAltFa}
                  width={1280}
                  height={720}
                  unoptimized
                  className="aspect-[16/9] w-full object-cover"
                />
                <CardHeader className="gap-2">
                  <Badge variant="outline" className="w-fit">
                    {article.categoryLabelFa}
                  </Badge>
                  <CardTitle className="text-lg leading-7">
                    {article.titleFa}
                  </CardTitle>
                  <CardDescription className="leading-6">
                    {article.excerptFa}
                  </CardDescription>
                </CardHeader>
              </Link>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function CatalogStateNotice({
  scenario,
  messageFa,
}: Pick<HomeExplorationProps, "scenario" | "messageFa">) {
  if (scenario === "loading") {
    return (
      <p
        className="container-storefront py-8 text-muted-foreground"
        role="status"
        aria-busy="true"
      >
        در حال بارگذاری فوتیج‌ها…
      </p>
    );
  }
  if (scenario === "error") {
    return (
      <p className="container-storefront py-8 text-destructive" role="alert">
        {messageFa ?? "نمایش فوتیج‌ها ممکن نیست."}
      </p>
    );
  }
  if (scenario === "unavailable") {
    return (
      <div
        className="container-storefront py-8 text-muted-foreground"
        role="status"
      >
        <p className="font-medium">فوتیج‌ها فعلاً در دسترس نیستند</p>
        <p className="mt-1">{messageFa ?? "این بخش فعلاً در دسترس نیست."}</p>
      </div>
    );
  }
  return null;
}

export function HomeExploration({
  variant,
  footage,
  categories,
  scenario = "populated",
  query = "",
  category = "",
  scenarioParam,
  messageFa,
  requestedPage = 1,
}: HomeExplorationProps) {
  return (
    <div data-variant={variant} className="min-h-screen bg-background">
      <PublicSiteHeader categories={categories} />
      <main>
        <BalancedHero
          footage={footage}
          categories={categories}
          query={query}
          category={category}
          scenarioParam={scenarioParam}
        />
        <CatalogStateNotice scenario={scenario} messageFa={messageFa} />
        <CategoryRail categories={categories} />
        <FootageSection
          id="balanced-featured"
          title="فوتیج‌های منتخب"
          eyebrow="برای دیدن امروز"
          footage={footage}
        />
        <FootageSection
          id="homepage-recent"
          title="تازه‌اضافه‌شده‌ها"
          eyebrow="کشف بعدی"
          footage={[...footage].reverse()}
        />
        <BlogSection />
        <section
          id="footage-listing"
          aria-labelledby="catalog-heading"
          className="scroll-mt-20 border-t border-border/70"
        >
          <div className="container-storefront pt-10 md:pt-14">
            <p className="text-xs leading-5 font-medium text-primary">
              کتابخانه عمومی
            </p>
            <h2
              id="catalog-heading"
              className="mt-1 text-2xl leading-9 font-bold"
            >
              همه فوتیج‌ها
            </h2>
          </div>
          <PublicFootageListView
            footage={footage}
            scenario={scenario}
            query={query}
            category={category}
            messageFa={messageFa}
            requestedPage={requestedPage}
          />
        </section>
      </main>
      <PublicSiteFooter />
    </div>
  );
}
