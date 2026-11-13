import Link from "next/link";
import { HomeSeoToc } from "./home-seo-toc";

const seoTocItems = [
  { id: "footage-definition-title", label: "تعریف فوتیج" },
  { id: "footage-vs-video-title", label: "تفاوت فوتیج و ویدیو" },
  { id: "footage-use-title", label: "کاربردهای فوتیج" },
  { id: "footage-selection-title", label: "انتخاب فوتیج" },
  { id: "footage-technical-title", label: "نکات فنی" },
] as const;

export function HomeSeoContent() {
  return (
    <section
      className="border-y border-border/70 bg-card/35"
      aria-labelledby="footage-guide-title"
    >
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[minmax(0,1fr)_12rem] lg:gap-16 lg:px-8 lg:py-24">
        <article className="max-w-3xl">
          <header className="border-s border-brand/70 ps-5">
            <p className="mb-2 text-sm font-semibold text-brand">
              راهنمای انتخاب
            </p>
            <h2
              id="footage-guide-title"
              className="text-3xl font-bold leading-tight sm:text-4xl"
            >
              فوتیج چیست و چه کاربردی دارد؟
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-8 text-foreground/75">
              راهنمایی کوتاه برای شناخت فوتیج، مقایسهٔ آن با ویدیوی نهایی و
              انتخاب نمای مناسب برای پروژه.
            </p>
          </header>
          <div className="mt-10 space-y-8 text-base leading-8 text-foreground/80">
            <section aria-labelledby="footage-definition-title">
              <h3
                id="footage-definition-title"
                className="scroll-mt-28 text-xl font-semibold text-foreground"
              >
                فوتیج چیست؟
              </h3>
              <p className="mt-3">
                فوتیج، نمای ویدیویی آماده‌ای است که می‌تواند بخشی از یک روایت
                بزرگ‌تر باشد؛ از نمایی از شهر و طبیعت تا حرکت دوربین در یک فضای
                داخلی. استفاده از چنین نماهایی به تدوینگر کمک می‌کند ریتم و فضای
                بصری پروژه را کامل کند، بدون اینکه برای هر تصویر دوباره
                فیلم‌برداری انجام شود.
              </p>
            </section>
            <section
              aria-labelledby="footage-vs-video-title"
              className="border-t border-border/70 pt-8"
            >
              <h3
                id="footage-vs-video-title"
                className="scroll-mt-28 text-xl font-semibold text-foreground"
              >
                تفاوت فوتیج با ویدیوی نهایی
              </h3>
              <p className="mt-3">
                فوتیج معمولاً یک یا چند نمای مستقل است و هنوز در کنار موسیقی،
                گفتار، اصلاح رنگ و تدوین نهایی قرار نگرفته است. به همین دلیل
                می‌تواند در تبلیغات، فیلم‌سازی، مستند، ویدیوهای شبکه‌های اجتماعی
                و محتوای معرفی برند، نقش متفاوتی پیدا کند.
              </p>
            </section>
            <section
              aria-labelledby="footage-use-title"
              className="border-t border-border/70 pt-8"
            >
              <h3
                id="footage-use-title"
                className="scroll-mt-28 text-xl font-semibold text-foreground"
              >
                کاربردها و انواع رایج فوتیج
              </h3>
              <p className="mt-3">
                نماهای شهری، طبیعت، معماری، زندگی روزمره، غذا و حرکت‌های انتزاعی
                از نمونه‌های پرکاربرد هستند. انتخاب درست به پروژه بستگی دارد: یک
                نمای آرام برای ویدیوی معرفی، یک نمای پویا برای تیزر و تصویری با
                فضای خالی برای قرار دادن تیتر یا زیرنویس، هرکدام کاربرد
                جداگانه‌ای دارند.
              </p>
            </section>
            <section
              aria-labelledby="footage-selection-title"
              className="border-t border-border/70 pt-8"
            >
              <h3
                id="footage-selection-title"
                className="scroll-mt-28 text-xl font-semibold text-foreground"
              >
                چطور فوتیج مناسب را انتخاب کنیم؟
              </h3>
              <p className="mt-3">
                ابتدا موضوع، حال‌وهوا و نسبت تصویر پروژه را مشخص کنید. سپس به
                ترکیب‌بندی، جهت حرکت، وضوح و کیفیت فایل توجه کنید. مدت نما و
                فضای خالی آن برای قرار دادن لوگو، تیتر یا زیرنویس مهم است. در
                ویدورا می‌توانید از{" "}
                <Link
                  className="font-semibold text-brand underline underline-offset-4"
                  href="/search"
                >
                  جست‌وجوی فوتیج‌ها
                </Link>{" "}
                شروع کنید و با دیدن پیش‌نمایش، حرکت دوربین، نور و تناسب نما با
                تدوین خود را بهتر ارزیابی کنید.
              </p>
            </section>
            <section
              aria-labelledby="footage-technical-title"
              className="border-t border-border/70 pt-8"
            >
              <h3
                id="footage-technical-title"
                className="scroll-mt-28 text-xl font-semibold text-foreground"
              >
                نکات فنی پیش از استفاده
              </h3>
              <p className="mt-3">
                وضوح تصویر، نسبت تصویر، نرخ فریم و مدت نما را با نیاز تدوین خود
                مقایسه کنید. پیش‌نمایش را فقط برای سنجش قاب و حرکت نبینید؛ نور،
                فضای امن متن و هماهنگی آن با سایر نماهای پروژه را هم بررسی کنید.
                برای آشنایی با مطالب مرتبط،{" "}
                <Link
                  className="font-semibold text-brand underline underline-offset-4"
                  href="/blog"
                >
                  مجلهٔ ویدورا
                </Link>{" "}
                را هم ببینید.
              </p>
            </section>
          </div>
        </article>
        <HomeSeoToc items={[...seoTocItems]} />
      </div>
    </section>
  );
}
