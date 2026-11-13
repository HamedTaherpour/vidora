import type { ReactNode } from "react";

export type MarqueeProps = {
  children: ReactNode;
  duration?: number;
  gap?: string;
  className?: string;
};
