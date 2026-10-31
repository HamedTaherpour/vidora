import type { TextHighlightProps } from "@/modules/footage/public/components/text-highlight.types";

export function TextHighlight(props: TextHighlightProps) {
  const { children } = props;

  return (
    <span
      dir="auto"
      className="relative inline-block whitespace-nowrap border-x border-chart-2/50 bg-chart-2/10 px-1.5 py-[0.06em] text-chart-3 before:pointer-events-none before:absolute before:-top-1 before:-right-1 before:size-2 before:rounded-full before:bg-chart-2 after:pointer-events-none after:absolute after:-bottom-1 after:-left-1 after:size-2 after:rounded-full after:bg-chart-2"
    >
      {children}
    </span>
  );
}
