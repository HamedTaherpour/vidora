import { z } from "zod";
// Relative imports so Prisma CLI can load this file from `prisma.config.ts`.
// That process does not resolve the `@/` TypeScript path alias.
import { isAbsoluteHttpOrigin } from "../../modules/auth/browser-auth-origin";
import { EnvironmentConfigError, parseEnv, type EnvSource } from "./parse-env";

function isPostgreSqlConnectionUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "postgresql:" || url.protocol === "postgres:";
  } catch {
    return false;
  }
}

/**
 * Variables declared here are server-only.
 * `server.ts` parses them behind `server-only`.
 * Do not declare `DATABASE_URL` on the client schema.
 * `OTP_HASH_SECRET` is required at boot because the root layout loads this schema.
 * Kavenegar credentials are intentionally absent: build and CI must not require
 * a live SMS account. `kavenegarEnvSchema` is parsed when that provider is constructed.
 * `APP_ORIGIN` is required when `NODE_ENV` is `production`.
 * Outside production it is optional: local OTP verification allows
 * `http://localhost:3000`, and a set value adds one more exact origin.
 */
const databaseUrlSchema = z.object({
  DATABASE_URL: z.string().refine(isPostgreSqlConnectionUrl, {
    message: "must be a postgresql:// or postgres:// connection URL",
  }),
});

export const serverEnvSchema = databaseUrlSchema.extend({
  OTP_HASH_SECRET: z.string().min(32),
  APP_ORIGIN: z
    .string()
    .refine(isAbsoluteHttpOrigin, {
      message:
        "must be an absolute http or https origin with no path, query, or userinfo",
    })
    .optional(),
});

/**
 * Parses server boot configuration.
 * Production fails clearly when `APP_ORIGIN` is missing.
 */
export function parseServerEnv(source: EnvSource) {
  const env = parseEnv(serverEnvSchema, source);

  if (source.NODE_ENV === "production" && env.APP_ORIGIN === undefined) {
    throw new EnvironmentConfigError([
      "APP_ORIGIN: is required when NODE_ENV is production",
    ]);
  }

  return env;
}

/**
 * Required only when the Kavenegar OTP provider is constructed.
 * Template names are English letters and digits, without spaces or underscores.
 */
export const kavenegarEnvSchema = z.object({
  KAVENEGAR_API_KEY: z.string().regex(/^\S+$/, {
    message: "must be a non-empty credential without spaces",
  }),
  KAVENEGAR_OTP_TEMPLATE: z.string().regex(/^[A-Za-z][A-Za-z0-9]*$/, {
    message: "must be English letters and digits without spaces or underscores",
  }),
});

/**
 * Datasource URL for the Prisma CLI.
 * `prisma generate` does not connect, so a missing URL stays empty.
 * A present URL uses the same PostgreSQL check as `serverEnv`.
 * `OTP_HASH_SECRET` is not read here, so client generation does not require it.
 */
export function databaseUrlForPrismaCli(source: EnvSource): string {
  if (source.DATABASE_URL === undefined) {
    return "";
  }

  return parseEnv(databaseUrlSchema, {
    DATABASE_URL: source.DATABASE_URL,
  }).DATABASE_URL;
}
