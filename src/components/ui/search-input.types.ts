import type { InputHTMLAttributes } from "react";

export type SearchInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "value" | "defaultValue" | "onChange" | "size" | "type"
> & {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onSearch?: (value: string) => void;
  debounce?: number;
  loading?: boolean;
  size?: "sm" | "md";
  shortcut?: string;
};
