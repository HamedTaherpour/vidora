import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { MobilePurchaseBarProps } from "./mobile-purchase-bar.types";

export function MobilePurchaseBar(props: MobilePurchaseBarProps) {
  const { priceLabel, session, continuationHref } = props;
  return (
    <div className="safe-area-bottom fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 px-4 pt-3 backdrop-blur-md md:hidden">
      <div className="mx-auto flex max-w-7xl items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs text-muted-foreground">قیمت فوتیج</p>
          <p className="truncate font-semibold text-brand">{priceLabel}</p>
        </div>
        {session === "anonymous" ? (
          <Link href={continuationHref} className="shrink-0">
            <Button size="md">ورود و ادامه خرید</Button>
          </Link>
        ) : (
          <Button size="md" disabled className="shrink-0">
            خرید اکنون
          </Button>
        )}
      </div>
    </div>
  );
}
