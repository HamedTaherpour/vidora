import { HeroBlock } from "@/components/blocks/hero";
import { BlurText } from "@/components/animations/blur-text";
import { HomeSearchForm } from "./home-search-form";

export function HomeHero() {
  return (
    <HeroBlock
      badge="بازار فوتیج حرفه‌ای"
      title={
        <>
          <BlurText text="قاب بعدی‌تان را" />
          <br />
          <BlurText text="از همین‌جا پیدا کنید." delay={75} />
        </>
      }
      description="از میان فوتیج‌های آمادهٔ ویدورا جست‌وجو کنید، قبل از خرید پیش‌نمایش ببینید و برای پروژه‌تان انتخاب دقیق‌تری داشته باشید."
    >
      <HomeSearchForm />
      <div className="mt-6 flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
        <span>پیش‌نمایش قبل از خرید</span>
        <span>کیفیت‌های آماده</span>
        <span>فاکتور رسمی</span>
      </div>
    </HeroBlock>
  );
}
