import "server-only";

import { parseEnv } from "@/lib/env/parse-env";
import { storageEnvSchema } from "@/lib/env/server-schema";
import { resolveStorageEnvironment } from "@/modules/auth/development/dev-auth-resource-policy";
import {
  createLiaraS3ObjectStorage,
  type LiaraS3ObjectStorage,
} from "@/modules/media/storage/liara-s3-object-storage";
import type { ObjectStorage } from "@/modules/media/storage/object-storage";

/**
 * Constructs the application ObjectStorage boundary.
 * Storage credentials are parsed here so boot, build, and default CI do not
 * require a live Liara account. Signed-access TTL env vars are parsed lazily
 * only when createReadAccess / createUploadAccess / createUploadPartAccess runs.
 * Call only from server-side media/infrastructure code. Do not import from
 * Client Components.
 */
export function createObjectStorage(): ObjectStorage {
  return createLiaraS3ObjectStorageFromEnv();
}

/**
 * Same construction as `createObjectStorage`, typed with Liara operational
 * helpers used by connectivity verification.
 */
export function createLiaraS3ObjectStorageFromEnv(): LiaraS3ObjectStorage {
  const source = resolveStorageEnvironment(process.env);
  const env = parseEnv(storageEnvSchema, {
    STORAGE_ENDPOINT: source.STORAGE_ENDPOINT,
    STORAGE_REGION: source.STORAGE_REGION,
    STORAGE_BUCKET: source.STORAGE_BUCKET,
    STORAGE_ACCESS_KEY: source.STORAGE_ACCESS_KEY,
    STORAGE_SECRET_KEY: source.STORAGE_SECRET_KEY,
    STORAGE_FORCE_PATH_STYLE: source.STORAGE_FORCE_PATH_STYLE,
  });

  return createLiaraS3ObjectStorage({
    config: {
      endpoint: env.STORAGE_ENDPOINT,
      region: env.STORAGE_REGION,
      bucket: env.STORAGE_BUCKET,
      accessKey: env.STORAGE_ACCESS_KEY,
      secretKey: env.STORAGE_SECRET_KEY,
      forcePathStyle: env.STORAGE_FORCE_PATH_STYLE === "true",
    },
  });
}
