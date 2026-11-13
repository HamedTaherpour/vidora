import { cn } from "@/lib/utils";
import type { MarqueeProps } from "./marquee.types";

/** Official VibeFarsiUI `marquee` asset, with a decorative duplicate hidden from assistive technology. */
export function Marquee(props: MarqueeProps) {
  const { children, duration = 30, gap = "1.5rem", className } = props;

  return (
    <div
      className={cn(
        "group w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]",
        className,
      )}
      dir="ltr"
    >
      <div
        className="flex w-max group-hover:[animation-play-state:paused] group-focus-within:[animation-play-state:paused] motion-reduce:!animate-none"
        style={{ gap, animation: `marquee ${duration}s linear infinite` }}
      >
        <div className="flex shrink-0 items-center" style={{ gap }} dir="rtl">
          {children}
        </div>
        <div
          className="flex shrink-0 items-center"
          style={{ gap }}
          dir="rtl"
          aria-hidden="true"
        >
          {children}
        </div>
      </div>
    </div>
  );
}
