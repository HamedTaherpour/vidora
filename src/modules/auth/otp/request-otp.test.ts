import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";

import { reservationFromRows } from "@/modules/auth/otp/decide-otp-request";
import { hashOtpCode } from "@/modules/auth/otp/otp-hash";
import { OTP_LIFETIME_MS } from "@/modules/auth/otp/otp-policy";
import {
  OTP_PURPOSE_CUSTOMER,
  type OtpPurpose,
} from "@/modules/auth/otp/otp-purpose";
import type {
  OtpRequestStore,
  ReserveOtpRequestParams,
} from "@/modules/auth/otp/otp-request-store";
import {
  requestOtp,
  type OtpRequestLogEvent,
  type RequestOtpResult,
} from "@/modules/auth/otp/request-otp";
import { selectActiveOtpChallenge } from "@/modules/auth/otp/select-active-otp-challenge";
import type { SmsProvider } from "@/modules/auth/providers/sms-provider";

const SECRET = "test-otp-hash-secret-0123456789ab";
const CODE = "042817";
const IP = "203.0.113.10";
const START = new Date("2026-10-01T12:00:00.000Z");
const CANONICAL_PHONE = "+989121234567";

type StoredChallenge = {
  id: string;
  phone: string;
  purpose: OtpPurpose;
  codeHash: string;
  expiresAt: Date;
  failedAttemptCount: number;
  consumedAt: Date | null;
  sentAt: Date | null;
  supersededAt: Date | null;
  createdAt: Date;
};

type StoredEvent = {
  phone: string;
  clientIp: string;
  createdAt: Date;
};

type MemoryStore = OtpRequestStore & {
  challenges: StoredChallenge[];
  events: StoredEvent[];
  reserveCalls: ReserveOtpRequestParams[];
};

function createMemoryStore(): MemoryStore {
  const challenges: StoredChallenge[] = [];
  const events: StoredEvent[] = [];
  const reserveCalls: ReserveOtpRequestParams[] = [];
  let queue = Promise.resolve();

  function exclusive<T>(work: () => Promise<T>): Promise<T> {
    const run = queue.then(work, work);
    queue = run.then(
      () => undefined,
      () => undefined,
    );

    return run;
  }

  return {
    challenges,
    events,
    reserveCalls,
    reserve(params) {
      return exclusive(async () => {
        reserveCalls.push(params);

        const decision = reservationFromRows({
          now: params.now,
          challenges: challenges.filter(
            (challenge) =>
              challenge.phone === params.phone &&
              challenge.purpose === params.purpose,
          ),
          phoneRequestTimes: events
            .filter((event) => event.phone === params.phone)
            .map((event) => event.createdAt),
          ipRequestTimes: events
            .filter((event) => event.clientIp === params.clientIp)
            .map((event) => event.createdAt),
        });

        if (decision.status !== "accepted") {
          return decision;
        }

        const id = randomUUID();
        challenges.push({
          id,
          phone: params.phone,
          purpose: params.purpose,
          codeHash: params.codeHash,
          expiresAt: params.expiresAt,
          failedAttemptCount: 0,
          consumedAt: null,
          sentAt: null,
          supersededAt: null,
          createdAt: params.now,
        });
        events.push({
          phone: params.phone,
          clientIp: params.clientIp,
          createdAt: params.now,
        });

        return { status: "accepted", challengeId: id };
      });
    },
    async deleteUnsentChallenge(challengeId) {
      const index = challenges.findIndex((challenge) => {
        return (
          challenge.id === challengeId &&
          challenge.sentAt === null &&
          challenge.consumedAt === null &&
          challenge.supersededAt === null
        );
      });

      if (index >= 0) {
        challenges.splice(index, 1);
      }
    },
    recordChallengeDelivery({ phone, purpose, challengeId, sentAt }) {
      return exclusive(async () => {
        const challenge = challenges.find((row) => {
          return (
            row.id === challengeId &&
            row.phone === phone &&
            row.purpose === purpose
          );
        });

        if (!challenge) {
          throw new Error("OTP challenge to deliver was not found.");
        }

        if (challenge.consumedAt) {
          throw new Error("OTP challenge to deliver was already consumed.");
        }

        if (!challenge.sentAt) {
          challenge.sentAt = sentAt;
        }
      });
    },
    supersedePreviousChallenges({
      phone,
      purpose,
      keptChallengeId,
      supersededAt,
    }) {
      return exclusive(async () => {
        const kept = challenges.find((challenge) => {
          return (
            challenge.id === keptChallengeId &&
            challenge.phone === phone &&
            challenge.purpose === purpose
          );
        });

        if (!kept) {
          throw new Error("OTP challenge to activate was not found.");
        }

        if (kept.consumedAt) {
          throw new Error("OTP challenge to activate was already consumed.");
        }

        if (!kept.sentAt) {
          throw new Error("OTP challenge to activate was not delivered.");
        }

        for (const challenge of challenges) {
          if (
            challenge.phone !== phone ||
            challenge.purpose !== purpose ||
            challenge.id === kept.id
          ) {
            continue;
          }

          if (challenge.consumedAt || challenge.supersededAt) {
            continue;
          }

          if (challenge.expiresAt.getTime() <= supersededAt.getTime()) {
            continue;
          }

          if (challenge.createdAt.getTime() > kept.createdAt.getTime()) {
            continue;
          }

          challenge.supersededAt = supersededAt;
        }
      });
    },
  };
}

function phoneAt(index: number): string {
  return `0912${String(index).padStart(7, "0")}`;
}

function createHarness() {
  const store = createMemoryStore();
  const sent: Array<{ phone: string; code: string }> = [];
  const logs: OtpRequestLogEvent[] = [];
  let sendError: Error | null = null;
  let duringSend: (() => void) | null = null;
  const codes: string[] = [];
  const generateCode = () => codes.shift() ?? CODE;

  const smsProvider: SmsProvider = {
    async sendOtp(params) {
      duringSend?.();

      if (sendError) {
        throw sendError;
      }

      sent.push(params);
    },
  };

  async function ask({
    phoneNumber,
    now = START,
    clientIp = IP,
    otpHashSecret = SECRET,
  }: {
    phoneNumber: string;
    now?: Date;
    clientIp?: string;
    otpHashSecret?: string;
  }): Promise<RequestOtpResult> {
    return requestOtp({
      phoneNumber,
      clientIp,
      now,
      otpHashSecret,
      smsProvider,
      store,
      generateCode,
      providerName: "fake",
      log: (event) => {
        logs.push(event);
      },
    });
  }

  return {
    store,
    sent,
    logs,
    ask,
    failSend(error: Error) {
      sendError = error;
    },
    allowSend() {
      sendError = null;
    },
    duringSend(callback: () => void) {
      duringSend = callback;
    },
    queueCode(code: string) {
      codes.push(code);
    },
  };
}

function selectedChallenge(
  harness: ReturnType<typeof createHarness>,
  now: Date,
) {
  return selectActiveOtpChallenge({
    challenges: harness.store.challenges,
    phone: CANONICAL_PHONE,
    now,
  });
}

describe("requestOtp", () => {
  it.each([
    ["09 form", "09121234567"],
    ["98 form", "989121234567"],
    ["+98 form", "+989121234567"],
  ])(
    "accepts a valid %s and stores the canonical phone",
    async (_label, phoneNumber) => {
      const harness = createHarness();
      const result = await harness.ask({ phoneNumber });

      expect(result).toEqual({
        status: "accepted",
        expiresInSeconds: 300,
        resendCooldownSeconds: 60,
      });
      expect(harness.sent).toEqual([{ phone: CANONICAL_PHONE, code: CODE }]);
      expect(harness.store.challenges).toHaveLength(1);
      expect(harness.store.challenges[0]).toMatchObject({
        phone: CANONICAL_PHONE,
        purpose: OTP_PURPOSE_CUSTOMER,
        codeHash: hashOtpCode(CODE, SECRET),
        failedAttemptCount: 0,
        consumedAt: null,
        sentAt: START,
        createdAt: START,
        expiresAt: new Date(START.getTime() + OTP_LIFETIME_MS),
      });
      expect(harness.store.challenges[0]?.codeHash).not.toBe(CODE);
      expect(harness.store.challenges[0]).not.toHaveProperty("userId");
      expect(harness.store.events).toEqual([
        { phone: CANONICAL_PHONE, clientIp: IP, createdAt: START },
      ]);
      expect(harness.store.reserveCalls[0]).not.toHaveProperty("code");
      expect(harness.store.reserveCalls[0]?.purpose).toBe(OTP_PURPOSE_CUSTOMER);
      expect(
        Object.values(harness.store.reserveCalls[0] ?? {}).includes(CODE),
      ).toBe(false);
      expect(JSON.stringify(result)).not.toContain(CODE);
      expect(JSON.stringify(harness.logs)).not.toContain(CODE);
      expect(JSON.stringify(harness.logs)).not.toContain(SECRET);
      expect(JSON.stringify(harness.logs)).not.toContain(CANONICAL_PHONE);
      expect(JSON.stringify(harness.logs)).not.toContain(
        harness.store.challenges[0]?.codeHash,
      );
    },
  );

  it("sends a cryptographically generated 6-digit code", async () => {
    const harness = createHarness();

    await expect(
      requestOtp({
        phoneNumber: "09121234567",
        clientIp: IP,
        now: START,
        otpHashSecret: SECRET,
        smsProvider: {
          async sendOtp(params) {
            harness.sent.push(params);
          },
        },
        store: harness.store,
        providerName: "fake",
        log: (event) => {
          harness.logs.push(event);
        },
      }),
    ).resolves.toMatchObject({ status: "accepted" });

    expect(harness.sent[0]?.code).toMatch(/^\d{6}$/);
    expect(harness.store.challenges[0]?.codeHash).toBe(
      hashOtpCode(harness.sent[0]?.code ?? "", SECRET),
    );
  });

  it("rejects an invalid phone before creating a challenge or sending SMS", async () => {
    const harness = createHarness();
    const phoneNumber = "0912123456";
    const result = await harness.ask({ phoneNumber });

    expect(result).toEqual({ status: "invalid_phone" });
    expect(JSON.stringify(result)).not.toContain(phoneNumber);
    expect(harness.sent).toHaveLength(0);
    expect(harness.store.challenges).toHaveLength(0);
    expect(harness.store.events).toHaveLength(0);
    expect(harness.store.reserveCalls).toHaveLength(0);
  });

  it("treats equivalent phone forms as one cooldown", async () => {
    const harness = createHarness();

    await expect(
      harness.ask({ phoneNumber: "09121234567", now: START }),
    ).resolves.toMatchObject({ status: "accepted" });

    const duringCooldown = await harness.ask({
      phoneNumber: "989121234567",
      now: new Date(START.getTime() + 59_000),
    });

    expect(duringCooldown.status).toBe("cooldown");
    if (duringCooldown.status === "cooldown") {
      expect(duringCooldown.retryAfterSeconds).toBe(1);
    }

    expect(harness.sent).toHaveLength(1);
    expect(harness.store.challenges).toHaveLength(1);
    expect(harness.store.events).toHaveLength(1);

    await expect(
      harness.ask({
        phoneNumber: "+989121234567",
        now: new Date(START.getTime() + 60_000),
      }),
    ).resolves.toMatchObject({ status: "accepted" });
    expect(harness.sent).toHaveLength(2);
  });

  it("does not keep cooldown for an expired, consumed, or older challenge", async () => {
    const harness = createHarness();
    harness.store.challenges.push(
      {
        id: "expired",
        phone: CANONICAL_PHONE,
        purpose: OTP_PURPOSE_CUSTOMER,
        codeHash: "ab".repeat(32),
        createdAt: new Date(START.getTime() - 30_000),
        expiresAt: new Date(START.getTime() - 1_000),
        failedAttemptCount: 0,
        consumedAt: null,
        sentAt: new Date(START.getTime() - 30_000),
        supersededAt: null,
      },
      {
        id: "consumed",
        phone: CANONICAL_PHONE,
        purpose: OTP_PURPOSE_CUSTOMER,
        codeHash: "cd".repeat(32),
        createdAt: new Date(START.getTime() - 10_000),
        expiresAt: new Date(START.getTime() + 60_000),
        failedAttemptCount: 1,
        consumedAt: new Date(START.getTime() - 1_000),
        sentAt: new Date(START.getTime() - 10_000),
        supersededAt: null,
      },
      {
        id: "older-than-cooldown",
        phone: CANONICAL_PHONE,
        purpose: OTP_PURPOSE_CUSTOMER,
        codeHash: "ef".repeat(32),
        createdAt: new Date(START.getTime() - 120_000),
        expiresAt: new Date(START.getTime() + 180_000),
        failedAttemptCount: 0,
        consumedAt: null,
        sentAt: new Date(START.getTime() - 120_000),
        supersededAt: null,
      },
    );

    await expect(
      harness.ask({ phoneNumber: "09121234567" }),
    ).resolves.toMatchObject({ status: "accepted" });
    expect(harness.sent).toHaveLength(1);
    expect(
      harness.store.challenges.find(
        (challenge) => challenge.id === "older-than-cooldown",
      )?.supersededAt,
    ).toEqual(START);
    expect(
      harness.store.challenges.find((challenge) => challenge.id === "expired")
        ?.supersededAt,
    ).toBeNull();
    expect(
      harness.store.challenges.find((challenge) => challenge.id === "consumed")
        ?.supersededAt,
    ).toBeNull();
  });

  it("enforces 5 requests per phone per rolling hour", async () => {
    const harness = createHarness();
    let now = START;

    for (let count = 0; count < 5; count += 1) {
      await expect(
        harness.ask({ phoneNumber: "09121234567", now }),
      ).resolves.toMatchObject({ status: "accepted" });
      now = new Date(now.getTime() + 61_000);
    }

    const blocked = await harness.ask({ phoneNumber: "09121234567", now });

    expect(blocked).toMatchObject({
      status: "rate_limited",
      scope: "phone",
    });
    expect(harness.sent).toHaveLength(5);
    expect(harness.store.challenges).toHaveLength(5);

    const afterWindow = new Date(START.getTime() + 60 * 60 * 1000 + 1);

    await expect(
      harness.ask({ phoneNumber: "09121234567", now: afterWindow }),
    ).resolves.toMatchObject({ status: "accepted" });
  });

  it("enforces 20 requests per client IP per rolling hour", async () => {
    const harness = createHarness();

    for (let index = 0; index < 20; index += 1) {
      await expect(
        harness.ask({ phoneNumber: phoneAt(index) }),
      ).resolves.toMatchObject({ status: "accepted" });
    }

    const blocked = await harness.ask({ phoneNumber: phoneAt(20) });

    expect(blocked).toMatchObject({
      status: "rate_limited",
      scope: "ip",
    });
    expect(harness.sent).toHaveLength(20);
    expect(harness.store.events).toHaveLength(20);
  });

  it("rejects a forwarded-header list and accepts one IPv6 address", async () => {
    const harness = createHarness();

    await expect(
      harness.ask({
        phoneNumber: "09121234567",
        clientIp: "203.0.113.4, 198.51.100.8",
      }),
    ).resolves.toEqual({ status: "invalid_client_ip" });
    expect(harness.store.reserveCalls).toHaveLength(0);
    expect(harness.sent).toHaveLength(0);

    const ipv6 = "2001:db8::1";

    await expect(
      harness.ask({ phoneNumber: "09121234567", clientIp: ipv6 }),
    ).resolves.toMatchObject({ status: "accepted" });
    expect(harness.store.events[0]?.clientIp).toBe(ipv6);
  });

  it("returns a safe provider failure and does not leave a cooldown challenge", async () => {
    const harness = createHarness();
    harness.failSend(new Error(`provider down code=${CODE} key=${SECRET}`));

    const failed = await harness.ask({ phoneNumber: "09121234567" });

    expect(failed).toEqual({ status: "provider_failed" });
    expect(JSON.stringify(failed)).not.toContain(CODE);
    expect(JSON.stringify(failed)).not.toContain(SECRET);
    expect(JSON.stringify(harness.logs)).not.toContain(CODE);
    expect(JSON.stringify(harness.logs)).not.toContain(SECRET);
    expect(harness.store.challenges).toHaveLength(0);
    expect(harness.store.events).toHaveLength(1);
    expect(harness.sent).toHaveLength(0);

    harness.allowSend();

    await expect(
      harness.ask({ phoneNumber: "09121234567" }),
    ).resolves.toMatchObject({ status: "accepted" });
    expect(harness.sent).toHaveLength(1);
  });

  it("still counts failed sends toward the phone hourly limit", async () => {
    const harness = createHarness();
    harness.failSend(new Error("provider down"));
    let now = START;

    for (let count = 0; count < 5; count += 1) {
      await expect(
        harness.ask({ phoneNumber: "09121234567", now }),
      ).resolves.toEqual({ status: "provider_failed" });
      now = new Date(now.getTime() + 1_000);
    }

    harness.allowSend();

    await expect(
      harness.ask({ phoneNumber: "09121234567", now }),
    ).resolves.toMatchObject({
      status: "rate_limited",
      scope: "phone",
    });
    expect(harness.sent).toHaveLength(0);
    expect(harness.store.challenges).toHaveLength(0);
    expect(harness.store.events).toHaveLength(5);
  });

  it("reports provider failure when challenge rollback fails, without leaking the cause", async () => {
    const harness = createHarness();
    harness.failSend(new Error(`provider down ${CODE}`));
    harness.store.deleteUnsentChallenge = async () => {
      throw new Error(`rollback failed ${SECRET} ${CODE}`);
    };

    const failed = await harness.ask({ phoneNumber: "09121234567" });

    expect(failed).toEqual({ status: "provider_failed" });
    expect(JSON.stringify(failed)).not.toContain(CODE);
    expect(JSON.stringify(failed)).not.toContain(SECRET);
    expect(JSON.stringify(harness.logs)).not.toContain(CODE);
    expect(JSON.stringify(harness.logs)).not.toContain("rollback failed");
    expect(harness.logs.map((event) => event.outcome)).toContain(
      "challenge_rollback_failed",
    );
    expect(harness.store.challenges).toHaveLength(1);

    harness.allowSend();

    await expect(
      harness.ask({
        phoneNumber: "09121234567",
        now: new Date(START.getTime() + 1_000),
      }),
    ).resolves.toMatchObject({ status: "cooldown" });
    expect(harness.sent).toHaveLength(0);
  });

  it("serializes two simultaneous requests for the same phone", async () => {
    const harness = createHarness();
    const [first, second] = await Promise.all([
      harness.ask({ phoneNumber: "09121234567" }),
      harness.ask({ phoneNumber: "989121234567" }),
    ]);

    expect([first.status, second.status].sort()).toEqual([
      "accepted",
      "cooldown",
    ]);
    expect(harness.sent).toHaveLength(1);
    expect(harness.store.challenges).toHaveLength(1);
    expect(harness.store.events).toHaveLength(1);
  });

  it("does not persist a code when the hash secret or generator is invalid", async () => {
    const harness = createHarness();

    await expect(
      harness.ask({
        phoneNumber: "09121234567",
        otpHashSecret: "short-secret",
      }),
    ).rejects.toThrow("OTP_HASH_SECRET must be at least 32 characters.");
    expect(harness.store.challenges).toHaveLength(0);
    expect(harness.sent).toHaveLength(0);

    await expect(
      requestOtp({
        phoneNumber: "09121234567",
        clientIp: IP,
        now: START,
        otpHashSecret: SECRET,
        smsProvider: {
          async sendOtp(params) {
            harness.sent.push(params);
          },
        },
        store: harness.store,
        generateCode: () => "not-an-otp",
        log: (event) => {
          harness.logs.push(event);
        },
      }),
    ).rejects.toThrow("OTP generator returned a code that is not 6 digits.");
    expect(harness.store.challenges).toHaveLength(0);
    expect(harness.sent).toHaveLength(0);
    expect(JSON.stringify(harness.logs)).not.toContain("not-an-otp");
  });

  it("creates one active challenge on the first successful request", async () => {
    const harness = createHarness();

    await expect(
      harness.ask({ phoneNumber: "09121234567" }),
    ).resolves.toMatchObject({ status: "accepted" });

    expect(harness.store.challenges).toHaveLength(1);
    expect(selectedChallenge(harness, START)?.id).toBe(
      harness.store.challenges[0]?.id,
    );
    expect(harness.store.challenges[0]).toMatchObject({
      sentAt: START,
      supersededAt: null,
      consumedAt: null,
    });
  });

  it("leaves only the new challenge active after a successful resend", async () => {
    const harness = createHarness();
    const resendAt = new Date(START.getTime() + 60_000);
    const nextCode = "135790";

    await harness.ask({ phoneNumber: "09121234567", now: START });
    harness.queueCode(nextCode);

    await expect(
      harness.ask({ phoneNumber: "+989121234567", now: resendAt }),
    ).resolves.toMatchObject({ status: "accepted" });

    const [first, second] = harness.store.challenges;

    expect(harness.store.challenges).toHaveLength(2);
    expect(first).toMatchObject({
      sentAt: START,
      supersededAt: resendAt,
    });
    expect(second).toMatchObject({
      sentAt: resendAt,
      supersededAt: null,
      codeHash: hashOtpCode(nextCode, SECRET),
    });
    expect(selectedChallenge(harness, resendAt)?.id).toBe(second?.id);
    expect(selectedChallenge(harness, resendAt)?.id).not.toBe(first?.id);
  });

  it("keeps the previous challenge active when resend SMS fails", async () => {
    const harness = createHarness();
    const resendAt = new Date(START.getTime() + 60_000);

    await harness.ask({ phoneNumber: "09121234567", now: START });
    const firstId = harness.store.challenges[0]?.id;
    const pendingDuringSend: Array<Date | null | undefined> = [];
    const selectedDuringSend: Array<string | null> = [];
    harness.failSend(new Error("provider down"));
    harness.queueCode("246801");
    harness.duringSend(() => {
      pendingDuringSend.push(harness.store.challenges[1]?.sentAt);
      selectedDuringSend.push(selectedChallenge(harness, resendAt)?.id ?? null);
    });

    await expect(
      harness.ask({ phoneNumber: "989121234567", now: resendAt }),
    ).resolves.toEqual({ status: "provider_failed" });

    expect(pendingDuringSend).toEqual([null]);
    expect(selectedDuringSend).toEqual([null]);
    expect(harness.sent).toHaveLength(1);
    expect(harness.store.challenges).toHaveLength(1);
    expect(harness.store.challenges[0]).toMatchObject({
      id: firstId,
      sentAt: START,
      supersededAt: null,
      codeHash: hashOtpCode(CODE, SECRET),
    });
    expect(selectedChallenge(harness, resendAt)?.id).toBe(firstId);
    expect(JSON.stringify(harness.logs)).not.toContain("246801");
  });

  it("does not select a superseded challenge after the newer one ends", async () => {
    const harness = createHarness();
    const resendAt = new Date(START.getTime() + 60_000);
    const whileOldLifetimeRemains = new Date(START.getTime() + 120_000);

    await harness.ask({ phoneNumber: "09121234567", now: START });
    harness.queueCode("135790");
    await harness.ask({ phoneNumber: "09121234567", now: resendAt });

    const first = harness.store.challenges[0];
    const second = harness.store.challenges[1];

    expect(first?.expiresAt.getTime()).toBeGreaterThan(
      whileOldLifetimeRemains.getTime(),
    );
    expect(second).toBeDefined();

    if (!second) {
      throw new Error("Expected the resent challenge.");
    }

    second.consumedAt = whileOldLifetimeRemains;

    expect(selectedChallenge(harness, whileOldLifetimeRemains)).toBeNull();
    expect(first?.supersededAt).toEqual(resendAt);

    second.consumedAt = null;
    second.expiresAt = whileOldLifetimeRemains;

    expect(
      selectedChallenge(
        harness,
        new Date(whileOldLifetimeRemains.getTime() + 1),
      ),
    ).toBeNull();
  });

  it("keeps the previous challenge ineligible when post-send supersede fails", async () => {
    const harness = createHarness();
    const resendAt = new Date(START.getTime() + 60_000);
    const afterNewerEnds = new Date(START.getTime() + 4 * 60_000);

    await harness.ask({ phoneNumber: "09121234567", now: START });
    harness.store.supersedePreviousChallenges = async () => {
      throw new Error(`db down ${CODE}`);
    };
    harness.queueCode("135790");

    await expect(
      harness.ask({ phoneNumber: "09121234567", now: resendAt }),
    ).resolves.toMatchObject({ status: "accepted" });

    const [previous, delivered] = harness.store.challenges;

    expect(harness.sent).toHaveLength(2);
    expect(previous).toMatchObject({
      sentAt: START,
      supersededAt: null,
    });
    expect(delivered).toMatchObject({
      sentAt: resendAt,
      supersededAt: null,
      codeHash: hashOtpCode("135790", SECRET),
    });
    expect(selectedChallenge(harness, resendAt)?.id).toBe(delivered?.id);
    expect(harness.logs.map((event) => event.outcome)).toEqual([
      "accepted",
      "challenge_supersede_failed",
      "accepted",
    ]);
    expect(JSON.stringify(harness.logs)).not.toContain(CODE);
    expect(JSON.stringify(harness.logs)).not.toContain("135790");
    expect(JSON.stringify(harness.logs)).not.toContain("db down");

    if (!delivered || !previous) {
      throw new Error("Expected both challenges.");
    }

    expect(previous.expiresAt.getTime()).toBeGreaterThan(
      afterNewerEnds.getTime(),
    );
    delivered.consumedAt = afterNewerEnds;

    expect(selectedChallenge(harness, afterNewerEnds)).toBeNull();

    delivered.consumedAt = null;
    delivered.expiresAt = afterNewerEnds;

    expect(
      selectedChallenge(harness, new Date(afterNewerEnds.getTime() + 1)),
    ).toBeNull();
  });

  it("does not select a reserved challenge before SMS succeeds", async () => {
    const harness = createHarness();
    const seenDuringSend: Array<string | null> = [];

    harness.duringSend(() => {
      seenDuringSend.push(selectedChallenge(harness, START)?.id ?? null);
    });

    await harness.ask({ phoneNumber: "09121234567", now: START });

    const deliveredId = harness.store.challenges[0]?.id;

    expect(seenDuringSend).toEqual([null]);
    expect(harness.store.challenges[0]?.sentAt).toEqual(START);
    expect(selectedChallenge(harness, START)?.id).toBe(deliveredId);
  });

  it("blocks the previous delivered challenge while a newer challenge is pending", async () => {
    const harness = createHarness();
    const resendAt = new Date(START.getTime() + 60_000);
    const pendingDuringSend: Array<Date | null | undefined> = [];
    const selectedDuringSend: Array<string | null> = [];

    await harness.ask({ phoneNumber: "09121234567", now: START });

    harness.duringSend(() => {
      pendingDuringSend.push(harness.store.challenges[1]?.sentAt);
      selectedDuringSend.push(selectedChallenge(harness, resendAt)?.id ?? null);
    });
    harness.queueCode("135790");

    await harness.ask({ phoneNumber: "09121234567", now: resendAt });

    expect(pendingDuringSend).toEqual([null]);
    expect(selectedDuringSend).toEqual([null]);
    expect(harness.store.challenges[1]?.sentAt).toEqual(resendAt);
    expect(selectedChallenge(harness, resendAt)?.id).toBe(
      harness.store.challenges[1]?.id,
    );
  });

  it("leaves both challenges unverifiable when delivery cannot be recorded", async () => {
    const harness = createHarness();
    const resendAt = new Date(START.getTime() + 60_000);

    await harness.ask({ phoneNumber: "09121234567", now: START });
    const firstId = harness.store.challenges[0]?.id;
    harness.store.recordChallengeDelivery = async () => {
      throw new Error(`db down ${CODE}`);
    };
    harness.queueCode("135790");

    await expect(
      harness.ask({ phoneNumber: "09121234567", now: resendAt }),
    ).rejects.toThrow(
      "OTP challenge delivery could not be recorded after the SMS was sent.",
    );

    expect(harness.sent).toHaveLength(2);
    expect(harness.store.challenges[0]).toMatchObject({
      id: firstId,
      sentAt: START,
      supersededAt: null,
    });
    expect(harness.store.challenges[1]).toMatchObject({
      sentAt: null,
      supersededAt: null,
    });
    expect(selectedChallenge(harness, resendAt)).toBeNull();
    expect(harness.logs.map((event) => event.outcome)).toContain(
      "challenge_delivery_failed",
    );
    expect(JSON.stringify(harness.logs)).not.toContain(CODE);
    expect(JSON.stringify(harness.logs)).not.toContain("135790");
    expect(JSON.stringify(harness.logs)).not.toContain("db down");
  });

  it("does not allow an older OTP when a crash leaves a newer challenge pending", () => {
    const harness = createHarness();
    const pendingAt = new Date(START.getTime() + 60_000);

    harness.store.challenges.push(
      {
        id: "delivered-before-crash",
        phone: CANONICAL_PHONE,
        purpose: OTP_PURPOSE_CUSTOMER,
        codeHash: hashOtpCode(CODE, SECRET),
        createdAt: START,
        expiresAt: new Date(START.getTime() + OTP_LIFETIME_MS),
        failedAttemptCount: 0,
        consumedAt: null,
        sentAt: START,
        supersededAt: null,
      },
      {
        id: "pending-after-crash",
        phone: CANONICAL_PHONE,
        purpose: OTP_PURPOSE_CUSTOMER,
        codeHash: hashOtpCode("135790", SECRET),
        createdAt: pendingAt,
        expiresAt: new Date(pendingAt.getTime() + OTP_LIFETIME_MS),
        failedAttemptCount: 0,
        consumedAt: null,
        sentAt: null,
        supersededAt: null,
      },
    );

    expect(selectedChallenge(harness, pendingAt)).toBeNull();
    expect(
      selectActiveOtpChallenge({
        challenges: [
          {
            id: "a-delivered",
            phone: CANONICAL_PHONE,
            createdAt: pendingAt,
            expiresAt: new Date(pendingAt.getTime() + OTP_LIFETIME_MS),
            consumedAt: null,
            sentAt: pendingAt,
            supersededAt: null,
          },
          {
            id: "b-pending",
            phone: CANONICAL_PHONE,
            createdAt: pendingAt,
            expiresAt: new Date(pendingAt.getTime() + OTP_LIFETIME_MS),
            consumedAt: null,
            sentAt: null,
            supersededAt: null,
          },
        ],
        phone: CANONICAL_PHONE,
        now: pendingAt,
      }),
    ).toBeNull();
  });

  it("stops blocking after a pending challenge expires", () => {
    const pendingCreatedAt = new Date(START.getTime() + 60_000);
    const pendingExpiresAt = new Date(pendingCreatedAt.getTime() + 30_000);
    const olderExpiresAt = new Date(pendingExpiresAt.getTime() + 60_000);
    const challenges = [
      {
        id: "older-delivered",
        phone: CANONICAL_PHONE,
        createdAt: START,
        expiresAt: olderExpiresAt,
        consumedAt: null,
        sentAt: START,
        supersededAt: null,
      },
      {
        id: "newer-pending",
        phone: CANONICAL_PHONE,
        createdAt: pendingCreatedAt,
        expiresAt: pendingExpiresAt,
        consumedAt: null,
        sentAt: null,
        supersededAt: null,
      },
    ];

    expect(
      selectActiveOtpChallenge({
        challenges,
        phone: CANONICAL_PHONE,
        now: new Date(pendingExpiresAt.getTime() - 1),
      }),
    ).toBeNull();
    expect(
      selectActiveOtpChallenge({
        challenges,
        phone: CANONICAL_PHONE,
        now: pendingExpiresAt,
      })?.id,
    ).toBe("older-delivered");
    expect(
      selectActiveOtpChallenge({
        challenges,
        phone: CANONICAL_PHONE,
        now: olderExpiresAt,
      }),
    ).toBeNull();
  });

  it("does not delete a challenge after delivery was recorded", async () => {
    const harness = createHarness();

    await harness.ask({ phoneNumber: "09121234567" });
    const deliveredId = harness.store.challenges[0]?.id;

    if (!deliveredId) {
      throw new Error("Expected a delivered challenge.");
    }

    await harness.store.deleteUnsentChallenge(deliveredId);

    expect(harness.store.challenges).toHaveLength(1);
    expect(selectedChallenge(harness, START)?.id).toBe(deliveredId);
  });
});
