import type {
  ObjectStorage,
  TemporaryObjectAccess,
} from "@/modules/media/object-storage";

export type PublishedPreviewRecord = {
  footageId: string;
  objectKey: string;
  mimeType: string;
};

export type PublicPreviewStore = {
  findPublishedReadyPreview(
    footageId: string,
  ): Promise<PublishedPreviewRecord | null>;
};

export class PreviewNotAvailableError extends Error {
  constructor() {
    super("The requested preview is not available.");
    this.name = "PreviewNotAvailableError";
  }
}

export type PublicPreviewAccess = TemporaryObjectAccess & {
  mimeType: string;
};

export type PublicPreviewDeliveryMode = "stream" | "download";

/**
 * Resolves public preview access only for a published Footage with a ready
 * PREVIEW file. The storage boundary remains responsible for signing access;
 * this module never signs ORIGINAL files.
 */
export async function createPublicPreviewAccess({
  footageId,
  store,
  storage,
  mode = "stream",
}: {
  footageId: string;
  store: PublicPreviewStore;
  storage: ObjectStorage;
  mode?: PublicPreviewDeliveryMode;
}): Promise<PublicPreviewAccess> {
  const preview = await store.findPublishedReadyPreview(footageId);

  if (preview === null) {
    throw new PreviewNotAvailableError();
  }

  const access = await storage.createReadAccess({
    objectKey: preview.objectKey,
    accessPolicy: "preview",
    responseContentType: preview.mimeType,
    responseContentDisposition: mode === "download" ? "attachment" : "inline",
  });

  return { ...access, mimeType: preview.mimeType };
}
