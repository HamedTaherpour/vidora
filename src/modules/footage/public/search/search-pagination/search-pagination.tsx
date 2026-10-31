import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

import { createSearchHref } from "../search";
import type { SearchPaginationProps } from "./search-pagination.types";

export function SearchPagination(props: SearchPaginationProps) {
  const { query, totalPages } = props;

  if (totalPages <= 1) return null;

  return (
    <Pagination className="mt-8 flex justify-center">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            disabled={query.page === 1}
            render={
              <a
                href={createSearchHref(query, {
                  page: query.page - 1,
                })}
              />
            }
            nativeButton={false}
          />
        </PaginationItem>
        {Array.from({ length: totalPages }, (_, index) => index + 1).map(
          (page) => (
            <PaginationItem key={page}>
              <PaginationLink
                isActive={page === query.page}
                className="size-10"
                render={<a href={createSearchHref(query, { page })} />}
                nativeButton={false}
              >
                {page.toLocaleString("fa-IR")}
              </PaginationLink>
            </PaginationItem>
          ),
        )}
        <PaginationItem>
          <PaginationNext
            disabled={query.page === totalPages}
            render={
              <a
                href={createSearchHref(query, {
                  page: query.page + 1,
                })}
              />
            }
            nativeButton={false}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
