export type PublicFootageCatalogItem = {
  id: string;
  slug: string;
  titleFa: string;
  priceToman: number;
  category: {
    slug: string;
    nameFa: string;
  };
  cover: { status: "ready"; src: string; altFa: string };
  preview: {
    status: "ready" | "unavailable";
  };
};

export type PublicFootageCatalogStore = {
  listPublishedFootage: () => Promise<PublicFootageCatalogItem[]>;
};
