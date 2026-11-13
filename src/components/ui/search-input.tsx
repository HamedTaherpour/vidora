"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SearchInputProps } from "./search-input.types";

/** Official VibeFarsiUI `search-input` registry component. */
export function SearchInput({
  value,
  defaultValue = "",
  onChange,
  onSearch,
  debounce = 300,
  loading,
  size = "md",
  shortcut,
  placeholder = "جست‌وجو…",
  className,
  disabled,
  onKeyDown,
  ...props
}: SearchInputProps) {
  const [internal, setInternal] = useState(defaultValue);
  const currentValue = value ?? internal;
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const set = useCallback(
    (next: string, immediate = false) => {
      if (value === undefined) setInternal(next);
      onChange?.(next);
      if (!onSearch) return;
      if (timerRef.current) clearTimeout(timerRef.current);
      if (immediate || !next) onSearch(next);
      else timerRef.current = setTimeout(() => onSearch(next), debounce);
    },
    [debounce, onChange, onSearch, value],
  );

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  return (
    <div
      className={cn(
        "flex min-h-12 w-full items-center gap-3 rounded-field border-line-field border-input bg-field px-4 text-base transition-colors focus-within:border-transparent focus-within:ring-2 focus-within:ring-ring/60",
        size === "sm" && "min-h-11 px-3 text-sm",
        disabled && "cursor-not-allowed opacity-50",
        className,
      )}
    >
      {loading ? (
        <Loader2
          className="size-5 shrink-0 animate-spin text-muted-foreground motion-reduce:animate-none"
          aria-hidden="true"
        />
      ) : (
        <Search
          className="size-5 shrink-0 text-muted-foreground"
          aria-hidden="true"
        />
      )}
      <input
        ref={inputRef}
        type="search"
        inputMode="search"
        enterKeyHint="search"
        autoComplete="off"
        value={currentValue}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(event) => set(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") set(currentValue, true);
          if (event.key === "Escape" && currentValue) {
            event.preventDefault();
            set("", true);
          }
          onKeyDown?.(event);
        }}
        className="h-full min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted-foreground/70 [&::-webkit-search-cancel-button]:hidden"
        {...props}
      />
      {currentValue ? (
        <button
          type="button"
          aria-label="پاک کردن"
          tabIndex={-1}
          disabled={disabled}
          onClick={() => {
            set("", true);
            inputRef.current?.focus();
          }}
          className="flex size-11 shrink-0 items-center justify-center rounded-control text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      ) : shortcut ? (
        <kbd
          dir="ltr"
          className="hidden shrink-0 rounded-control border-line border-border bg-muted px-2 text-xs leading-6 text-muted-foreground sm:inline-block"
        >
          {shortcut}
        </kbd>
      ) : null}
    </div>
  );
}
