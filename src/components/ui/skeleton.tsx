import { cn } from "@/lib/utils";
import type { SkeletonProps } from "./skeleton.types";

/** Official VibeFarsiUI `skeleton` registry component. */
export function Skeleton({ className, shimmer, ...props }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "rounded-control bg-secondary",
        shimmer
          ? "relative overflow-hidden before:absolute before:inset-0 before:animate-shine before:bg-gradient-to-l before:from-transparent before:via-foreground/10 before:to-transparent motion-reduce:before:animate-none"
          : "animate-pulse-soft motion-reduce:animate-none",
        className,
      )}
      {...props}
    />
  );
}
