"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AccordionProps } from "./accordion.types";
import { toggleAccordionOpenIds } from "./accordion.utils";

/** Official VibeFarsiUI `accordion` registry component. */
export function Accordion({
  items,
  multiple,
  defaultOpen = [],
  className,
}: AccordionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const toggle = (id: string) =>
    setOpen((current) => toggleAccordionOpenIds(current, id, multiple));

  return (
    <div
      className={cn(
        "divide-y divide-border overflow-hidden rounded-surface border-line border-border bg-card",
        className,
      )}
    >
      {items.map((item) => {
        const isOpen = open.includes(item.id);
        return (
          <div key={item.id}>
            <h3>
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={`accordion-${item.id}`}
                onClick={() => toggle(item.id)}
                className="flex min-h-16 w-full items-center justify-between gap-3 px-5 py-4 text-start text-sm font-semibold transition-colors hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
              >
                {item.title}
                <ChevronDown
                  aria-hidden="true"
                  className={cn(
                    "size-5 shrink-0 text-brand transition-transform duration-(--motion) motion-reduce:transition-none",
                    isOpen && "rotate-180",
                  )}
                />
              </button>
            </h3>
            <div
              id={`accordion-${item.id}`}
              className={cn(
                "grid transition-[grid-template-rows] duration-(--motion) ease-motion motion-reduce:transition-none",
                isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
              )}
            >
              <div className="overflow-hidden">
                <div className="px-5 pb-5 text-sm leading-8 text-muted-foreground">
                  {item.content}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
