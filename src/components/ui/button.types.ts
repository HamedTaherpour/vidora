import type { ButtonHTMLAttributes } from "react";

export type ButtonVariant =
  "default" | "secondary" | "outline" | "ghost" | "brand" | "destructive";
export type ButtonSize = "sm" | "md" | "lg" | "icon";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};
