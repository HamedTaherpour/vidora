import type { AdminFootageCoverRecord } from "@/modules/media/covers/admin-footage-cover-store";
import type {
  ObjectStorage,
  TemporaryObjectAccess,
} from "@/modules/media/storage/object-storage";

export type PublicFootageCoverStore = {
  findPublishedByFootageId(
    footageId: string,
  ): Promise<AdminFootageCoverRecord | null>;
};

export class CoverNotAvailableError extends Error {
  constructor() {
    super("The requested cover is not available.");
    this.name = "CoverNotAvailableError";
  }
}

export async function createPublicFootageCoverAccess({
  footageId,
  store,
  storage,
}: {
  footageId: string;
  store: PublicFootageCoverStore;
  storage: ObjectStorage;
}): Promise<TemporaryObjectAccess & { mimeType: string }> {
  const cover = await store.findPublishedByFootageId(footageId);

  if (cover === null) {
    throw new CoverNotAvailableError();
  }

  const access = await storage.createReadAccess({
    objectKey: cover.objectKey,
    accessPolicy: "cover",
    responseContentType: cover.mimeType,
    responseContentDisposition: "inline",
  });

  return { ...access, mimeType: cover.mimeType };
}
