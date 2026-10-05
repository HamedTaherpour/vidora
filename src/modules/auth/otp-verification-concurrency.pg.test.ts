/**
 * Opt-in PostgreSQL check for OTP consumption and first-login races.
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
  createPrismaOtpVerificationStore,
  resolveCustomerUserId,
} from "@/modules/auth/prisma-otp-verification-store";
import { resolveCustomerSession } from "@/modules/auth/resolve-customer-session";
import { SESSION_LIFETIME_MS } from "@/modules/auth/session-policy";
import {
  generateSessionToken,
  hashSessionToken,
} from "@/modules/auth/session-token";
import { verifyOtp } from "@/modules/auth/verify-otp";

loadLocalEnvFiles({ nodeEnv: "development" });

const SECRET = "test-otp-hash-secret-0123456789ab";
const CODE = "042817";
const NOW = new Date("2026-10-02T12:00:00.000Z");
const run = randomInt(0, 0x10000);
const createdPhones: string[] = [];

let prisma: PrismaClient | undefined;

function assertLocalDevelopmentDatabase(connectionString: string): void {
  const url = new URL(connectionString);
  const host = url.hostname.replace(/^\[|\]$/g, "");
  const local = host === "localhost" || host === "127.0.0.1" || host === "::1";

  if (!local) {
    throw new Error(
      `OTP verification test refuses non-local database host ${host}.`,
    );
  }

  if (url.pathname.toLowerCase().includes("prod")) {
    throw new Error(
      "OTP verification test refuses a database name containing prod.",
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
    throw new Error("OTP verification test is not connected.");
  }

  return prisma;
}

async function cleanup(): Promise<void> {
  if (!prisma || createdPhones.length === 0) {
    return;
  }

  const phones = [...new Set(createdPhones)];

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

  const users = await prisma.user.count({ where: { phone: { in: phones } } });
  const challenges = await prisma.otpChallenge.count({
    where: { phone: { in: phones } },
  });
  const sessions = await prisma.session.count({
    where: { user: { phone: { in: phones } } },
  });

  if (users !== 0 || challenges !== 0 || sessions !== 0) {
    throw new Error("OTP verification cleanup left rows behind.");
  }
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

describe("OTP verification on local PostgreSQL", () => {
  it("lets only one of two concurrent correct submissions consume the challenge", async () => {
    const phone = testPhone(80, 1);
    const client = requirePrisma();
    const store = createPrismaOtpVerificationStore(client);

    await client.otpChallenge.create({
      data: {
        phone,
        codeHash: hashOtpCode(CODE, SECRET),
        expiresAt: new Date(NOW.getTime() + 5 * 60 * 1000),
        sentAt: NOW,
        createdAt: NOW,
        failedAttemptCount: 0,
      },
    });

    const results = await Promise.all([
      verifyOtp({
        phoneNumber: phone,
        code: CODE,
        now: NOW,
        otpHashSecret: SECRET,
        store,
        log: () => undefined,
      }),
      verifyOtp({
        phoneNumber: phone,
        code: CODE,
        now: NOW,
        otpHashSecret: SECRET,
        store,
        log: () => undefined,
      }),
    ]);
    const authenticated = results.filter(
      (result) => result.status === "authenticated",
    );
    const challenge = await client.otpChallenge.findFirstOrThrow({
      where: { phone },
    });
    const users = await client.user.findMany({ where: { phone } });
    const sessions = await client.session.findMany({
      where: { user: { phone } },
    });

    expect(results.map((result) => result.status).sort()).toEqual([
      "authenticated",
      "rejected",
    ]);
    expect(challenge.consumedAt).not.toBeNull();
    expect(users).toHaveLength(1);
    expect(sessions).toHaveLength(1);

    const success = authenticated[0];

    if (!success || success.status !== "authenticated") {
      throw new Error("Expected one authenticated result.");
    }

    expect(sessions[0]?.secretHash).toBe(
      hashSessionToken(success.sessionToken),
    );
    expect(sessions[0]?.secretHash).not.toBe(success.sessionToken);
    expect(JSON.stringify(sessions)).not.toContain(success.sessionToken);
    expect(sessions[0]?.expiresAt.toISOString()).toBe(
      new Date(NOW.getTime() + SESSION_LIFETIME_MS).toISOString(),
    );

    const restored = await resolveCustomerSession({
      sessionToken: success.sessionToken,
      now: NOW,
      findSession: (secretHash) => store.findSessionBySecretHash(secretHash),
    });
    const expired = await resolveCustomerSession({
      sessionToken: success.sessionToken,
      now: new Date(NOW.getTime() + SESSION_LIFETIME_MS),
      findSession: (secretHash) => store.findSessionBySecretHash(secretHash),
    });
    const unknown = await resolveCustomerSession({
      sessionToken: generateSessionToken(),
      now: NOW,
      findSession: (secretHash) => store.findSessionBySecretHash(secretHash),
    });

    expect(restored.status).toBe("authenticated");
    expect(expired.status).toBe("anonymous");
    expect(unknown.status).toBe("anonymous");
    expect(
      (
        await client.session.findFirstOrThrow({
          where: { user: { phone } },
        })
      ).expiresAt.toISOString(),
    ).toBe(new Date(NOW.getTime() + SESSION_LIFETIME_MS).toISOString());
  });

  it("creates one user when two first logins race", async () => {
    const phone = testPhone(80, 2);
    const client = requirePrisma();
    const ids = await Promise.all([
      client.$transaction((tx) => resolveCustomerUserId(tx, phone, NOW)),
      client.$transaction((tx) => resolveCustomerUserId(tx, phone, NOW)),
    ]);
    const users = await client.user.findMany({ where: { phone } });

    expect(users).toHaveLength(1);
    expect(ids[0]).toBe(users[0]?.id);
    expect(ids[1]).toBe(users[0]?.id);
  });

  it("rejects a duplicate session secret hash", async () => {
    const phone = testPhone(80, 3);
    const client = requirePrisma();
    const userId = await client.$transaction((tx) =>
      resolveCustomerUserId(tx, phone, NOW),
    );
    const secretHash = hashSessionToken(generateSessionToken());

    await client.session.create({
      data: {
        userId,
        secretHash,
        expiresAt: new Date(NOW.getTime() + SESSION_LIFETIME_MS),
        createdAt: NOW,
      },
    });

    await expect(
      client.session.create({
        data: {
          userId,
          secretHash,
          expiresAt: new Date(NOW.getTime() + SESSION_LIFETIME_MS),
          createdAt: NOW,
        },
      }),
    ).rejects.toThrow();
    expect(await client.session.count({ where: { userId } })).toBe(1);
  });
});
