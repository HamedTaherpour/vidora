import { defineConfig } from "prisma/config";
import { databaseUrlForPrismaCli } from "./src/lib/env/server-schema";
import { loadLocalEnvFiles } from "./src/lib/env/load-local-env-files";

// Do not import `@/lib/env/server` here. That module is server-only and
// throws outside the Next.js server runtime. Prisma CLI loads this file
// directly, including for `prisma generate`, which must not require a database.
loadLocalEnvFiles();

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: databaseUrlForPrismaCli(process.env),
  },
});
