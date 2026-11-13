import Link from "next/link";
import {
  Check,
  Clock3,
  FileVideo,
  Gauge,
  Info,
  LockKeyhole,
  Ruler,
} from "lucide-react";
import { Accordion } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { fa } from "@/lib/utils";
import { formatTomanDisplay } from "@/modules/footage/format-toman-display";
import { HomeFooter } from "@/modules/footage/public/home-exploration/home-footer";
import { HomeHeader } from "@/modules/footage/public/home-exploration/home-header";
import { FootageCard } from "@/modules/footage/public/home-exploration/footage-card";
import type {
  DetailValueProps,
  FootageDetailPageProps,
} from "./footage-detail.types";
import { FootageVideoPreview } from "./footage-video-preview";
import { MobilePurchaseBar } from "./mobile-purchase-bar";
import { PurchaseJourney } from "./purchase-journey";

function DetailValue(props: DetailValueProps) {
  const { label, value, icon: Icon } = props;
  if (!value) return null;
  return (
    <div className="flex items-start gap-3">
      <Icon aria-hidden="true" className="mt-1 size-4 shrink-0 text-brand" />
      <div>
        <dt className="text-xs text-muted-foreground">{label}</dt>
        <dd className="font-medium">{value}</dd>
      </div>
    </div>
  );
}

function PurchaseConditions() {
  return (
    <Card>
      <CardHeader>
        <h2 className="text-xl">پیش از خرید بدانید</h2>
      </CardHeader>
      <CardContent>
        <Accordion
          defaultOpen={["access"]}
          items={[
            {
              id: "access",
              title: "دسترسی ماندگار چیست؟",
              content:
                "خرید موفق و تأییدشده به حساب شما وابسته است و با خروج از مرورگر یا تغییر دستگاه از بین نمی‌رود. این دسترسی به معنی انتقال حق‌نشر فوتیج نیست.",
            },
            {
              id: "links",
              title: "لینک دانلود چه زمانی معتبر است؟",
              content:
                "لینک محافظت‌شده دانلود در نیازمندی مصوب محصول ۶۰ دقیقه اعتبار دارد. پس از انقضا، کاربرِ دارای دسترسی می‌تواند از کتابخانه لینک تازه بگیرد.",
            },
            {
              id: "rights",
              title: "حقوق استفاده چگونه است؟",
              content:
                "این صفحه فقط استفاده از فوتیج خریداری‌شده در پروژه‌های خودتان را توضیح می‌دهد. حق‌نشر، بازفروشی، بازتوزیع و شرایط بازپرداخت به متن نهایی کسب‌وکار وابسته است.",
            },
            {
              id: "invoice",
              title: "فاکتور کجا قرار می‌گیرد؟",
              content:
                "پس از تکمیل موفق خرید، فاکتور به خرید شما وابسته می‌شود و در مسیرهای حساب کاربری قابل دسترسی خواهد بود.",
            },
          ]}
        />
      </CardContent>
    </Card>
  );
}

export function FootageDetail(props: FootageDetailPageProps) {
  const { footage, related, categories, session } = props;
  const continuation =
    "/login?continue=" + encodeURIComponent("/footage/" + footage.slug);
  const technical = footage.technical;
  const qualityText = footage.qualities.length
    ? footage.qualities.map((quality) => quality.label).join("، ")
    : undefined;
  const aspectRatio =
    technical.width && technical.height
      ? fa(Number((technical.width / technical.height).toFixed(2))) + ":۱"
      : undefined;
  const publishedLabel = footage.publishedAt
    ? new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium" }).format(
        new Date(footage.publishedAt),
      )
    : undefined;
  const journeySteps = [
    {
      number: "۰۱",
      title: "انتخاب و خرید",
      description: "فوتیج مناسب را انتخاب کنید و با قیمت مشخص‌شده ادامه دهید.",
    },
    {
      number: "۰۲",
      title: "تأیید پرداخت",
      description: "پرداخت شما در سمت سرور بررسی و تأیید می‌شود.",
    },
    {
      number: "۰۳",
      title: "دریافت کیفیت‌ها",
      description:
        "همه کیفیت‌های دانلودی موجود برای همین خرید در دسترس قرار می‌گیرد.",
    },
    {
      number: "۰۴",
      title: "بازگشت به کتابخانه",
      description:
        "هر زمان لازم بود، از کتابخانه لینک دانلود مجاز تازه بگیرید.",
    },
  ];
  return (
    <main className="min-h-screen bg-background text-foreground pb-28 md:pb-0">
      <HomeHeader
        categories={categories}
        className="border-b border-border/70 bg-background/90 backdrop-blur-sm"
      />
      <div className="container-storefront mx-auto max-w-7xl space-y-16 px-4 py-8 sm:px-6 lg:py-12">
        <nav aria-label="مسیر صفحه" className="text-sm text-muted-foreground">
          <Link className="hover:text-foreground" href="/search">
            مرور فوتیج‌ها
          </Link>
          <span aria-hidden="true" className="mx-2">
            /
          </span>
          <span>{footage.category.nameFa}</span>
        </nav>
        <section className="grid gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(20rem,0.65fr)] lg:items-start">
          <div className="space-y-5 lg:col-start-1 lg:row-start-1">
            <FootageVideoPreview footage={footage} />
            <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
              <span className="rounded-control border border-border px-3 py-1">
                {footage.category.nameFa}
              </span>
              {footage.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-control border border-border px-3 py-1"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
          <div className="contents">
            <Card className="lg:col-start-2 lg:row-start-1">
              <CardHeader>
                <p className="text-sm text-brand">
                  فوتیج{" "}
                  {footage.dataSource === "development-fixture"
                    ? "آزمایشی"
                    : "منتشرشده"}
                </p>
                <h1 className="text-3xl leading-tight">{footage.titleFa}</h1>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="border-y border-border py-5">
                  <p className="text-sm text-muted-foreground">قیمت فوتیج</p>
                  <p className="mt-1 text-2xl font-bold text-brand">
                    {formatTomanDisplay(footage.priceToman)}
                  </p>
                </div>
                <div className="space-y-3">
                  <p className="font-semibold">با یک خرید دریافت می‌کنید:</p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex gap-2">
                      <Check className="mt-1 size-4 shrink-0 text-success" />
                      همه کیفیت‌های دانلودی موجود برای این فوتیج
                    </li>
                    <li className="flex gap-2">
                      <Check className="mt-1 size-4 shrink-0 text-success" />
                      دسترسی ماندگار در کتابخانه حساب شما
                    </li>
                    <li className="flex gap-2">
                      <Check className="mt-1 size-4 shrink-0 text-success" />
                      فاکتور پس از تکمیل موفق خرید
                    </li>
                  </ul>
                </div>
                <div className="hidden md:block">
                  {session === "anonymous" ? (
                    <Link href={continuation} className="block">
                      <Button size="lg" className="w-full">
                        ورود و ادامه خرید
                      </Button>
                    </Link>
                  ) : (
                    <Button size="lg" className="w-full" disabled>
                      خرید اکنون{" "}
                      <span className="text-xs font-normal opacity-70">
                        (اتصال خرید در حال آماده‌سازی)
                      </span>
                    </Button>
                  )}
                </div>
                <p className="text-center text-xs text-muted-foreground">
                  پرداخت و تأیید نهایی فقط در سمت سرور انجام می‌شود.
                </p>
              </CardContent>
            </Card>
            <div className="lg:col-start-2 lg:row-start-2">
              <PurchaseConditions />
            </div>
          </div>
          <section
            aria-labelledby="footage-description"
            className="max-w-4xl lg:col-start-1 lg:row-start-2"
          >
            <p className="text-sm text-brand">درباره این فوتیج</p>
            <h2 id="footage-description" className="mt-2 text-2xl">
              برای انتخاب دقیق‌تر پروژه
            </h2>
            <p className="mt-4 text-lg leading-9 text-muted-foreground">
              {footage.descriptionFa || "توضیحی برای این فوتیج ثبت نشده است."}
            </p>
          </section>
        </section>
        <section className="space-y-8">
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl">مشخصات فوتیج</h2>
              <dl className="mt-5 grid gap-5 sm:grid-cols-2">
                <DetailValue
                  label="مدت"
                  value={
                    footage.durationSeconds
                      ? fa(footage.durationSeconds) + " ثانیه"
                      : undefined
                  }
                  icon={Clock3}
                />
                <DetailValue
                  label="ابعاد"
                  value={
                    technical.width && technical.height
                      ? fa(technical.width) + " × " + fa(technical.height)
                      : undefined
                  }
                  icon={Ruler}
                />
                <DetailValue
                  label="نرخ فریم"
                  value={
                    technical.fps
                      ? fa(technical.fps) + " فریم بر ثانیه"
                      : undefined
                  }
                  icon={Gauge}
                />
                <DetailValue
                  label="فرمت و کدک"
                  value={
                    technical.mimeType || technical.codec
                      ? [technical.mimeType, technical.codec]
                          .filter(Boolean)
                          .join(" · ")
                      : undefined
                  }
                  icon={FileVideo}
                />
                <DetailValue
                  label="کیفیت‌های دانلودی"
                  value={qualityText}
                  icon={Info}
                />
                <DetailValue
                  label="نسبت تصویر"
                  value={aspectRatio}
                  icon={Ruler}
                />
                <DetailValue
                  label="تاریخ انتشار"
                  value={publishedLabel}
                  icon={Clock3}
                />
              </dl>
              {!footage.durationSeconds &&
                !technical.width &&
                !technical.fps &&
                !qualityText && (
                  <p className="mt-5 text-sm text-muted-foreground">
                    بخشی از مشخصات فنی این فوتیج هنوز ثبت نشده است.
                  </p>
                )}
              {footage.qualities.length > 0 && (
                <ul
                  className="mt-5 grid gap-2 sm:grid-cols-2"
                  aria-label="جزئیات کیفیت‌های دانلودی"
                >
                  {footage.qualities.map((quality) => (
                    <li
                      key={quality.label}
                      className="rounded-control border border-border bg-card px-3 py-2 text-sm"
                    >
                      <span className="font-semibold">{quality.label}</span>
                      <span className="block text-xs text-muted-foreground">
                        {[
                          quality.width && quality.height
                            ? fa(quality.width) + " × " + fa(quality.height)
                            : undefined,
                          quality.sizeBytes
                            ? fa(Math.round(quality.sizeBytes / 1024 / 1024)) +
                              " مگابایت"
                            : undefined,
                        ]
                          .filter(Boolean)
                          .join(" · ") || "مشخصات تکمیلی ثبت نشده"}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div>
              <h2 className="text-2xl">خرید و دانلود چگونه انجام می‌شود؟</h2>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                مسیر خرید روشن است: یک خرید، همه کیفیت‌های موجود، و دسترسی
                دوباره از کتابخانه.
              </p>
              <div className="mt-5">
                <PurchaseJourney steps={journeySteps} />
              </div>
            </div>
          </div>
        </section>
        {related.length > 0 && (
          <section>
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <p className="text-sm text-brand">ادامه کشف</p>
                <h2 className="text-2xl">فوتیج‌های مرتبط</h2>
              </div>
              <Link
                href="/search"
                className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                مشاهده همه
              </Link>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((item) => (
                <FootageCard
                  key={item.id}
                  item={item}
                  developmentOnly={item.dataSource === "development-fixture"}
                />
              ))}
            </div>
          </section>
        )}
        <p className="flex items-start gap-2 border-t border-border pt-5 text-xs text-muted-foreground">
          <LockKeyhole aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          فایل‌های اصلی فقط پس از تأیید دسترسی مشتری ارائه می‌شوند؛ این صفحه هیچ
          فایل خصوصی یا کلید ذخیره‌سازی را نمایش نمی‌دهد.
        </p>
      </div>
      <HomeFooter categories={categories} />
      <MobilePurchaseBar
        priceLabel={formatTomanDisplay(footage.priceToman)}
        session={session}
        continuationHref={continuation}
      />
    </main>
  );
}
