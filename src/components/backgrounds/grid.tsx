import { cn } from "@/lib/utils";
import type { GridBackgroundProps } from "./grid.types";

/** Official VibeFarsiUI `grid` background, kept static for a calm benefits section. */
export function GridBackground(props: GridBackgroundProps) {
  const { size = 56, className } = props;

  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_bottom,black_55%,transparent)]",
        className,
      )}
      style={{
        backgroundImage:
          "linear-gradient(to right, oklch(from var(--foreground) l c h / 8%) 1px, transparent 1px), linear-gradient(to bottom, oklch(from var(--foreground) l c h / 8%) 1px, transparent 1px)",
        backgroundSize: `${size}px ${size}px`,
      }}
    />
  );
}
