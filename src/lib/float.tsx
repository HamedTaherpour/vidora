"use client";

import * as React from "react";
import { createPortal } from "react-dom";

export type FloatSide = "top" | "bottom";

export function floatStyle(
  element: HTMLElement,
  {
    side = "bottom",
    gap = 8,
    panel,
    matchWidth,
  }: {
    side?: FloatSide;
    gap?: number;
    panel?: HTMLElement | null;
    matchWidth?: boolean;
  } = {},
): React.CSSProperties {
  const rect = element.getBoundingClientRect();
  const panelHeight = panel?.offsetHeight ?? 0;
  const shouldFlip =
    side === "bottom" &&
    panelHeight > 0 &&
    rect.bottom + gap + panelHeight > window.innerHeight &&
    rect.top - gap - panelHeight >= gap;
  const style: React.CSSProperties = shouldFlip
    ? { bottom: window.innerHeight - rect.top + gap }
    : { top: rect.bottom + gap };
  if (matchWidth) {
    style.left = rect.left;
    style.width = rect.width;
  }
  return style;
}

export function useFloat(
  open: boolean,
  anchor: React.RefObject<HTMLElement | null>,
  options: { gap?: number; matchWidth?: boolean } = {},
) {
  const [style, setStyle] = React.useState<React.CSSProperties>({});
  const panel = React.useRef<HTMLDivElement>(null);
  const { gap = 8, matchWidth = false } = options;

  const update = React.useCallback(() => {
    if (anchor.current) {
      setStyle(
        floatStyle(anchor.current, { gap, matchWidth, panel: panel.current }),
      );
    }
  }, [anchor, gap, matchWidth]);

  React.useLayoutEffect(() => {
    if (!open) return;
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [open, update]);

  return { mounted: typeof document !== "undefined", style, panel, update };
}

export function FloatPortal({
  open,
  mounted,
  style,
  panelRef,
  className,
  children,
}: {
  open: boolean;
  mounted: boolean;
  style: React.CSSProperties;
  panelRef?: React.Ref<HTMLDivElement>;
  className?: string;
  children: React.ReactNode;
}) {
  if (!mounted || !open) return null;
  return createPortal(
    <div ref={panelRef} style={style} className={className}>
      {children}
    </div>,
    document.body,
  );
}
