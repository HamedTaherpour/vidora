import type { ReactNode } from "react";

export type HeroBlockProps = {
  badge?: string;
  title: ReactNode;
  description: string;
  children?: ReactNode;
};
