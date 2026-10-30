import "server-only";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";
import { serverEnv } from "@/lib/env/server";
import { resolveDatabaseConnectionString } from "@/modules/auth/development/dev-auth-resource-policy";

const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: PrismaClient;
  prismaConnectionString?: string;
};

const databaseConnectionString = resolveDatabaseConnectionString({
  ...process.env,
  DATABASE_URL: serverEnv.DATABASE_URL,
});

function createPrismaClient(): PrismaClient {
  const adapter = new PrismaPg({
    connectionString: databaseConnectionString,
  });

  return new PrismaClient({ adapter });
}

/**
 * Next.js development reloads server modules.
 * Reuse one client in development so reloads do not open extra PostgreSQL pools.
 */
export const prisma =
  globalForPrisma.prismaConnectionString === databaseConnectionString &&
  globalForPrisma.prisma
    ? globalForPrisma.prisma
    : createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
  globalForPrisma.prismaConnectionString = databaseConnectionString;
}
