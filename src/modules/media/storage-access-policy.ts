import { parseEnv, type EnvSource } from "@/lib/env/parse-env";
import {
  storageSignedReadTtlEnvSchema,
  storageSignedUploadTtlEnvSchema,
} from "@/lib/env/server-schema";
import type { ObjectAccessPolicy } from "@/modules/media/object-storage";

/**
 * Temporary signed-access lifetimes for preview vs original policies.
 * Exact TTL seconds come from validated server configuration — MEDIA-02 does
 * not ship product-default durations. See `instructions/media.md` §6.2.
 */
export type SignedAccessPolicyTtlSeconds = {
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
  return accessPolicy === "preview" ? ttl.preview : ttl.original;
}

export function signedUploadTtlSeconds(
  accessPolicy: ObjectAccessPolicy,
  ttl: SignedAccessPolicyTtlSeconds,
): number {
  return accessPolicy === "preview" ? ttl.preview : ttl.original;
}

/**
 * Parses signed-read TTL configuration when read access is actually requested.
 */
export function resolveSignedReadTtlSeconds(
  source: EnvSource = process.env,
): SignedAccessPolicyTtlSeconds {
  const env = parseEnv(storageSignedReadTtlEnvSchema, {
    STORAGE_SIGNED_PREVIEW_READ_TTL_SECONDS:
      source.STORAGE_SIGNED_PREVIEW_READ_TTL_SECONDS,
    STORAGE_SIGNED_ORIGINAL_READ_TTL_SECONDS:
      source.STORAGE_SIGNED_ORIGINAL_READ_TTL_SECONDS,
  });

  return {
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
