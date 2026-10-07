import { z } from "zod";

/** Fixed V1 Admin catalog page size. Not user-configurable. */
export const ADMIN_FOOTAGE_CATALOG_PAGE_SIZE = 50;

/** Matches practical URL search length; not a product search engine limit. */
export const ADMIN_FOOTAGE_CATALOG_QUERY_MAX_LENGTH = 200;

/**
 * Normalize Admin catalog list URL inputs.
 * Invalid or missing `page` falls back to 1.
 * Empty/whitespace `q` becomes an empty search (full list).
 */
export function parseAdminFootageCatalogQuery(input: {
  q?: string | string[] | undefined;
  page?: string | string[] | undefined;
}): {
  q: string;
  page: number;
} {
  const qRaw = Array.isArray(input.q) ? input.q[0] : input.q;
  const pageRaw = Array.isArray(input.page) ? input.page[0] : input.page;

  const qParsed = z
    .string()
    .max(ADMIN_FOOTAGE_CATALOG_QUERY_MAX_LENGTH)
    .optional()
    .safeParse(qRaw === undefined ? undefined : qRaw);

  const q =
    qParsed.success && qParsed.data !== undefined ? qParsed.data.trim() : "";

  const pageParsed = z.coerce
    .number()
    .int()
    .positive()
    .safeParse(pageRaw === undefined || pageRaw === "" ? 1 : pageRaw);

  return {
    q: qParsed.success ? q : "",
    page: pageParsed.success ? pageParsed.data : 1,
  };
}
