"use client";

import * as React from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { FloatPortal, useFloat } from "@/lib/float";
import type { ComboboxProps } from "./combobox.types";

function fold(value: string) {
  return value
    .replace(/[يى]/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/[آأإ]/g, "ا")
    .replace(/[\s‌]+/g, "");
}

function getOptionLabel(option: string, query: string) {
  if (!query) return option;
  const start = option
    .toLocaleLowerCase("fa-IR")
    .indexOf(query.toLocaleLowerCase("fa-IR"));
  if (start < 0) return option;
  return (
    <>
      {option.slice(0, start)}
      <span className="font-semibold">
        {option.slice(start, start + query.length)}
      </span>
      {option.slice(start + query.length)}
    </>
  );
}

/** Official VibeFarsiUI searchable combobox adapted to Vidora's component contracts. */
export function Combobox(props: ComboboxProps) {
  const {
    options,
    value = "",
    onChange,
    placeholder = "جست‌وجو…",
    emptyText = "دسته‌بندی‌ای پیدا نشد",
    className,
    id,
    name,
    disabled,
    strict = false,
    ...aria
  } = props;
  const [queryDraft, setQueryDraft] = React.useState(value);
  const [open, setOpen] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(0);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const listRef = React.useRef<HTMLUListElement>(null);
  const listId = React.useId();
  const { mounted, style, panel, update } = useFloat(open, rootRef, {
    gap: 4,
    matchWidth: true,
  });

  const query = queryDraft;

  const filteredOptions = React.useMemo(() => {
    const foldedQuery = fold(query.trim());
    if (!foldedQuery || query === value) return options;
    const starts = options.filter((option) =>
      fold(option).startsWith(foldedQuery),
    );
    const contains = options.filter(
      (option) =>
        !fold(option).startsWith(foldedQuery) &&
        fold(option).includes(foldedQuery),
    );
    return [...starts, ...contains];
  }, [options, query, value]);

  React.useEffect(() => {
    if (!open) return;
    listRef.current
      ?.querySelector(`[data-index="${activeIndex}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, open]);

  function pick(nextValue: string) {
    setQueryDraft(nextValue);
    onChange?.(nextValue);
    setOpen(false);
  }

  function commit() {
    setOpen(false);
    if (!strict || query === value) return;
    const foldedQuery = fold(query.trim());
    const exact = options.find((option) => fold(option) === foldedQuery);
    if (exact) pick(exact);
    else if (!foldedQuery && value) pick("");
    else setQueryDraft(value);
  }

  const list = (
    <ul
      id={listId}
      ref={listRef}
      role="listbox"
      className="max-h-56 overflow-auto rounded-overlay border-line border-border bg-popover p-1 text-sm leading-7 shadow-overlay"
    >
      {!filteredOptions.length && (
        <li className="px-3 py-2 text-muted-foreground">{emptyText}</li>
      )}
      {filteredOptions.map((option, index) => (
        <li
          key={option}
          data-index={index}
          id={`${listId}-option-${index}`}
          role="option"
          aria-selected={option === value}
          onMouseDown={(event) => {
            event.preventDefault();
            pick(option);
          }}
          onMouseEnter={() => setActiveIndex(index)}
          className={cn(
            "flex min-h-11 cursor-pointer items-center justify-between gap-2 rounded-control px-3 py-2",
            index === activeIndex && "bg-accent",
          )}
        >
          <span className="min-w-0 truncate">
            {getOptionLabel(option, query === value ? "" : query.trim())}
          </span>
          {option === value && (
            <Check aria-hidden="true" className="size-4 shrink-0" />
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <div
        className={cn(
          "flex min-h-12 w-full items-center gap-1 rounded-field border-line-field border-input bg-field pe-2 ps-3 transition-colors focus-within:border-transparent focus-within:ring-2 focus-within:ring-ring/60",
          disabled && "cursor-not-allowed opacity-50",
        )}
      >
        <input
          id={id}
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-activedescendant={
            open && filteredOptions[activeIndex]
              ? `${listId}-option-${activeIndex}`
              : undefined
          }
          aria-autocomplete="list"
          {...aria}
          disabled={disabled}
          autoComplete="off"
          value={query}
          placeholder={placeholder}
          onChange={(event) => {
            setQueryDraft(event.target.value);
            setActiveIndex(0);
            setOpen(true);
          }}
          onFocus={() => {
            setOpen(true);
            update();
          }}
          onBlur={() => window.setTimeout(commit, 120)}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown") {
              event.preventDefault();
              setOpen(true);
              setActiveIndex((index) =>
                Math.min(filteredOptions.length - 1, index + 1),
              );
            } else if (event.key === "ArrowUp") {
              event.preventDefault();
              setActiveIndex((index) => Math.max(0, index - 1));
            } else if (
              event.key === "Enter" &&
              open &&
              filteredOptions[activeIndex]
            ) {
              event.preventDefault();
              pick(filteredOptions[activeIndex]);
            } else if (event.key === "Escape") {
              setOpen(false);
              setQueryDraft(value);
            }
          }}
          className="min-w-0 flex-1 bg-transparent text-base leading-8 outline-none placeholder:text-muted-foreground/70 disabled:cursor-not-allowed"
        />
        {value && (
          <button
            type="button"
            aria-label="پاک کردن دسته‌بندی"
            className="inline-flex size-11 shrink-0 items-center justify-center rounded-control text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => pick("")}
          >
            <X aria-hidden="true" className="size-4" />
          </button>
        )}
        <ChevronDown
          aria-hidden="true"
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180",
          )}
        />
      </div>
      {name && <input type="hidden" name={name} value={value} />}
      <FloatPortal
        open={open}
        mounted={mounted}
        style={style}
        panelRef={panel}
        className="fixed z-50"
      >
        {list}
      </FloatPortal>
    </div>
  );
}
