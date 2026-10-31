/** Creates a stable remount key for the homepage search controls. */
export function createHomepageSearchControlsKey(
  query: string,
  scenario?: string,
) {
  return `${query}\u0000${scenario ?? ""}`;
}

/** Builds the production footage explorer URL from homepage search state. */
export function createHomepageUrl({
  query,
  category,
}: {
  query: string;
  category: string;
}) {
  const params = new URLSearchParams();
  if (query.trim()) params.set("q", query.trim());
  if (category) params.set("category", category);
  const search = params.toString();
  return search ? `/footage?${search}` : "/footage";
}

/** Builds the URL used when submitting the current draft search query. */
export function createHomepageSearchUrl({
  draftQuery,
  category,
}: {
  draftQuery: string;
  category: string;
}) {
  return createHomepageUrl({ query: draftQuery, category });
}

/** Builds the URL used when changing the selected category. */
export function createHomepageCategoryUrl({
  query,
  category,
}: {
  query: string;
  category: string;
}) {
  return createHomepageUrl({ query, category });
}

/** Builds the homepage URL with query and category filters cleared. */
export function createHomepageClearUrl() {
  return createHomepageUrl({ query: "", category: "" });
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
