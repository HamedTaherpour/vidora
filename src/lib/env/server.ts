import "server-only";

import { parseServerEnv } from "@/lib/env/server-schema";

/**
 * Server-only configuration.
 * Add a key to `serverEnvSchema` when a feature introduces server configuration.
 * Do not default a required secret to an empty or placeholder value.
 */
export const serverEnv = parseServerEnv(process.env);
