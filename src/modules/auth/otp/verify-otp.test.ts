import { createHash, randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";

import {
  authenticateOtpChallenge,
  otpChallengeAllowsVerificationWrite,
  type AuthenticateOtpMutations,
  type OtpVerificationChallenge,
} from "@/modules/auth/otp/authenticate-otp";
import { customerSessionCookieOptions } from "@/modules/auth/sessions/customer-session-cookie";
import { hashOtpCode } from "@/modules/auth/otp/otp-hash";
import { OTP_MAX_VERIFICATION_ATTEMPTS } from "@/modules/auth/otp/otp-policy";
import type { OtpVerificationStore } from "@/modules/auth/otp/otp-verification-store";
import { resolveCustomerSession } from "@/modules/auth/sessions/resolve-customer-session";
import {
  CUSTOMER_SESSION_COOKIE_NAME,
  SESSION_LIFETIME_MS,
  SESSION_LIFETIME_SECONDS,
  SESSION_TOKEN_PATTERN,
} from "@/modules/auth/sessions/session-policy";
import {
  generateSessionToken,
  hashSessionToken,
} from "@/modules/auth/sessions/session-token";
import {
  toPublicOtpVerificationResult,
  verifyOtp,
  type VerifyOtpLogEvent,
  type VerifyOtpResult,
} from "@/modules/auth/otp/verify-otp";

const SECRET = "test-otp-hash-secret-0123456789ab";
const CODE = "042817";
const START = new Date("2026-10-02T12:00:00.000Z");
const CANONICAL_PHONE = "+989121234567";

type MemoryUser = { id: string; phone: string };

type MemorySession = {
  accountId: string;
  secretHash: string;
  expiresAt: Date;
  createdAt: Date;
};

type MemoryStore = {
  store: OtpVerificationStore;
  challenges: OtpVerificationChallenge[];
  users: MemoryUser[];
  sessions: MemorySession[];
  authenticationCalls: number;
};

function createMemoryStore(): MemoryStore {
  const challenges: OtpVerificationChallenge[] = [];
  const users: MemoryUser[] = [];
  const sessions: MemorySession[] = [];
  let authenticationCalls = 0;

  const mutations: AuthenticateOtpMutations = {
    async listChallenges(phone) {
      return challenges
        .filter((challenge) => challenge.phone === phone)
        .map((challenge) => ({ ...challenge }));
    },
    async incrementFailedAttempt({ challengeId, phone, now }) {
      const challenge = challenges.find((row) => row.id === challengeId);

      if (
        !challenge ||
        !otpChallengeAllowsVerificationWrite(challenge, phone, now)
      ) {
        return null;
      }

      challenge.failedAttemptCount += 1;

      return challenge.failedAttemptCount;
    },
    async consumeChallenge({ challengeId, phone, now }) {
      const challenge = challenges.find((row) => row.id === challengeId);

      if (
        !challenge ||
        !otpChallengeAllowsVerificationWrite(challenge, phone, now)
      ) {
        return false;
      }

      challenge.consumedAt = now;

      return true;
    },
    async resolveAccountId(phone) {
      const existing = users.find((user) => user.phone === phone);

      if (existing) {
        return existing.id;
      }

      const id = randomUUID();

      users.push({ id, phone });

      return id;
    },
    async createSession(session) {
      sessions.push(session);
    },
  };

  return {
    challenges,
    users,
    sessions,
    get authenticationCalls() {
      return authenticationCalls;
    },
    store: {
      async completeAuthentication(params) {
        authenticationCalls += 1;

        const outcome = await authenticateOtpChallenge({
          ...params,
          mutations,
        });

        if (outcome.status === "authenticated") {
          return { status: "authenticated", accountId: outcome.accountId };
        }

        if (outcome.status === "rejected") {
          return { status: "rejected" };
        }

        return { status: outcome.status };
      },
      async findSessionBySecretHash(secretHash) {
        const session = sessions.find((row) => row.secretHash === secretHash);

        if (!session) {
          return null;
        }

        const user = users.find((row) => row.id === session.accountId);

        if (!user) {
          return null;
        }

        return {
          userId: user.id,
          phone: user.phone,
          expiresAt: session.expiresAt,
        };
      },
    },
  };
}

function addChallenge(
  memory: MemoryStore,
  overrides: Partial<OtpVerificationChallenge> & { code?: string } = {},
): OtpVerificationChallenge {
  const { code = CODE, ...rest } = overrides;
  const challenge: OtpVerificationChallenge = {
    id: randomUUID(),
    phone: CANONICAL_PHONE,
    codeHash: hashOtpCode(code, SECRET),
    createdAt: START,
    expiresAt: new Date(START.getTime() + 5 * 60 * 1000),
    failedAttemptCount: 0,
    consumedAt: null,
    sentAt: START,
    supersededAt: null,
    ...rest,
  };

  memory.challenges.push(challenge);

  return challenge;
}

async function verify(
  memory: MemoryStore,
  overrides: Partial<{
    phoneNumber: string;
    code: string;
    now: Date;
    log: (event: VerifyOtpLogEvent) => void;
  }> = {},
): Promise<VerifyOtpResult> {
  return verifyOtp({
    phoneNumber: overrides.phoneNumber ?? CANONICAL_PHONE,
    code: overrides.code ?? CODE,
    now: overrides.now ?? START,
    otpHashSecret: SECRET,
    store: memory.store,
    log: overrides.log ?? (() => undefined),
  });
}

describe("OTP verification", () => {
  it("authenticates a valid OTP and creates the customer", async () => {
    const memory = createMemoryStore();
    const challenge = addChallenge(memory);
    const result = await verify(memory, { phoneNumber: "09121234567" });

    expect(result.status).toBe("authenticated");

    if (result.status !== "authenticated") {
      return;
    }

    expect(Buffer.from(result.sessionToken, "base64url")).toHaveLength(32);
    expect(result.sessionToken).toMatch(SESSION_TOKEN_PATTERN);
    expect(result.expiresAt.toISOString()).toBe(
      new Date(START.getTime() + SESSION_LIFETIME_MS).toISOString(),
    );
    expect(memory.users).toEqual([
      { id: memory.users[0]?.id, phone: CANONICAL_PHONE },
    ]);
    expect(memory.sessions).toHaveLength(1);
    expect(memory.sessions[0]?.secretHash).toBe(
      hashSessionToken(result.sessionToken),
    );
    expect(memory.sessions[0]?.secretHash).toMatch(/^[0-9a-f]{64}$/);
    expect(memory.sessions[0]?.secretHash).not.toBe(result.sessionToken);
    expect(JSON.stringify(memory.sessions)).not.toContain(result.sessionToken);
    expect(memory.sessions[0]?.expiresAt.toISOString()).toBe(
      result.expiresAt.toISOString(),
    );
    expect(challenge.consumedAt?.toISOString()).toBe(START.toISOString());
    expect(challenge.failedAttemptCount).toBe(0);
  });

  it("reuses the existing customer for a returning phone", async () => {
    const memory = createMemoryStore();

    addChallenge(memory);
    memory.users.push({ id: "user-1", phone: CANONICAL_PHONE });

    const result = await verify(memory);

    expect(result.status).toBe("authenticated");
    expect(memory.users).toEqual([{ id: "user-1", phone: CANONICAL_PHONE }]);
    expect(memory.sessions.map((session) => session.accountId)).toEqual([
      "user-1",
    ]);
  });

  it("increments failed attempts and does not reset them", async () => {
    const memory = createMemoryStore();
    const challenge = addChallenge(memory);

    expect((await verify(memory, { code: "000000" })).status).toBe(
      "invalid_code",
    );
    expect((await verify(memory, { code: "000001" })).status).toBe(
      "invalid_code",
    );
    expect(challenge.failedAttemptCount).toBe(2);
    expect(challenge.consumedAt).toBeNull();
    expect(memory.users).toHaveLength(0);
    expect(memory.sessions).toHaveLength(0);
  });

  it("accepts the correct code while failed attempts remain below 5", async () => {
    const memory = createMemoryStore();
    const challenge = addChallenge(memory, { failedAttemptCount: 4 });

    expect((await verify(memory)).status).toBe("authenticated");
    expect(challenge.failedAttemptCount).toBe(4);
    expect(challenge.consumedAt?.toISOString()).toBe(START.toISOString());
  });

  it("disables the challenge on the 5th wrong OTP", async () => {
    const memory = createMemoryStore();
    const challenge = addChallenge(memory);

    for (
      let attempt = 1;
      attempt < OTP_MAX_VERIFICATION_ATTEMPTS;
      attempt += 1
    ) {
      expect((await verify(memory, { code: "000000" })).status).toBe(
        "invalid_code",
      );
    }

    expect((await verify(memory, { code: "000000" })).status).toBe(
      "attempt_limit",
    );
    expect(challenge.failedAttemptCount).toBe(OTP_MAX_VERIFICATION_ATTEMPTS);
    expect((await verify(memory)).status).toBe("attempt_limit");
    expect(challenge.failedAttemptCount).toBe(OTP_MAX_VERIFICATION_ATTEMPTS);
    expect(challenge.consumedAt).toBeNull();
    expect(memory.sessions).toHaveLength(0);
  });

  it("rejects an expired challenge", async () => {
    const memory = createMemoryStore();
    const challenge = addChallenge(memory, { expiresAt: START });

    expect((await verify(memory)).status).toBe("rejected");
    expect(challenge.consumedAt).toBeNull();
    expect(challenge.failedAttemptCount).toBe(0);
  });

  it("rejects a superseded challenge", async () => {
    const memory = createMemoryStore();
    const superseded = addChallenge(memory, {
      id: "00000000-0000-4000-8000-000000000001",
      code: CODE,
      createdAt: START,
      supersededAt: START,
    });

    addChallenge(memory, {
      id: "00000000-0000-4000-8000-000000000002",
      code: "222222",
      createdAt: new Date(START.getTime() + 1000),
      consumedAt: START,
    });

    expect((await verify(memory)).status).toBe("rejected");
    expect(superseded.consumedAt).toBeNull();
    expect(superseded.failedAttemptCount).toBe(0);
    expect(memory.sessions).toHaveLength(0);
  });

  it("rejects a pending challenge", async () => {
    const memory = createMemoryStore();
    const pending = addChallenge(memory, { sentAt: null });

    expect((await verify(memory)).status).toBe("rejected");
    expect(pending.sentAt).toBeNull();
    expect(pending.consumedAt).toBeNull();
    expect(pending.failedAttemptCount).toBe(0);
  });

  it("rejects a consumed challenge", async () => {
    const memory = createMemoryStore();
    const consumed = addChallenge(memory, { consumedAt: START });

    expect((await verify(memory)).status).toBe("rejected");
    expect(memory.sessions).toHaveLength(0);
    expect(consumed.failedAttemptCount).toBe(0);
  });

  it("does not accept the same OTP twice", async () => {
    const memory = createMemoryStore();

    addChallenge(memory);
    expect((await verify(memory)).status).toBe("authenticated");
    expect((await verify(memory)).status).toBe("rejected");
    expect(memory.sessions).toHaveLength(1);
    expect(memory.users).toHaveLength(1);
  });

  it("checks only the currently selected challenge", async () => {
    const memory = createMemoryStore();
    const older = addChallenge(memory, {
      id: "00000000-0000-4000-8000-000000000001",
      code: "111111",
      createdAt: START,
    });
    const selected = addChallenge(memory, {
      id: "00000000-0000-4000-8000-000000000002",
      code: "222222",
      createdAt: new Date(START.getTime() + 1000),
    });
    const pending = addChallenge(memory, {
      id: "00000000-0000-4000-8000-000000000003",
      code: CODE,
      createdAt: new Date(START.getTime() + 2000),
      sentAt: null,
      expiresAt: new Date(START.getTime() - 1000),
    });

    expect((await verify(memory, { code: "111111" })).status).toBe(
      "invalid_code",
    );
    expect(older.failedAttemptCount).toBe(0);
    expect(older.consumedAt).toBeNull();
    expect(selected.failedAttemptCount).toBe(1);
    expect(selected.consumedAt).toBeNull();
    expect(pending.failedAttemptCount).toBe(0);
    expect((await verify(memory, { code: "222222" })).status).toBe(
      "authenticated",
    );
    expect(selected.consumedAt?.toISOString()).toBe(START.toISOString());
    expect(older.consumedAt).toBeNull();
  });

  it("does not fall back to an older code while a pending resend blocks it", async () => {
    const memory = createMemoryStore();
    const older = addChallenge(memory, {
      id: "00000000-0000-4000-8000-000000000001",
      createdAt: START,
    });

    addChallenge(memory, {
      id: "00000000-0000-4000-8000-000000000002",
      code: "999999",
      createdAt: new Date(START.getTime() + 1000),
      sentAt: null,
    });

    expect((await verify(memory)).status).toBe("rejected");
    expect(older.consumedAt).toBeNull();
    expect(older.failedAttemptCount).toBe(0);
    expect(memory.sessions).toHaveLength(0);
  });

  it("rejects an invalid phone without verifying a challenge", async () => {
    const memory = createMemoryStore();

    addChallenge(memory);

    const events: VerifyOtpLogEvent[] = [];
    const result = await verify(memory, {
      phoneNumber: "123",
      log: (event) => events.push(event),
    });

    expect(result).toEqual({ status: "invalid_phone" });
    expect(memory.authenticationCalls).toBe(0);
    expect(events).toEqual([
      { operation: "otp_verify", outcome: "invalid_phone" },
    ]);
  });

  it("does not log the OTP, its hash, the hash secret, or the session token", async () => {
    const memory = createMemoryStore();
    const challenge = addChallenge(memory);
    const events: VerifyOtpLogEvent[] = [];
    const result = await verify(memory, {
      log: (event) => events.push(event),
    });

    expect(result.status).toBe("authenticated");

    if (result.status !== "authenticated") {
      return;
    }

    const serialized = JSON.stringify(events);

    expect(serialized).not.toContain(CODE);
    expect(serialized).not.toContain(SECRET);
    expect(serialized).not.toContain(challenge.codeHash);
    expect(serialized).not.toContain(result.sessionToken);
    expect(serialized).not.toContain(hashSessionToken(result.sessionToken));
  });
});

describe("customer session", () => {
  it("restores a valid token and does not extend expiry", async () => {
    const memory = createMemoryStore();

    addChallenge(memory);

    const result = await verify(memory);

    if (result.status !== "authenticated") {
      throw new Error("Expected authentication to succeed.");
    }

    const first = await resolveCustomerSession({
      sessionToken: result.sessionToken,
      now: START,
      findSession: (secretHash) =>
        memory.store.findSessionBySecretHash(secretHash),
    });
    const later = new Date(START.getTime() + 60_000);
    const second = await resolveCustomerSession({
      sessionToken: result.sessionToken,
      now: later,
      findSession: (secretHash) =>
        memory.store.findSessionBySecretHash(secretHash),
    });

    expect(first).toEqual({
      status: "authenticated",
      userId: memory.users[0]?.id,
      phone: CANONICAL_PHONE,
      expiresAt: result.expiresAt,
    });
    expect(second.status).toBe("authenticated");
    expect(memory.sessions[0]?.expiresAt.toISOString()).toBe(
      result.expiresAt.toISOString(),
    );
  });

  it("rejects an expired session and a token that is not stored", async () => {
    const memory = createMemoryStore();
    const token = generateSessionToken();

    memory.users.push({ id: "user-1", phone: CANONICAL_PHONE });
    memory.sessions.push({
      accountId: "user-1",
      secretHash: hashSessionToken(token),
      expiresAt: START,
      createdAt: new Date(START.getTime() - SESSION_LIFETIME_MS),
    });

    expect(
      (
        await resolveCustomerSession({
          sessionToken: token,
          now: START,
          findSession: (secretHash) =>
            memory.store.findSessionBySecretHash(secretHash),
        })
      ).status,
    ).toBe("anonymous");
    expect(
      (
        await resolveCustomerSession({
          sessionToken: generateSessionToken(),
          now: START,
          findSession: (secretHash) =>
            memory.store.findSessionBySecretHash(secretHash),
        })
      ).status,
    ).toBe("anonymous");
    expect(
      (
        await resolveCustomerSession({
          sessionToken: null,
          now: START,
          findSession: (secretHash) =>
            memory.store.findSessionBySecretHash(secretHash),
        })
      ).status,
    ).toBe("anonymous");
  });

  it("stores SHA-256 of the cookie token", () => {
    const token = generateSessionToken();

    expect(Buffer.from(token, "base64url")).toHaveLength(32);
    expect(hashSessionToken(token)).toBe(
      createHash("sha256").update(token, "utf8").digest("hex"),
    );
    expect(hashSessionToken(token)).not.toBe(token);
  });
});

describe("customer session cookie", () => {
  it("uses the approved cookie attributes", () => {
    expect(CUSTOMER_SESSION_COOKIE_NAME).toBe("vidora_customer_session");
    expect(customerSessionCookieOptions("production")).toEqual({
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      path: "/",
      maxAge: SESSION_LIFETIME_SECONDS,
    });
    expect(customerSessionCookieOptions("development")).toMatchObject({
      secure: false,
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60,
    });
    expect(customerSessionCookieOptions("production")).not.toHaveProperty(
      "domain",
    );
  });

  it("omits the raw session token from the JSON verification result", async () => {
    const memory = createMemoryStore();

    addChallenge(memory);

    const result = await verify(memory);
    const body = toPublicOtpVerificationResult(result);

    expect(result.status).toBe("authenticated");

    if (result.status !== "authenticated") {
      return;
    }

    expect(body).toEqual({
      status: "authenticated",
      expiresAt: result.expiresAt.toISOString(),
    });
    expect(JSON.stringify(body)).not.toContain(result.sessionToken);
    expect(Object.keys(body).sort()).toEqual(["expiresAt", "status"]);
  });
});
