import "server-only";

import { z } from "zod";
import { parseEnv } from "@/lib/env/parse-env";

/**
 * Server-only configuration.
 * Foundation has no required application variables yet.
 * Add a key here when a feature introduces server configuration.
 * Do not default a required secret to an empty or placeholder value.
 */
const serverEnvSchema = z.object({});

export const serverEnv = parseEnv(serverEnvSchema, process.env);
