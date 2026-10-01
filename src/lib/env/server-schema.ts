import { z } from "zod";
// Relative import so Prisma CLI can load this file from `prisma.config.ts`.
// That process does not resolve the `@/` TypeScript path alias.
import { parseEnv, type EnvSource } from "./parse-env";

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
 */
export const serverEnvSchema = z.object({
  DATABASE_URL: z.string().refine(isPostgreSqlConnectionUrl, {
    message: "must be a postgresql:// or postgres:// connection URL",
  }),
});

/**
 * Datasource URL for the Prisma CLI.
 * `prisma generate` does not connect, so a missing URL stays empty.
 * A present value uses the same validation as `serverEnv`.
 */
export function databaseUrlForPrismaCli(source: EnvSource): string {
  if (source.DATABASE_URL === undefined) {
    return "";
  }

  return parseEnv(serverEnvSchema, {
    DATABASE_URL: source.DATABASE_URL,
  }).DATABASE_URL;
}
