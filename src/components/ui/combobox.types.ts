export type ComboboxProps = {
  options: string[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  emptyText?: string;
  className?: string;
  id?: string;
  name?: string;
  disabled?: boolean;
  strict?: boolean;
  "aria-label"?: string;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
};
