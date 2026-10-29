import "server-only";

import sharp from "sharp";

import { randomUUID } from "node:crypto";

import type {
  AdminFootageCoverRecord,
  AdminFootageCoverStore,
} from "@/modules/media/covers/admin-footage-cover-store";
import {
  COVER_HEIGHT,
  COVER_MAX_BYTES,
  COVER_OUTPUT_EXTENSION,
  COVER_OUTPUT_MIME_TYPE,
  COVER_WIDTH,
  isCoverOutputSize,
} from "@/modules/media/covers/cover-policy";
import type { ObjectStorage } from "@/modules/media/storage/object-storage";

export class InvalidFootageCoverError extends Error {
  constructor() {
    super("The Footage cover is invalid.");
    this.name = "InvalidFootageCoverError";
  }
}

export class FootageCoverStorageError extends Error {
  constructor() {
    super("The Footage cover could not be stored.");
    this.name = "FootageCoverStorageError";
  }
}

type SaveAdminFootageCoverParams = {
  footageId: string;
  bytes: Uint8Array;
  store: AdminFootageCoverStore;
  storage: ObjectStorage;
  createObjectKey?: () => string;
};

export async function saveAdminFootageCover({
  footageId,
  bytes,
  store,
  storage,
  createObjectKey = randomUUID,
}: SaveAdminFootageCoverParams): Promise<AdminFootageCoverRecord> {
  if (bytes.byteLength < 1 || bytes.byteLength > COVER_MAX_BYTES) {
    throw new InvalidFootageCoverError();
  }

  let metadata: { format?: string; width?: number; height?: number };
  try {
    metadata = await sharp(bytes, { failOn: "error" }).metadata();
  } catch {
    throw new InvalidFootageCoverError();
  }

  if (
    metadata.format !== "jpeg" ||
    metadata.width === undefined ||
    metadata.height === undefined ||
    !isCoverOutputSize(metadata.width, metadata.height)
  ) {
    throw new InvalidFootageCoverError();
  }

  const objectKey = `footage/${footageId}/cover/${createObjectKey()}${COVER_OUTPUT_EXTENSION}`;

  try {
    if (!storage.putObjectBytes) {
      throw new FootageCoverStorageError();
    }

    await storage.putObjectBytes({
      objectKey,
      body: bytes,
      contentType: COVER_OUTPUT_MIME_TYPE,
    });
  } catch {
    throw new FootageCoverStorageError();
  }

  return store.save({
    footageId,
    objectKey,
    mimeType: COVER_OUTPUT_MIME_TYPE,
    sizeBytes: BigInt(bytes.byteLength),
    width: COVER_WIDTH,
    height: COVER_HEIGHT,
  });
}
