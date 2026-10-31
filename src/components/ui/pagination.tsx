import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import type { ComponentProps } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Pagination(props: ComponentProps<"nav">) {
  return <nav aria-label="صفحه‌بندی" {...props} />;
}
export function PaginationContent(props: ComponentProps<"ul">) {
  return <ul className="flex items-center gap-1" {...props} />;
}
export function PaginationItem(props: ComponentProps<"li">) {
  return <li {...props} />;
}
export function PaginationLink(
  props: ComponentProps<typeof Button> & { isActive?: boolean },
) {
  const { className, isActive, ...rest } = props;
  return (
    <Button
      aria-current={isActive ? "page" : undefined}
      variant={isActive ? "outline" : "ghost"}
      size="icon"
      className={cn(className)}
      {...rest}
    />
  );
}
export function PaginationPrevious(
  props: ComponentProps<typeof PaginationLink>,
) {
  return (
    <PaginationLink aria-label="صفحه قبلی" {...props}>
      <ChevronRight aria-hidden="true" />
      <span className="sr-only">قبلی</span>
    </PaginationLink>
  );
}
export function PaginationNext(props: ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink aria-label="صفحه بعدی" {...props}>
      <ChevronLeft aria-hidden="true" />
      <span className="sr-only">بعدی</span>
    </PaginationLink>
  );
}
export function PaginationEllipsis() {
  return (
    <span
      aria-hidden="true"
      className="flex size-8 items-center justify-center"
    >
      <MoreHorizontal />
    </span>
  );
}
