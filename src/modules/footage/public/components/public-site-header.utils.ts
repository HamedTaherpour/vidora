/** Builds the public homepage URL for a selected footage category. */
export function createPublicCategoryHref(value: string) {
  return `/footage?category=${encodeURIComponent(value)}`;
}
