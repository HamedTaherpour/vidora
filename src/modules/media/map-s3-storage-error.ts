import {
  ObjectStorageError,
  type ObjectStorageErrorCategory,
  type ObjectStorageProviderName,
} from "@/modules/media/object-storage";

function readErrorName(error: unknown): string | null {
  if (typeof error !== "object" || error === null || !("name" in error)) {
    return null;
  }

  return typeof error.name === "string" ? error.name : null;
}

function readHttpStatus(error: unknown): number | null {
  if (typeof error !== "object" || error === null) {
    return null;
  }

  if ("$metadata" in error) {
    const metadata = error.$metadata;
    if (
      typeof metadata === "object" &&
      metadata !== null &&
      "httpStatusCode" in metadata &&
      typeof metadata.httpStatusCode === "number"
    ) {
      return metadata.httpStatusCode;
    }
  }

  if ("$response" in error) {
    const response = error.$response;
    if (
      typeof response === "object" &&
      response !== null &&
      "statusCode" in response &&
      typeof response.statusCode === "number"
    ) {
      return response.statusCode;
    }
  }

  return null;
}

function categorizeS3Failure(error: unknown): ObjectStorageErrorCategory {
  const name = readErrorName(error);
  const status = readHttpStatus(error);

  if (
    name === "NotFound" ||
    name === "NoSuchKey" ||
    name === "NotFoundError" ||
    status === 404
  ) {
    return "not_found";
  }

  if (
    name === "AccessDenied" ||
    name === "InvalidAccessKeyId" ||
    name === "SignatureDoesNotMatch" ||
    name === "Unauthorized" ||
    status === 401 ||
    status === 403
  ) {
    return "access_denied";
  }

  if (
    name === "TimeoutError" ||
    name === "NetworkingError" ||
    name === "AbortError"
  ) {
    return "network";
  }

  if (
    name === "InvalidRequest" ||
    name === "InvalidArgument" ||
    name === "MalformedXML" ||
    status === 400
  ) {
    return "invalid_request";
  }

  return "provider";
}

/**
 * Translate provider failures into safe application errors.
 * Must not copy AWS/Liara messages, signed URLs, or credentials into `message`.
 */
export function mapS3StorageError({
  error,
  operation,
  provider,
  bucket,
  objectKey = null,
}: {
  error: unknown;
  operation: string;
  provider: ObjectStorageProviderName;
  bucket: string;
  objectKey?: string | null;
}): ObjectStorageError {
  if (error instanceof ObjectStorageError) {
    return error;
  }

  return new ObjectStorageError({
    category: categorizeS3Failure(error),
    operation,
    provider,
    bucket,
    objectKey,
  });
}
