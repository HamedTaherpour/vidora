import type { ReactNode } from "react";

/** An option rendered by the application-owned select control. */
export type AppSelectOption = {
  /** Stable form and selection value. */
  value: string;
  /** Persian or mixed-direction label shown in the trigger and list. */
  label: ReactNode;
  /** Whether this option cannot be selected. */
  disabled?: boolean;
};

/**
 * Shared application select contract. The value is controlled when `value` is
 * provided and otherwise follows the primitive's uncontrolled behavior.
 */
export type AppSelectProps = {
  /** Options available to the user, in display order. */
  options: readonly AppSelectOption[];
  /** Controlled selected value; `null` represents no selection. */
  value?: string | null;
  /** Initial selected value for uncontrolled usage. */
  defaultValue?: string | null;
  /** Called after the user selects an option or clears the selection. */
  onValueChange?: (value: string | null) => void;
  /** Form field name for the primitive's hidden input. */
  name?: string;
  /** Accessible id for the trigger. */
  id?: string;
  /** Visible trigger label when no option is selected. */
  placeholder?: ReactNode;
  /** Accessible name for cases without a visible FieldLabel. */
  "aria-label"?: string;
  /** Label reference for cases using an external visible label. */
  "aria-labelledby"?: string;
  /** Description reference for form validation help. */
  "aria-describedby"?: string;
  /** Invalid state forwarded to the trigger. */
  "aria-invalid"?: boolean | "false" | "true";
  /** Prevents opening or changing the selection. */
  disabled?: boolean;
  /** Requires a selection when submitted in a form. */
  required?: boolean;
  /** Trigger size from the underlying application primitive. */
  size?: "sm" | "default";
  /** Semantic trigger treatment for controls embedded in borderless surfaces. */
  triggerVariant?: "default" | "ghost";
  /** Additional trigger classes, such as a responsive width. */
  className?: string;
  /** Stable application instrumentation identifier for the trigger. */
  "data-control"?: string;
};
