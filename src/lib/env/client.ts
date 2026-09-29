import { z } from "zod";
import {
  EnvironmentConfigError,
  parseEnv,
  type EnvSource,
} from "@/lib/env/parse-env";

const PUBLIC_ENV_PREFIX = "NEXT_PUBLIC_";

/**
 * Browser-safe configuration.
 * Only `NEXT_PUBLIC_*` keys may be declared here.
 * Read each value with a static `process.env.NEXT_PUBLIC_*` access so Next.js
 * can inline it. Do not pass `process.env` through or index it dynamically.
 */
const clientEnvSchema = z.object({});

export function parseClientEnv<TShape extends z.ZodRawShape>(
  schema: z.ZodObject<TShape>,
  source: EnvSource,
): z.output<z.ZodObject<TShape>> {
  const declaredKeys = Object.keys(schema.shape);
  const invalidKeys = declaredKeys.filter(
    (key) => !key.startsWith(PUBLIC_ENV_PREFIX),
  );

  if (invalidKeys.length > 0) {
    throw new EnvironmentConfigError(
      invalidKeys.map(
        (key) =>
          `${key}: client environment variables must start with ${PUBLIC_ENV_PREFIX}`,
      ),
    );
  }

  const selected: EnvSource = {};

  for (const key of declaredKeys) {
    selected[key] = source[key];
  }

  return parseEnv(schema, selected);
}

function readClientEnv(): EnvSource {
  return {};
}

export const clientEnv = parseClientEnv(clientEnvSchema, readClientEnv());
