import { Camera, FileCheck2, ShieldCheck } from "lucide-react";
import { Reveal } from "@/components/animations/reveal";
import { SpotlightCard } from "@/components/animations/spotlight-card";
import { GridBackground } from "@/components/backgrounds/grid";

export function HomeBenefits() {
  return (
    <Reveal>
      <section
        className="relative isolate mx-auto grid max-w-7xl gap-10 overflow-hidden px-4 py-16 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8 lg:py-24"
        aria-labelledby="why-title"
      >
        <GridBackground className="-z-10 opacity-45" />
        <div>
          <p className="mb-2 text-sm font-semibold text-brand">
            انتخاب مطمئن‌تر
          </p>
          <h2
            id="why-title"
            className="max-w-md text-3xl font-bold leading-tight"
          >
            برای انتخاب بهتر، اول ببینید.
          </h2>
          <p className="mt-5 max-w-md text-foreground/80">
            ویدورا تجربهٔ کشف و خرید فوتیج را کوتاه، شفاف و قابل اتکا نگه
            می‌دارد.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <SpotlightCard>
            <div className="p-5">
              <Camera className="mb-8 size-6 text-brand" aria-hidden="true" />
              <h3 className="font-semibold">قبل از خرید ببینید</h3>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                پیش‌نمایش فوتیج کمک می‌کند انتخابتان را با اطمینان بیشتری انجام
                دهید.
              </p>
            </div>
          </SpotlightCard>
          <SpotlightCard>
            <div className="p-5">
              <ShieldCheck
                className="mb-8 size-6 text-brand"
                aria-hidden="true"
              />
              <h3 className="font-semibold">کیفیت‌های آماده</h3>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                کیفیت‌های در دسترس هر فوتیج را پیش از خرید می‌بینید.
              </p>
            </div>
          </SpotlightCard>
          <SpotlightCard>
            <div className="p-5">
              <FileCheck2
                className="mb-8 size-6 text-brand"
                aria-hidden="true"
              />
              <h3 className="font-semibold">فاکتور رسمی</h3>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                سوابق خرید و فاکتور رسمی در کتابخانهٔ شما باقی می‌ماند.
              </p>
            </div>
          </SpotlightCard>
        </div>
      </section>
    </Reveal>
  );
}
