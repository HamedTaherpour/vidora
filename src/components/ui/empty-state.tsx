import { Inbox } from "lucide-react";

import { cn } from "@/lib/utils";
import type { EmptyStateProps } from "./empty-state.types";

/** Official VibeFarsiUI `empty-state` registry component. */
export function EmptyState(props: EmptyStateProps) {
  const { icon: Icon = Inbox, title, description, action, className } = props;

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-2 rounded-control border border-dashed border-border p-5 text-center",
        className,
      )}
    >
      <span className="flex size-10 items-center justify-center rounded-full bg-secondary">
        <Icon aria-hidden="true" className="size-5 text-muted-foreground" />
      </span>
      <p className="mt-1 text-sm font-medium">{title}</p>
      {description ? (
        <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
