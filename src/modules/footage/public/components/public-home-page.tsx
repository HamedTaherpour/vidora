import { Button } from "@/components/ui/button";
import { PublicFootageListView } from "@/modules/footage/public/components/footage-list/public-footage-list-view";
import { HomepageSearchControls } from "@/modules/footage/public/components/homepage-search-controls";
import { HeroAtmosphere } from "@/modules/footage/public/components/hero-atmosphere";
import type { PublicHomePageProps } from "@/modules/footage/public/components/public-home-page.types";
import { PublicSiteFooter } from "@/modules/footage/public/components/public-site-footer";
import { PublicSiteHeader } from "@/modules/footage/public/components/public-site-header";
import { TextHighlight } from "@/modules/footage/public/components/text-highlight";

export function PublicHomePage(props: PublicHomePageProps) {
  const {
    footage,
    scenario,
    query,
    category,
    categories,
    scenarioParam,
    messageFa,
    requestedPage = 1,
  } = props;

  return (
    <div className="min-h-screen bg-background">
      <div data-slot="homepage-hero-frame" className="relative">
        <HeroAtmosphere />
        <PublicSiteHeader categories={categories} />

        <main className="relative">
          <section className="container-storefront flex flex-col items-center gap-8 py-16 text-center md:py-24">
            <div
              data-slot="hero-copy"
              className="flex max-w-3xl flex-col items-center gap-5"
            >
              <h1 className="text-3xl leading-10 font-extrabold tracking-tight text-background md:text-5xl md:leading-tight">
                برای هر ایده، <TextHighlight>فوتیج</TextHighlight>‌ مناسب رو
                انتخاب کن و داستانت رو بساز
              </h1>
              <p className="max-w-2xl text-base leading-8 text-background/80">
                مجموعه‌ای از ویدئوهای استوک باکیفیت برای ساختن داستانی که توی
                ذهنته.
              </p>
              <div className="flex w-full justify-center gap-3 pt-2 flex-row">
                <Button
                  render={<a href="#footage-listing" />}
                  nativeButton={false}
                  size="lg"
                  variant="accent"
                  className="px-6 w-auto"
                >
                  مشاهده فوتیج‌ها
                </Button>
                <Button
                  render={<a href="#homepage-categories" />}
                  nativeButton={false}
                  variant="outline"
                  size="lg"
                  className="px-6 w-auto"
                >
                  کاوش دسته‌بندی‌ها
                </Button>
              </div>
            </div>
            <HomepageSearchControls
              key={`${query}\u0000${scenarioParam ?? ""}`}
              query={query}
              category={category}
              categories={categories}
              scenario={scenarioParam}
            />
          </section>
        </main>
      </div>

      <section
        aria-labelledby="catalog-heading"
        id="footage-listing"
        className="scroll-mt-20 border-t border-border/70"
      >
        <div className="container-storefront flex items-center justify-between gap-4 pt-10 md:pt-14">
          <div>
            <p className="text-xs leading-5 font-medium text-primary">
              کتابخانه عمومی
            </p>
            <h2
              id="catalog-heading"
              className="mt-1 text-2xl leading-9 font-bold"
            >
              فوتیج‌های منتخب
            </h2>
          </div>
          {scenario === "populated" && (
            <span className="text-xs leading-5 text-muted-foreground">
              {footage.length} نتیجه
            </span>
          )}
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

      <PublicSiteFooter />
    </div>
  );
}
