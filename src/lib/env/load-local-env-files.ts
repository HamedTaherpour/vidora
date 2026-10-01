import { config } from "dotenv";
import path from "node:path";

type LoadLocalEnvFilesOptions = {
  nodeEnv?: string;
  cwd?: string;
};

/**
 * Load env files in Next.js precedence without overriding variables
 * already present in the process environment.
 * Prisma CLI does not load these files itself.
 * `.env.local` is skipped when `NODE_ENV` is `test`, matching Next.js.
 */
export function loadLocalEnvFiles(
  options: LoadLocalEnvFilesOptions = {},
): void {
  const nodeEnv = options.nodeEnv ?? process.env.NODE_ENV ?? "development";
  const cwd = options.cwd ?? process.cwd();
  const files = [
    `.env.${nodeEnv}.local`,
    nodeEnv === "test" ? undefined : ".env.local",
    `.env.${nodeEnv}`,
    ".env",
  ].filter((file): file is string => file !== undefined);

  for (const file of files) {
    config({ path: path.join(cwd, file), quiet: true });
  }
}
