import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Clock3, Tag } from "lucide-react";
import Link from "next/link";

import { formatDuration } from "@/modules/footage/format-duration";
import { formatTomanDisplay } from "@/modules/footage/format-toman-display";

import type { FootageCardProps } from "./footage-card.types";
import { FootagePreview } from "./footage-preview";

export function FootageCard(props: FootageCardProps) {
  const { footage } = props;
  const formattedPrice = formatTomanDisplay(footage.priceToman);
  const [formattedAmount, currencyLabel] = formattedPrice.split(" ");
  const formattedDuration = formatDuration(footage.durationSeconds);

  return (
    <article className="h-full">
      <Card className="h-full p-0">
        <FootagePreview footage={footage} />

        <CardContent className="flex flex-1 flex-col gap-4 px-5 pb-2.5">
          <div className="flex flex-col gap-2">
            <Badge variant="secondary" className="self-start px-2">
              {footage.category.nameFa}
            </Badge>
            <h2 className="text-base font-semibold">
              <Link
                className="rounded-sm underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                href={`/footage/${footage.slug}`}
              >
                {footage.titleFa}
              </Link>
            </h2>
          </div>

          <div className="mt-auto flex items-center justify-between gap-3 text-sm">
            <div className="flex min-w-0 items-center gap-1.5 font-medium">
              <Tag className="size-4 shrink-0" aria-hidden="true" />
              <span className="truncate">
                <span dir="ltr">{formattedAmount}</span> {currencyLabel}
              </span>
            </div>
            <div className="flex shrink-0 items-center gap-1.5 text-muted-foreground">
              <Clock3 className="size-4" aria-hidden="true" />
              <span dir="ltr">{formattedDuration}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </article>
  );
}
