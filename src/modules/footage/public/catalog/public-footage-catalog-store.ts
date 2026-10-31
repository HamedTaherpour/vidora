/** Category option used by public catalog navigation and filtering controls. */
export type PublicFootageCategoryOption = {
  value: string;
  labelFa: string;
};

/** Public catalog data required by storefront cards and preview interactions. */
export type PublicFootageCatalogItem = {
  id: string;
  slug: string;
  titleFa: string;
  priceToman: number;
  durationSeconds?: number;
  category: {
    slug: string;
    nameFa: string;
  };
  cover:
    | { status: "ready"; src: string; altFa: string }
    | { status: "unavailable"; altFa: string };
  preview: {
    status: "ready" | "unavailable";
    videoUrl?: string;
  };
};

/** Boundary for loading published footage into the public catalog. */
export type PublicFootageCatalogStore = {
  listPublishedFootage: () => Promise<PublicFootageCatalogItem[]>;
};
