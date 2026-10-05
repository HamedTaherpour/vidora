/**
 * Manually provision an Admin phone identity.
 *
 * Usage:
 *   pnpm admin:provision -- 09121234567
 *   pnpm admin:provision -- +989121234567
 *
 * Idempotent. Does not create a Customer User or any session.
 * There is no browser Admin signup endpoint.
 */
import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../src/generated/prisma/client.ts";
import { loadLocalEnvFiles } from "../src/lib/env/load-local-env-files.ts";
import {
  InvalidIranianMobileNumberError,
  normalizeIranianMobile,
} from "../src/modules/auth/normalize-iranian-mobile.ts";

loadLocalEnvFiles({ nodeEnv: process.env.NODE_ENV ?? "development" });

const phoneArg = process.argv
  .slice(2)
  .filter((arg) => arg !== "--")
  .at(-1);

if (!phoneArg) {
  console.error(
    "Usage: pnpm admin:provision -- <iranian-mobile>\nExample: pnpm admin:provision -- 09121234567",
  );
  process.exit(1);
}

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("DATABASE_URL is required to provision an Admin.");
  process.exit(1);
}

/** @type {string} */
let phone;

try {
  phone = normalizeIranianMobile(phoneArg);
} catch (error) {
  if (error instanceof InvalidIranianMobileNumberError) {
    console.error("Invalid Iranian mobile number.");
    process.exit(1);
  }

  throw error;
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

try {
  const existing = await prisma.admin.findUnique({
    where: { phone },
    select: { id: true },
  });

  if (existing) {
    console.log(
      JSON.stringify({
        status: "already_exists",
        phone,
        adminId: existing.id,
      }),
    );
    process.exit(0);
  }

  const created = await prisma.admin.create({
    data: { phone },
    select: { id: true },
  });

  console.log(
    JSON.stringify({
      status: "created",
      phone,
      adminId: created.id,
    }),
  );
} catch (error) {
  const raced = await prisma.admin.findUnique({
    where: { phone },
    select: { id: true },
  });

  if (raced) {
    console.log(
      JSON.stringify({
        status: "already_exists",
        phone,
        adminId: raced.id,
      }),
    );
    process.exit(0);
  }

  throw error;
} finally {
  await prisma.$disconnect();
}
