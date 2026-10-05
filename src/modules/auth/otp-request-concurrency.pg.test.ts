/**
 * Opt-in PostgreSQL check for OTP request advisory locks.
 * Excluded from `pnpm test` and CI. Run with `pnpm test:pg`.
 * Deletes only the rows this file inserts. Does not reset or truncate.
 */
import { randomInt } from "node:crypto";
import { isIP } from "node:net";
import { PrismaPg } from "@prisma/adapter-pg";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import { PrismaClient } from "@/generated/prisma/client";
import { loadLocalEnvFiles } from "@/lib/env/load-local-env-files";
import { createPrismaOtpRequestStore } from "@/modules/auth/prisma-otp-request-store";
import type { OtpRequestStore } from "@/modules/auth/otp-request-store";
import { OTP_PURPOSE_CUSTOMER } from "@/modules/auth/otp-purpose";
import { selectActiveOtpChallenge } from "@/modules/auth/select-active-otp-challenge";

loadLocalEnvFiles({ nodeEnv: "development" });

const CODE_HASH = "ab".repeat(32);
const run = randomInt(0, 0x10000);
const createdPhones: string[] = [];

let prisma: PrismaClient | undefined;
let store: OtpRequestStore | undefined;

function assertLocalDevelopmentDatabase(connectionString: string): void {
  const url = new URL(connectionString);
  const host = url.hostname.replace(/^\[|\]$/g, "");
  const local = host === "localhost" || host === "127.0.0.1" || host === "::1";

  if (!local) {
    throw new Error(
      `OTP concurrency test refuses non-local database host ${host}.`,
    );
  }

  if (url.pathname.toLowerCase().includes("prod")) {
    throw new Error(
      "OTP concurrency test refuses a database name containing prod.",
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

function testIp(tag: number): string {
  const value = `2001:db8:${run.toString(16).padStart(4, "0")}::${tag.toString(16)}`;

  if (isIP(value) === 0 || value.length > 45) {
    throw new Error("Test IP is not a single bounded address.");
  }

  return value;
}

function reserve(phone: string, clientIp: string, now: Date) {
  if (!store) {
    throw new Error("OTP request store is not connected.");
  }

  return store.reserve({
    phone,
    purpose: OTP_PURPOSE_CUSTOMER,
    clientIp,
    codeHash: CODE_HASH,
    expiresAt: new Date(now.getTime() + 5 * 60 * 1000),
    now,
  });
}

async function cleanup(): Promise<void> {
  if (!prisma || createdPhones.length === 0) {
    return;
  }

  const phones = [...new Set(createdPhones)];

  await prisma.otpChallenge.deleteMany({
    where: { phone: { in: phones } },
  });
  await prisma.otpRequestEvent.deleteMany({
    where: { phone: { in: phones } },
  });

  const challenges = await prisma.otpChallenge.count({
    where: { phone: { in: phones } },
  });
  const events = await prisma.otpRequestEvent.count({
    where: { phone: { in: phones } },
  });

  if (challenges !== 0 || events !== 0) {
    throw new Error("OTP concurrency cleanup left verification rows behind.");
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
  store = createPrismaOtpRequestStore(prisma);
});

afterEach(async () => {
  await cleanup();
});

afterAll(async () => {
  await cleanup();
  await prisma?.$disconnect();
});

describe("OTP request concurrency on local PostgreSQL", () => {
  it("does not let concurrent requests for one phone exceed 5 per hour", async () => {
    const now = new Date("2026-10-02T08:00:00.000Z");
    const phone = testPhone(70, 0);
    const clientIp = testIp(1);

    await prisma?.otpRequestEvent.createMany({
      data: Array.from({ length: 4 }, () => ({
        phone,
        clientIp,
        createdAt: now,
      })),
    });

    const firstWave = await Promise.all(
      Array.from({ length: 12 }, () => reserve(phone, clientIp, now)),
    );

    expect(
      firstWave.filter((result) => result.status === "accepted"),
    ).toHaveLength(1);
    expect(
      firstWave.filter((result) => result.status === "cooldown"),
    ).toHaveLength(11);
    expect(await prisma?.otpRequestEvent.count({ where: { phone } })).toBe(5);

    await prisma?.otpChallenge.deleteMany({ where: { phone } });

    const secondWave = await Promise.all(
      Array.from({ length: 12 }, () => reserve(phone, clientIp, now)),
    );

    expect(
      secondWave.every(
        (result) =>
          result.status === "rate_limited" && result.scope === "phone",
      ),
    ).toBe(true);
    expect(await prisma?.otpRequestEvent.count({ where: { phone } })).toBe(5);
  });

  it("does not let concurrent requests for one IP exceed 20 per hour", async () => {
    const now = new Date("2026-10-02T09:00:00.000Z");
    const clientIp = testIp(2);
    const phones = Array.from({ length: 40 }, (_, index) =>
      testPhone(71, index),
    );

    const results = await Promise.all(
      phones.map((phone) => reserve(phone, clientIp, now)),
    );

    expect(
      results.filter((result) => result.status === "accepted"),
    ).toHaveLength(20);
    expect(
      results.filter(
        (result) => result.status === "rate_limited" && result.scope === "ip",
      ),
    ).toHaveLength(20);
    expect(
      await prisma?.otpRequestEvent.count({
        where: { phone: { in: phones } },
      }),
    ).toBe(20);
  });

  it("serializes the first reservation for one phone", async () => {
    const now = new Date("2026-10-02T10:00:00.000Z");
    const phone = testPhone(72, 0);
    const clientIp = testIp(3);
    const results = await Promise.all(
      Array.from({ length: 12 }, () => reserve(phone, clientIp, now)),
    );

    expect(
      results.filter((result) => result.status === "accepted"),
    ).toHaveLength(1);
    expect(
      results.filter((result) => result.status === "cooldown"),
    ).toHaveLength(11);
    expect(await prisma?.otpRequestEvent.count({ where: { phone } })).toBe(1);
    expect(await prisma?.otpChallenge.count({ where: { phone } })).toBe(1);
  });

  it("blocks an older delivered challenge while a newer challenge is pending", async () => {
    const phone = testPhone(73, 0);
    const clientIp = testIp(4);
    const firstAt = new Date("2026-10-02T11:00:00.000Z");
    const resendAt = new Date(firstAt.getTime() + 60_000);
    const first = await reserve(phone, clientIp, firstAt);

    expect(first.status).toBe("accepted");

    if (first.status !== "accepted" || !store || !prisma) {
      throw new Error("Expected the first reservation to be accepted.");
    }

    const reserved = await prisma.otpChallenge.findMany({ where: { phone } });

    expect(reserved).toHaveLength(1);
    expect(reserved[0]?.sentAt).toBeNull();
    expect(
      selectActiveOtpChallenge({
        challenges: reserved,
        phone,
        now: firstAt,
      }),
    ).toBeNull();

    await store.recordChallengeDelivery({
      phone,
      purpose: OTP_PURPOSE_CUSTOMER,
      challengeId: first.challengeId,
      sentAt: firstAt,
    });
    await store.deleteUnsentChallenge(first.challengeId);

    const delivered = await prisma.otpChallenge.findMany({ where: { phone } });

    expect(delivered).toHaveLength(1);
    expect(
      selectActiveOtpChallenge({
        challenges: delivered,
        phone,
        now: firstAt,
      })?.id,
    ).toBe(first.challengeId);

    const second = await reserve(phone, clientIp, resendAt);

    expect(second.status).toBe("accepted");

    if (second.status !== "accepted") {
      throw new Error("Expected the failed-send reservation to be accepted.");
    }

    await store.deleteUnsentChallenge(second.challengeId);

    const afterFailure = await prisma.otpChallenge.findMany({
      where: { phone },
    });

    expect(afterFailure).toHaveLength(1);
    expect(afterFailure[0]).toMatchObject({
      id: first.challengeId,
      sentAt: firstAt,
      supersededAt: null,
    });
    expect(
      selectActiveOtpChallenge({
        challenges: afterFailure,
        phone,
        now: resendAt,
      })?.id,
    ).toBe(first.challengeId);

    const replacementAt = new Date(resendAt.getTime() + 60_000);
    const replacement = await reserve(phone, clientIp, replacementAt);

    expect(replacement.status).toBe("accepted");

    if (replacement.status !== "accepted") {
      throw new Error("Expected the replacement reservation to be accepted.");
    }

    const whileReserved = await prisma.otpChallenge.findMany({
      where: { phone },
    });

    expect(whileReserved).toHaveLength(2);
    expect(
      selectActiveOtpChallenge({
        challenges: whileReserved,
        phone,
        now: replacementAt,
      }),
    ).toBeNull();

    const pendingExpired = whileReserved.map((row) => {
      if (row.id !== replacement.challengeId) {
        return row;
      }

      return {
        ...row,
        expiresAt: new Date(replacementAt.getTime() - 1),
      };
    });

    expect(
      selectActiveOtpChallenge({
        challenges: pendingExpired,
        phone,
        now: replacementAt,
      })?.id,
    ).toBe(first.challengeId);

    await store.recordChallengeDelivery({
      phone,
      purpose: OTP_PURPOSE_CUSTOMER,
      challengeId: replacement.challengeId,
      sentAt: replacementAt,
    });

    const beforeSupersede = await prisma.otpChallenge.findMany({
      where: { phone },
    });
    const earlier = beforeSupersede.find((row) => row.id === first.challengeId);

    expect(earlier?.supersededAt).toBeNull();
    expect(earlier?.sentAt).toEqual(firstAt);
    expect(
      selectActiveOtpChallenge({
        challenges: beforeSupersede,
        phone,
        now: replacementAt,
      })?.id,
    ).toBe(replacement.challengeId);

    await store.supersedePreviousChallenges({
      phone,
      purpose: OTP_PURPOSE_CUSTOMER,
      keptChallengeId: replacement.challengeId,
      supersededAt: replacementAt,
    });

    const rows = await prisma.otpChallenge.findMany({ where: { phone } });
    const previous = rows.find((row) => row.id === first.challengeId);
    const current = rows.find((row) => row.id === replacement.challengeId);

    expect(rows).toHaveLength(2);
    expect(previous?.supersededAt).toEqual(replacementAt);
    expect(current).toMatchObject({
      sentAt: replacementAt,
      supersededAt: null,
    });
    expect(
      selectActiveOtpChallenge({
        challenges: rows,
        phone,
        now: replacementAt,
      })?.id,
    ).toBe(replacement.challengeId);

    await prisma.otpChallenge.update({
      where: { id: replacement.challengeId },
      data: { consumedAt: replacementAt },
    });

    const afterUse = await prisma.otpChallenge.findMany({ where: { phone } });

    expect(
      selectActiveOtpChallenge({
        challenges: afterUse,
        phone,
        now: new Date(replacementAt.getTime() + 1_000),
      }),
    ).toBeNull();
  });
});
