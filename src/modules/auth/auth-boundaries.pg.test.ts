/**
 * Opt-in PostgreSQL checks for Admin/customer authorization boundaries.
 * Excluded from `pnpm test` and CI. Run with `pnpm test:pg`.
 * Deletes only the rows this file inserts. Does not reset or truncate.
 */
import { randomInt } from "node:crypto";
import { PrismaPg } from "@prisma/adapter-pg";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import { PrismaClient } from "@/generated/prisma/client";
import { loadLocalEnvFiles } from "@/lib/env/load-local-env-files";
import { hashOtpCode } from "@/modules/auth/otp-hash";
import {
  OTP_PURPOSE_ADMIN,
  OTP_PURPOSE_CUSTOMER,
} from "@/modules/auth/otp-purpose";
import { createPrismaAdminOtpVerificationStore } from "@/modules/auth/prisma-admin-otp-verification-store";
import { createPrismaOtpVerificationStore } from "@/modules/auth/prisma-otp-verification-store";
import { resolveAdminSession } from "@/modules/auth/resolve-admin-session";
import { resolveCustomerSession } from "@/modules/auth/resolve-customer-session";
import {
  generateSessionToken,
  hashSessionToken,
  sessionExpiresAt,
} from "@/modules/auth/session-token";
import { verifyAdminOtp } from "@/modules/auth/verify-admin-otp";
import { verifyOtp } from "@/modules/auth/verify-otp";

loadLocalEnvFiles({ nodeEnv: "development" });

const SECRET = "test-otp-hash-secret-0123456789ab";
const CODE = "042817";
const NOW = new Date("2026-10-05T12:00:00.000Z");
const run = randomInt(0, 0x10000);
const createdPhones: string[] = [];

let prisma: PrismaClient | undefined;

function assertLocalDevelopmentDatabase(connectionString: string): void {
  const url = new URL(connectionString);
  const host = url.hostname.replace(/^\[|\]$/g, "");
  const local = host === "localhost" || host === "127.0.0.1" || host === "::1";

  if (!local) {
    throw new Error(
      `Auth boundary test refuses non-local database host ${host}.`,
    );
  }

  if (url.pathname.toLowerCase().includes("prod")) {
    throw new Error(
      "Auth boundary test refuses a database name containing prod.",
    );
  }
}

function testPhone(series: number, index: number): string {
  const digits = `${String(series).padStart(2, "0")}${String(run).padStart(5, "0")}${String(index).padStart(2, "0")}`;
  const phone = `+989${digits}`;

  if (!/^\+989[0-9]{9}$/.test(phone)) {
    throw new Error("Test phone is not canonical.");
  }

  createdPhones.push(phone);

  return phone;
}

function requirePrisma(): PrismaClient {
  if (!prisma) {
    throw new Error("Auth boundary test is not connected.");
  }

  return prisma;
}

async function cleanup(): Promise<void> {
  if (!prisma || createdPhones.length === 0) {
    return;
  }

  const phones = [...new Set(createdPhones)];

  await prisma.adminSession.deleteMany({
    where: { admin: { phone: { in: phones } } },
  });
  await prisma.admin.deleteMany({
    where: { phone: { in: phones } },
  });
  await prisma.session.deleteMany({
    where: { user: { phone: { in: phones } } },
  });
  await prisma.user.deleteMany({
    where: { phone: { in: phones } },
  });
  await prisma.otpChallenge.deleteMany({
    where: { phone: { in: phones } },
  });
  await prisma.otpRequestEvent.deleteMany({
    where: { phone: { in: phones } },
  });
}

beforeAll(() => {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is missing. pnpm test:pg uses the local development database.",
    );
  }

  assertLocalDevelopmentDatabase(connectionString);

  prisma = new PrismaClient({
    adapter: new PrismaPg({
      connectionString,
      max: 25,
    }),
  });
});

afterEach(async () => {
  await cleanup();
});

afterAll(async () => {
  await cleanup();
  await prisma?.$disconnect();
});

describe("Admin and customer boundaries on local PostgreSQL", () => {
  it("allows the same phone on User and Admin as separate identities", async () => {
    const phone = testPhone(90, 1);
    const client = requirePrisma();

    await client.user.create({
      data: { phone, createdAt: NOW, updatedAt: NOW },
    });
    await client.admin.create({
      data: { phone, createdAt: NOW, updatedAt: NOW },
    });

    const user = await client.user.findUniqueOrThrow({ where: { phone } });
    const admin = await client.admin.findUniqueOrThrow({ where: { phone } });

    expect(user.id).not.toBe(admin.id);
    expect(user.phone).toBe(admin.phone);
  });

  it("does not let a customer OTP authenticate Admin for the same phone", async () => {
    const phone = testPhone(90, 2);
    const client = requirePrisma();
    const customerStore = createPrismaOtpVerificationStore(client);
    const adminStore = createPrismaAdminOtpVerificationStore(client);

    await client.admin.create({
      data: { phone, createdAt: NOW, updatedAt: NOW },
    });
    await client.otpChallenge.create({
      data: {
        phone,
        purpose: OTP_PURPOSE_CUSTOMER,
        codeHash: hashOtpCode(CODE, SECRET),
        expiresAt: new Date(NOW.getTime() + 5 * 60 * 1000),
        sentAt: NOW,
        createdAt: NOW,
        failedAttemptCount: 0,
      },
    });

    const adminResult = await verifyAdminOtp({
      phoneNumber: phone,
      code: CODE,
      now: NOW,
      otpHashSecret: SECRET,
      store: adminStore,
      log: () => undefined,
    });
    const customerResult = await verifyOtp({
      phoneNumber: phone,
      code: CODE,
      now: NOW,
      otpHashSecret: SECRET,
      store: customerStore,
      log: () => undefined,
    });

    expect(adminResult.status).toBe("rejected");
    expect(customerResult.status).toBe("authenticated");

    if (customerResult.status !== "authenticated") {
      throw new Error("Expected customer authentication.");
    }

    const customerResolved = await resolveCustomerSession({
      sessionToken: customerResult.sessionToken,
      now: NOW,
      findSession: (secretHash) =>
        customerStore.findSessionBySecretHash(secretHash),
    });
    const adminFromCustomerToken = await resolveAdminSession({
      sessionToken: customerResult.sessionToken,
      now: NOW,
      findSession: (secretHash) =>
        adminStore.findSessionBySecretHash(secretHash),
    });

    expect(customerResolved.status).toBe("authenticated");
    expect(adminFromCustomerToken.status).toBe("anonymous");
    expect(
      await client.adminSession.count({ where: { admin: { phone } } }),
    ).toBe(0);
  });

  it("does not let an admin OTP authenticate a customer for the same phone", async () => {
    const phone = testPhone(90, 3);
    const client = requirePrisma();
    const customerStore = createPrismaOtpVerificationStore(client);
    const adminStore = createPrismaAdminOtpVerificationStore(client);

    await client.admin.create({
      data: { phone, createdAt: NOW, updatedAt: NOW },
    });
    await client.otpChallenge.create({
      data: {
        phone,
        purpose: OTP_PURPOSE_ADMIN,
        codeHash: hashOtpCode(CODE, SECRET),
        expiresAt: new Date(NOW.getTime() + 5 * 60 * 1000),
        sentAt: NOW,
        createdAt: NOW,
        failedAttemptCount: 0,
      },
    });

    const customerResult = await verifyOtp({
      phoneNumber: phone,
      code: CODE,
      now: NOW,
      otpHashSecret: SECRET,
      store: customerStore,
      log: () => undefined,
    });
    const adminResult = await verifyAdminOtp({
      phoneNumber: phone,
      code: CODE,
      now: NOW,
      otpHashSecret: SECRET,
      store: adminStore,
      log: () => undefined,
    });

    expect(customerResult.status).toBe("rejected");
    expect(adminResult.status).toBe("authenticated");

    if (adminResult.status !== "authenticated") {
      throw new Error("Expected admin authentication.");
    }

    const adminResolved = await resolveAdminSession({
      sessionToken: adminResult.sessionToken,
      now: NOW,
      findSession: (secretHash) =>
        adminStore.findSessionBySecretHash(secretHash),
    });
    const customerFromAdminToken = await resolveCustomerSession({
      sessionToken: adminResult.sessionToken,
      now: NOW,
      findSession: (secretHash) =>
        customerStore.findSessionBySecretHash(secretHash),
    });

    expect(adminResolved.status).toBe("authenticated");
    expect(customerFromAdminToken.status).toBe("anonymous");
    expect(await client.session.count({ where: { user: { phone } } })).toBe(0);
    expect(await client.user.count({ where: { phone } })).toBe(0);
  });

  it("keeps customer and admin session cookies resolving only through their own stores", async () => {
    const phone = testPhone(90, 4);
    const client = requirePrisma();
    const customerStore = createPrismaOtpVerificationStore(client);
    const adminStore = createPrismaAdminOtpVerificationStore(client);

    const user = await client.user.create({
      data: { phone, createdAt: NOW, updatedAt: NOW },
    });
    const admin = await client.admin.create({
      data: { phone, createdAt: NOW, updatedAt: NOW },
    });

    const customerToken = generateSessionToken();
    const adminToken = generateSessionToken();
    const expiresAt = sessionExpiresAt(NOW);

    await client.session.create({
      data: {
        userId: user.id,
        secretHash: hashSessionToken(customerToken),
        expiresAt,
        createdAt: NOW,
      },
    });
    await client.adminSession.create({
      data: {
        adminId: admin.id,
        secretHash: hashSessionToken(adminToken),
        expiresAt,
        createdAt: NOW,
      },
    });

    const customerFromCustomer = await resolveCustomerSession({
      sessionToken: customerToken,
      now: NOW,
      findSession: (secretHash) =>
        customerStore.findSessionBySecretHash(secretHash),
    });
    const adminFromAdmin = await resolveAdminSession({
      sessionToken: adminToken,
      now: NOW,
      findSession: (secretHash) =>
        adminStore.findSessionBySecretHash(secretHash),
    });
    const customerFromAdminCookie = await resolveCustomerSession({
      sessionToken: adminToken,
      now: NOW,
      findSession: (secretHash) =>
        customerStore.findSessionBySecretHash(secretHash),
    });
    const adminFromCustomerCookie = await resolveAdminSession({
      sessionToken: customerToken,
      now: NOW,
      findSession: (secretHash) =>
        adminStore.findSessionBySecretHash(secretHash),
    });

    expect(customerFromCustomer).toMatchObject({
      status: "authenticated",
      userId: user.id,
      phone,
    });
    expect(adminFromAdmin).toMatchObject({
      status: "authenticated",
      adminId: admin.id,
      phone,
    });
    expect(customerFromAdminCookie.status).toBe("anonymous");
    expect(adminFromCustomerCookie.status).toBe("anonymous");
  });

  it("enforces unique Admin phone and AdminSession secret hash", async () => {
    const phone = testPhone(90, 5);
    const client = requirePrisma();
    const admin = await client.admin.create({
      data: { phone, createdAt: NOW, updatedAt: NOW },
    });

    await expect(
      client.admin.create({
        data: { phone, createdAt: NOW, updatedAt: NOW },
      }),
    ).rejects.toThrow();

    const secretHash = hashSessionToken(generateSessionToken());

    await client.adminSession.create({
      data: {
        adminId: admin.id,
        secretHash,
        expiresAt: sessionExpiresAt(NOW),
        createdAt: NOW,
      },
    });

    await expect(
      client.adminSession.create({
        data: {
          adminId: admin.id,
          secretHash,
          expiresAt: sessionExpiresAt(NOW),
          createdAt: NOW,
        },
      }),
    ).rejects.toThrow();
  });
});
