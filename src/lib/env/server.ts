import "server-only";

import { parseEnv } from "@/lib/env/parse-env";
import { serverEnvSchema } from "@/lib/env/server-schema";

/**
 * Server-only configuration.
 * Add a key to `serverEnvSchema` when a feature introduces server configuration.
 * Do not default a required secret to an empty or placeholder value.
 */
export const serverEnv = parseEnv(serverEnvSchema, process.env);
