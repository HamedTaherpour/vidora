/**
 * Builds a stable URL for a public footage-list page while preserving filters.
 *
 * @param page - One-based page number; page one is omitted from the query.
 * @param query - Current public search query.
 * @param category - Current public category slug.
 * @param scenario - Optional UI-mock scenario to preserve.
 */
export function createPublicFootagePageHref(
  page: number,
  query: string,
  category: string,
  scenario?: string,
) {
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  if (category) params.set("category", category);
  if (scenario) params.set("scenario", scenario);
  if (page > 1) params.set("page", String(page));
  const search = params.toString();
  return `${search ? `/?${search}` : "/"}#footage-listing`;
}
