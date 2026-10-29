import "server-only";

import { parseEnv, type EnvSource } from "@/lib/env/parse-env";
import {
  storageSignedReadTtlEnvSchema,
  storageSignedUploadTtlEnvSchema,
} from "@/lib/env/server-schema";
import type { ObjectAccessPolicy } from "@/modules/media/storage/object-storage";

/**
 * Temporary signed-access lifetimes for cover, preview, and original policies.
 * Exact TTL seconds come from validated server configuration — MEDIA-02 does
 * not ship product-default durations. See `instructions/media.md` §6.2.
 */
export type SignedAccessPolicyTtlSeconds = {
  cover?: number;
  preview: number;
  original: number;
};

export type SignedAccessTtlResolver = {
  resolveReadTtl: () => SignedAccessPolicyTtlSeconds;
  resolveUploadTtl: () => SignedAccessPolicyTtlSeconds;
};

export function signedReadTtlSeconds(
  accessPolicy: ObjectAccessPolicy,
  ttl: SignedAccessPolicyTtlSeconds,
): number {
  return accessPolicy === "cover"
    ? (ttl.cover ?? ttl.preview)
    : accessPolicy === "preview"
      ? ttl.preview
      : ttl.original;
}

export function signedUploadTtlSeconds(
  accessPolicy: ObjectAccessPolicy,
  ttl: SignedAccessPolicyTtlSeconds,
): number {
  return accessPolicy === "cover"
    ? (ttl.cover ?? ttl.preview)
    : accessPolicy === "preview"
      ? ttl.preview
      : ttl.original;
}

/**
 * Parses signed-read TTL configuration when read access is actually requested.
 */
export function resolveSignedReadTtlSeconds(
  source: EnvSource = process.env,
): SignedAccessPolicyTtlSeconds {
  const env = parseEnv(storageSignedReadTtlEnvSchema, {
    STORAGE_SIGNED_COVER_READ_TTL_SECONDS:
      source.STORAGE_SIGNED_COVER_READ_TTL_SECONDS,
    STORAGE_SIGNED_PREVIEW_READ_TTL_SECONDS:
      source.STORAGE_SIGNED_PREVIEW_READ_TTL_SECONDS,
    STORAGE_SIGNED_ORIGINAL_READ_TTL_SECONDS:
      source.STORAGE_SIGNED_ORIGINAL_READ_TTL_SECONDS,
  });

  return {
    cover: env.STORAGE_SIGNED_COVER_READ_TTL_SECONDS,
    preview: env.STORAGE_SIGNED_PREVIEW_READ_TTL_SECONDS,
    original: env.STORAGE_SIGNED_ORIGINAL_READ_TTL_SECONDS,
  };
}

/**
 * Parses signed-upload TTL configuration when upload access is actually requested.
 */
export function resolveSignedUploadTtlSeconds(
  source: EnvSource = process.env,
): SignedAccessPolicyTtlSeconds {
  const env = parseEnv(storageSignedUploadTtlEnvSchema, {
    STORAGE_SIGNED_PREVIEW_UPLOAD_TTL_SECONDS:
      source.STORAGE_SIGNED_PREVIEW_UPLOAD_TTL_SECONDS,
    STORAGE_SIGNED_ORIGINAL_UPLOAD_TTL_SECONDS:
      source.STORAGE_SIGNED_ORIGINAL_UPLOAD_TTL_SECONDS,
  });

  return {
    preview: env.STORAGE_SIGNED_PREVIEW_UPLOAD_TTL_SECONDS,
    original: env.STORAGE_SIGNED_ORIGINAL_UPLOAD_TTL_SECONDS,
  };
}

export function createEnvSignedAccessTtlResolver(
  source: EnvSource = process.env,
): SignedAccessTtlResolver {
  return {
    resolveReadTtl: () => resolveSignedReadTtlSeconds(source),
    resolveUploadTtl: () => resolveSignedUploadTtlSeconds(source),
  };
}
