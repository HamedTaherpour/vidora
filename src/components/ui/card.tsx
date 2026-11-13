import { cn } from "@/lib/utils";
import type { CardProps } from "./card.types";

/** Official VibeFarsiUI `card` registry component. */
export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "relative isolate rounded-surface border-line border-border bg-card text-card-foreground shadow-surface",
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: CardProps) {
  return (
    <div className={cn("flex flex-col gap-2 p-5", className)} {...props} />
  );
}

export function CardContent({ className, ...props }: CardProps) {
  return <div className={cn("p-5 pt-0", className)} {...props} />;
}
