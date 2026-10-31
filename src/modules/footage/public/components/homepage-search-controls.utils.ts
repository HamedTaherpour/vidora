/** Creates a stable remount key for the homepage search controls. */
export function createHomepageSearchControlsKey(
  query: string,
  scenario?: string,
) {
  return `${query}\u0000${scenario ?? ""}`;
}

/** Builds the canonical homepage URL from query, category, and mock scenario state. */
export function createHomepageUrl({
  query,
  category,
  scenario,
}: {
  query: string;
  category: string;
  scenario?: string;
}) {
  const params = new URLSearchParams();
  if (query.trim()) params.set("q", query.trim());
  if (category) params.set("category", category);
  if (scenario) params.set("scenario", scenario);
  const search = params.toString();
  return search ? `/?${search}` : "/";
}

/** Builds the URL used when submitting the current draft search query. */
export function createHomepageSearchUrl({
  draftQuery,
  category,
  scenario,
}: {
  draftQuery: string;
  category: string;
  scenario?: string;
}) {
  return createHomepageUrl({ query: draftQuery, category, scenario });
}

/** Builds the URL used when changing the selected category. */
export function createHomepageCategoryUrl({
  query,
  category,
  scenario,
}: {
  query: string;
  category: string;
  scenario?: string;
}) {
  return createHomepageUrl({ query, category, scenario });
}

/** Builds the homepage URL with query and category filters cleared. */
export function createHomepageClearUrl(scenario?: string) {
  return createHomepageUrl({ query: "", category: "", scenario });
}

/** Reports whether any committed or draft filter can be cleared. */
export function hasHomepageClearableState({
  query,
  category,
  draftQuery,
}: {
  query: string;
  category: string;
  draftQuery: string;
}) {
  return Boolean(
    category || query.trim().length > 0 || draftQuery.trim().length > 0,
  );
}
