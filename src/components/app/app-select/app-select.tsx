"use client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "cn";

import type { AppSelectProps } from "./app-select.types";

/**
 * Application-owned select composition shared by independent UI surfaces.
 * Interaction, focus management, keyboard behavior, and popup rendering remain
 * owned by the installed Base UI/shadcn Select primitive.
 */
export function AppSelect(props: AppSelectProps) {
  const {
    options,
    value,
    defaultValue,
    onValueChange,
    name,
    id,
    placeholder,
    disabled,
    required,
    size,
    triggerVariant = "default",
    className,
    "data-control": dataControl,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    "aria-describedby": ariaDescribedBy,
    "aria-invalid": ariaInvalid,
  } = props;

  return (
    <Select
      name={name}
      value={value}
      defaultValue={defaultValue}
      onValueChange={(nextValue) => onValueChange?.(nextValue)}
      items={options}
      disabled={disabled}
      required={required}
    >
      <SelectTrigger
        id={id}
        size={size}
        className={cn(
          triggerVariant === "ghost" && "border-0 bg-transparent shadow-none",
          className,
        )}
        data-control={dataControl}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-describedby={ariaDescribedBy}
        aria-invalid={ariaInvalid}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
