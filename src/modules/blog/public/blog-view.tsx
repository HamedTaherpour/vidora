import Image from "next/image";
import Link from "next/link";
import { ArrowLeftIcon, BookOpenIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { PublicSiteFooter } from "@/modules/footage/public/components/public-site-footer";
import { PublicSiteHeader } from "@/modules/footage/public/components/public-site-header";
import { preparePublicFootageCategories } from "@/modules/footage/public/detail/prepare-public-footage-detail";
import {
  BLOG_PREVIEW_CATEGORIES,
  type BlogPreviewArticle,
  type BlogPreviewCategory,
  type BlogPreviewRouteData,
} from "./blog-preview.types";
import { createBlogPreviewHref } from "./blog-preview-utils";

function BlogChrome({
  data,
  children,
}: {
  data: BlogPreviewRouteData;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <PublicSiteHeader categories={preparePublicFootageCategories()} />
      <main>
        <div className="border-b bg-muted/40">
          <div className="container-storefront py-4">
            <Badge variant="outline">پیش‌نمایش UI · فقط fixture</Badge>
            <p className="mt-2 text-sm text-muted-foreground">
              این یادداشت‌ها نمونه طراحی هستند و محتوای منتشرشده واقعی نیستند.
            </p>
          </div>
        </div>
        <div className="container-storefront flex flex-col gap-8 py-8 md:gap-12 md:py-12">
          <header className="max-w-2xl border-b border-border/70 pb-8">
            {data.view === "listing" ? (
              <h1 className="text-3xl leading-10 font-bold tracking-tight md:text-4xl">
                یادداشت‌های ویدورا
              </h1>
            ) : (
              <p className="text-3xl leading-10 font-bold tracking-tight md:text-4xl">
                یادداشت‌های ویدورا
              </p>
            )}
            <p className="mt-3 text-base leading-7 text-muted-foreground">
              راهنماها و ایده‌هایی برای پیدا کردن و استفاده بهتر از فوتیج.
            </p>
          </header>
          {children}
        </div>
      </main>
      <PublicSiteFooter />
    </div>
  );
}

function CategoryNavigation({
  category,
  scenario,
}: {
  category: BlogPreviewCategory["slug"];
  scenario: BlogPreviewRouteData["scenario"];
}) {
  return (
    <nav aria-label="دسته‌بندی یادداشت‌ها" className="flex flex-wrap gap-2">
      {BLOG_PREVIEW_CATEGORIES.map((item) => (
        <Link
          key={item.slug}
          href={createBlogPreviewHref({
            view: "listing",
            scenario,
            category: item.slug,
          })}
          className={`rounded-full border px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${item.slug === category ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-muted"}`}
        >
          {item.labelFa}
        </Link>
      ))}
    </nav>
  );
}

function LoadingState() {
  return (
    <section aria-busy="true" aria-labelledby="loading-heading">
      <h2 id="loading-heading" className="sr-only">
        در حال بارگذاری یادداشت‌ها
      </h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {["one", "two", "three"].map((item) => (
          <div key={item} className="flex flex-col gap-4">
            <Skeleton className="aspect-[4/3] w-full" />
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-5 w-4/5" />
          </div>
        ))}
      </div>
      <p className="mt-6 text-sm text-muted-foreground" role="status">
        در حال آماده‌سازی پیش‌نمایش…
      </p>
    </section>
  );
}

function ErrorState() {
  return (
    <Alert variant="destructive">
      <AlertTitle>نمایش یادداشت‌ها ممکن نیست</AlertTitle>
      <AlertDescription>
        این خطا در محیط fixture شبیه‌سازی شده است. دوباره بعداً تلاش کنید.
      </AlertDescription>
    </Alert>
  );
}

function EmptyState({ category }: { category: BlogPreviewCategory["slug"] }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
        <BookOpenIcon aria-hidden="true" className="text-muted-foreground" />
        <h2 className="text-2xl leading-9 font-semibold">
          یادداشتی در این دسته وجود ندارد
        </h2>
        <p className="max-w-md leading-7 text-muted-foreground">
          این حالت فقط برای بررسی طراحی خالی است و به محتوای واقعی اشاره
          نمی‌کند.
        </p>
        <Link
          href={createBlogPreviewHref({
            view: "listing",
            scenario: "populated",
            category,
          })}
          className="rounded-md px-3 py-2 text-sm font-medium text-primary underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          بازگشت به یادداشت‌ها
        </Link>
      </CardContent>
    </Card>
  );
}

function BlogArticleCard({
  article,
  scenario,
}: {
  article: BlogPreviewArticle;
  scenario: BlogPreviewRouteData["scenario"];
}) {
  return (
    <Card className="h-full border-border/70 shadow-none">
      <Link
        href={createBlogPreviewHref({
          view: "article",
          scenario,
          slug: article.slug,
        })}
        className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
      >
        <Image
          src={article.coverSrc}
          alt={article.coverAltFa}
          width={1280}
          height={720}
          unoptimized
          className="aspect-[16/9] w-full object-cover transition-transform duration-300 group-hover:scale-[1.02] motion-reduce:transition-none"
        />
        <CardHeader className="gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">{article.categoryLabelFa}</Badge>
            <span className="text-xs text-muted-foreground">
              {article.readingTimeFa}
            </span>
          </div>
          <CardTitle className="text-xl leading-8">{article.titleFa}</CardTitle>
          <CardDescription className="leading-6">
            {article.excerptFa}
          </CardDescription>
        </CardHeader>
      </Link>
    </Card>
  );
}

function ListingView({ data }: { data: BlogPreviewRouteData }) {
  if (data.scenario === "loading") return <LoadingState />;
  if (data.scenario === "error") return <ErrorState />;
  return (
    <>
      <CategoryNavigation category={data.category} scenario={data.scenario} />
      {data.articles.length === 0 ? (
        <EmptyState category={data.category} />
      ) : (
        <section aria-labelledby="blog-listing-heading">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">یادداشت‌های نمونه</p>
              <h2
                id="blog-listing-heading"
                className="mt-1 text-2xl leading-9 font-semibold"
              >
                برای شروع یک موضوع انتخاب کنید
              </h2>
            </div>
            <span className="text-sm text-muted-foreground">
              {data.articles.length} یادداشت
            </span>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {data.articles.map((article) => (
              <BlogArticleCard
                key={article.slug}
                article={article}
                scenario={data.scenario}
              />
            ))}
          </div>
        </section>
      )}
    </>
  );
}

function ArticleView({ data }: { data: BlogPreviewRouteData }) {
  if (data.scenario === "loading") return <LoadingState />;
  if (data.scenario === "error") return <ErrorState />;
  if (!data.article) {
    return (
      <Alert variant="destructive">
        <AlertTitle>مقاله پیدا نشد</AlertTitle>
        <AlertDescription>
          این آدرس فقط برای بررسی وضعیت missing article است و به محتوای واقعی
          متصل نیست.
        </AlertDescription>
      </Alert>
    );
  }
  const article = data.article;
  return (
    <article className="mx-auto max-w-3xl">
      <Link
        href={createBlogPreviewHref({
          view: "listing",
          scenario: data.scenario,
          category: data.category,
        })}
        className="mb-6 inline-flex items-center gap-2 rounded-md text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        بازگشت به فهرست
        <ArrowLeftIcon aria-hidden="true" />
      </Link>
      <header className="flex flex-col gap-4">
        <Badge variant="outline" className="w-fit">
          {article.categoryLabelFa} · محتوای نمونه
        </Badge>
        <h1 className="text-3xl leading-10 font-bold tracking-tight md:text-5xl md:leading-tight">
          {article.titleFa}
        </h1>
        <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
          {article.excerptFa}
        </p>
        <p className="text-sm text-muted-foreground">
          {article.publishedAt} · {article.readingTimeFa}
        </p>
      </header>
      <figure className="my-8 overflow-hidden rounded-xl">
        <Image
          src={article.coverSrc}
          alt={article.coverAltFa}
          width={1280}
          height={720}
          unoptimized
          priority
          className="aspect-video w-full object-cover"
        />
        <figcaption className="mt-2 text-xs text-muted-foreground">
          تصویر نمایشی برای مقایسه طرح؛ این مقاله fixture است.
        </figcaption>
      </figure>
      <div className="flex flex-col gap-8 text-base leading-8">
        {article.body.map((section) => (
          <section
            key={section.headingFa}
            aria-labelledby={`heading-${section.headingFa}`}
          >
            <h2
              id={`heading-${section.headingFa}`}
              className="mb-3 text-2xl leading-9 font-semibold"
            >
              {section.headingFa}
            </h2>
            {section.paragraphsFa.map((paragraph) => (
              <p key={paragraph} className="mb-3 last:mb-0">
                {paragraph}
              </p>
            ))}
          </section>
        ))}
      </div>
      <Separator className="my-10" />
      <section aria-labelledby="related-footage-heading">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2
            id="related-footage-heading"
            className="text-xl leading-8 font-semibold"
          >
            فوتیج‌های مرتبط در محیط نمونه
          </h2>
          <BookOpenIcon aria-hidden="true" className="text-muted-foreground" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {article.relatedFootage.map((footage) => (
            <Card key={footage.href} size="sm">
              <CardContent className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium">{footage.titleFa}</p>
                  <p className="text-xs text-muted-foreground">
                    {footage.categoryFa}
                  </p>
                </div>
                <Button
                  nativeButton={false}
                  size="sm"
                  variant="outline"
                  render={<Link href={footage.href} />}
                >
                  مشاهده
                  <ArrowLeftIcon data-icon="inline-end" aria-hidden="true" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </article>
  );
}

export function BlogView({ data }: { data: BlogPreviewRouteData }) {
  return (
    <BlogChrome data={data}>
      {data.view === "listing" ? (
        <ListingView data={data} />
      ) : (
        <ArticleView data={data} />
      )}
    </BlogChrome>
  );
}
