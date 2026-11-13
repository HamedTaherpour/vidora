import type { PublicFootageCatalogItem } from "./public-footage-catalog-store";

export type PublicFootageQuality = {
  label: string;
  width?: number;
  height?: number;
  sizeBytes?: number;
  mimeType?: string;
  codec?: string;
};

export type PublicFootageDetail = PublicFootageCatalogItem & {
  descriptionFa: string;
  tags: string[];
  publishedAt?: string;
  durationSeconds?: number;
  technical: {
    width?: number;
    height?: number;
    fps?: number;
    codec?: string;
    mimeType?: string;
  };
  qualities: PublicFootageQuality[];
  dataSource: "catalog" | "development-fixture";
};

export type PublicFootageDetailStore = {
  findPublishedFootageBySlug: (
    slug: string,
  ) => Promise<PublicFootageDetail | null>;
};
