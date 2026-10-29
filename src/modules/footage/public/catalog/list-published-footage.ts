import type {
  PublicFootageCatalogItem,
  PublicFootageCatalogStore,
} from "@/modules/footage/public/catalog/public-footage-catalog-store";

export type { PublicFootageCatalogItem } from "@/modules/footage/public/catalog/public-footage-catalog-store";

export type ListPublishedFootageParams = {
  store: PublicFootageCatalogStore;
};

/**
 * Public catalog query. The persistence boundary owns publication filtering
 * and deterministic ordering; this function exposes only the public DTO.
 */
export async function listPublishedFootage({
  store,
}: ListPublishedFootageParams): Promise<PublicFootageCatalogItem[]> {
  return store.listPublishedFootage();
}
