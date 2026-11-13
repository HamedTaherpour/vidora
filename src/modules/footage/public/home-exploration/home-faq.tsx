import { Accordion } from "@/components/ui/accordion";
import { Reveal } from "@/components/animations/reveal";
import type { HomeFaqProps } from "./home-faq.types";

export function HomeFaq(props: HomeFaqProps) {
  const { items } = props;
  return (
    <Reveal>
      <section
        className="border-t border-border/70 bg-card/40"
        aria-labelledby="faq-title"
      >
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[0.7fr_1.3fr] lg:px-8 lg:py-24">
          <div>
            <p className="mb-2 text-sm font-semibold text-brand">
              سؤال‌های پرتکرار
            </p>
            <h2 id="faq-title" className="text-3xl font-bold">
              قبل از شروع، بدانید.
            </h2>
            <p className="mt-4 text-foreground/80">
              پاسخ‌های کوتاه برای تصمیمی که قرار است با خیال راحت بگیرید.
            </p>
          </div>
          <Accordion items={items} defaultOpen={[items[0]?.id ?? ""]} />
        </div>
      </section>
    </Reveal>
  );
}
