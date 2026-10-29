import { formatTomanDisplay } from "@/modules/footage/format-toman-display";
import type { FootageCardProps } from "@/modules/footage/public/components/footage-card/footage-card.types";

export function FootageCard(props: FootageCardProps) {
  const { footage } = props;
  const previewLabel =
    footage.preview.status === "ready"
      ? "پیش‌نمایش آماده است"
      : "پیش‌نمایش در دسترس نیست";
  const formattedPrice = formatTomanDisplay(footage.priceToman);
  const [formattedAmount, currencyLabel] = formattedPrice.split(" ");

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm">
      <div
        className="relative aspect-video overflow-hidden bg-muted"
        role="group"
        aria-label={`${footage.titleFa} — ${footage.category.nameFa} — ${previewLabel}`}
      >
        <img
          src={footage.cover.src}
          alt={footage.cover.altFa}
          className="h-full w-full object-cover"
        />
      </div>

      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="flex flex-col gap-2">
          <p className="text-ui-small text-muted-foreground">
            {footage.category.nameFa}
          </p>
          <h2 className="text-ui-h3 font-semibold">
            <a
              className="rounded-sm underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              href={`/footage/${footage.slug}`}
            >
              {footage.titleFa}
            </a>
          </h2>
        </div>

        <p className="mt-auto font-medium">
          <span dir="ltr">{formattedAmount}</span> <span>{currencyLabel}</span>
        </p>
      </div>
    </article>
  );
}
