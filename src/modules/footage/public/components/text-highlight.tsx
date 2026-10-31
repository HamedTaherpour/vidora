import type { TextHighlightProps } from "@/modules/footage/public/components/text-highlight.types";

export function TextHighlight(props: TextHighlightProps) {
  const { children } = props;

  return (
    <span
      dir="auto"
      className="relative inline-block whitespace-nowrap border-x border-accent-foreground/50 bg-accent-foreground/10 px-1.5 py-[0.06em] text-accent before:pointer-events-none before:absolute before:-top-1 before:-right-1 before:size-2 before:rounded-full before:bg-accent-foreground after:pointer-events-none after:absolute after:-bottom-1 after:-left-1 after:size-2 after:rounded-full after:bg-accent-foreground"
    >
      {children}
    </span>
  );
}
