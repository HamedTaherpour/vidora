import { parseEnv, type EnvSource } from "@/lib/env/parse-env";
import { isPostgreSqlConnectionUrl } from "@/lib/env/server-schema";
import { storageEnvSchema } from "@/lib/env/server-schema";
import { isDevelopmentAuthBypassEnabled } from "@/modules/auth/development/dev-auth-bypass";

export class DevelopmentAuthIsolationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DevelopmentAuthIsolationError";
  }
}

function requireLocalResourceMarker(source: EnvSource): void {
  if (source.DEV_AUTH_BYPASS_RESOURCE !== "local") {
    throw new DevelopmentAuthIsolationError(
      "DEV_AUTH_BYPASS requires DEV_AUTH_BYPASS_RESOURCE=local before accessing development resources.",
    );
  }
}

export function resolveDatabaseConnectionString(
  source: EnvSource = process.env,
): string {
  if (
    !isDevelopmentAuthBypassEnabled({
      NODE_ENV: source.NODE_ENV,
      DEV_AUTH_BYPASS: source.DEV_AUTH_BYPASS,
    })
  ) {
    if (source.DATABASE_URL === undefined) {
      throw new Error("DATABASE_URL is required.");
    }

    return source.DATABASE_URL;
  }

  requireLocalResourceMarker(source);

  const databaseUrl = source.DEV_DATABASE_URL;
  if (databaseUrl === undefined || !isPostgreSqlConnectionUrl(databaseUrl)) {
    throw new DevelopmentAuthIsolationError(
      "DEV_AUTH_BYPASS requires a valid DEV_DATABASE_URL; refusing database access.",
    );
  }

  if (databaseUrl === source.DATABASE_URL) {
    throw new DevelopmentAuthIsolationError(
      "DEV_AUTH_BYPASS requires a database resource separate from DATABASE_URL; refusing database access.",
    );
  }

  return databaseUrl;
}

export function resolveStorageEnvironment(
  source: EnvSource = process.env,
): EnvSource {
  if (
    !isDevelopmentAuthBypassEnabled({
      NODE_ENV: source.NODE_ENV,
      DEV_AUTH_BYPASS: source.DEV_AUTH_BYPASS,
    })
  ) {
    return source;
  }

  requireLocalResourceMarker(source);

  try {
    const developmentStorage = parseEnv(storageEnvSchema, {
      STORAGE_ENDPOINT: source.DEV_STORAGE_ENDPOINT,
      STORAGE_REGION: source.DEV_STORAGE_REGION,
      STORAGE_BUCKET: source.DEV_STORAGE_BUCKET,
      STORAGE_ACCESS_KEY: source.DEV_STORAGE_ACCESS_KEY,
      STORAGE_SECRET_KEY: source.DEV_STORAGE_SECRET_KEY,
      STORAGE_FORCE_PATH_STYLE: source.DEV_STORAGE_FORCE_PATH_STYLE,
    });

    if (
      developmentStorage.STORAGE_ENDPOINT === source.STORAGE_ENDPOINT &&
      developmentStorage.STORAGE_BUCKET === source.STORAGE_BUCKET
    ) {
      throw new DevelopmentAuthIsolationError(
        "DEV_AUTH_BYPASS requires a storage resource separate from STORAGE_ENDPOINT/STORAGE_BUCKET; refusing storage access.",
      );
    }

    return developmentStorage;
  } catch {
    throw new DevelopmentAuthIsolationError(
      "DEV_AUTH_BYPASS requires complete development storage configuration; refusing storage access.",
    );
  }
}
