import { describe, expect, it, vi } from "vitest";

import { adminSessionCookieOptions } from "@/modules/auth/sessions/admin-session-cookie";
import { authenticateOtpChallenge } from "@/modules/auth/otp/authenticate-otp";
import { customerSessionCookieOptions } from "@/modules/auth/sessions/customer-session-cookie";
import { hashOtpCode } from "@/modules/auth/otp/otp-hash";
import {
  OTP_PURPOSE_ADMIN,
  OTP_PURPOSE_CUSTOMER,
} from "@/modules/auth/otp/otp-purpose";
import { resolveAdminSession } from "@/modules/auth/sessions/resolve-admin-session";
import { resolveCustomerSession } from "@/modules/auth/sessions/resolve-customer-session";
import {
  ADMIN_SESSION_COOKIE_NAME,
  CUSTOMER_SESSION_COOKIE_NAME,
} from "@/modules/auth/sessions/session-policy";
import {
  generateSessionToken,
  hashSessionToken,
} from "@/modules/auth/sessions/session-token";
import { verifyAdminOtp } from "@/modules/auth/otp/verify-admin-otp";
import { verifyOtp } from "@/modules/auth/otp/verify-otp";
import type {
  AdminOtpVerificationStore,
  OtpVerificationStore,
} from "@/modules/auth/otp/otp-verification-store";

const SECRET = "test-otp-hash-secret-0123456789ab";
const CODE = "042817";
const NOW = new Date("2026-10-05T12:00:00.000Z");
const PHONE = "+989121234567";

describe("customer and admin session boundaries", () => {
  it("uses separate stable cookie names and matching cookie attributes", () => {
    expect(CUSTOMER_SESSION_COOKIE_NAME).toBe("vidora_customer_session");
    expect(ADMIN_SESSION_COOKIE_NAME).toBe("vidora_admin_session");
    expect(CUSTOMER_SESSION_COOKIE_NAME).not.toBe(ADMIN_SESSION_COOKIE_NAME);

    expect(customerSessionCookieOptions("production")).toEqual({
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      path: "/",
      maxAge: 30 * 24 * 60 * 60,
    });
    expect(adminSessionCookieOptions("production")).toEqual(
      customerSessionCookieOptions("production"),
    );
    expect(adminSessionCookieOptions("development").secure).toBe(false);
  });

  it("does not resolve an Admin from a customer session hash", async () => {
    const token = generateSessionToken();
    const secretHash = hashSessionToken(token);

    const customer = await resolveCustomerSession({
      sessionToken: token,
      now: NOW,
      findSession: async (hash) => {
        expect(hash).toBe(secretHash);

        return {
          userId: "user-1",
          phone: PHONE,
          expiresAt: new Date(NOW.getTime() + 60_000),
        };
      },
    });
    const admin = await resolveAdminSession({
      sessionToken: token,
      now: NOW,
      findSession: async () => null,
    });

    expect(customer.status).toBe("authenticated");
    expect(admin.status).toBe("anonymous");
  });

  it("does not resolve a Customer from an Admin session hash", async () => {
    const token = generateSessionToken();
    const secretHash = hashSessionToken(token);

    const admin = await resolveAdminSession({
      sessionToken: token,
      now: NOW,
      findSession: async (hash) => {
        expect(hash).toBe(secretHash);

        return {
          adminId: "admin-1",
          phone: PHONE,
          expiresAt: new Date(NOW.getTime() + 60_000),
        };
      },
    });
    const customer = await resolveCustomerSession({
      sessionToken: token,
      now: NOW,
      findSession: async () => null,
    });

    expect(admin.status).toBe("authenticated");
    expect(customer.status).toBe("anonymous");
  });

  it("keeps customer and admin OTP purposes non-interchangeable for the same phone", async () => {
    const customerChallengeId = "challenge-customer";
    const adminChallengeId = "challenge-admin";
    const codeHash = hashOtpCode(CODE, SECRET);

    const customerOutcome = await authenticateOtpChallenge({
      phone: PHONE,
      code: CODE,
      now: NOW,
      otpHashSecret: SECRET,
      sessionSecretHash: hashSessionToken(generateSessionToken()),
      sessionExpiresAt: new Date(NOW.getTime() + 60_000),
      mutations: {
        async listChallenges() {
          return [
            {
              id: customerChallengeId,
              phone: PHONE,
              codeHash,
              createdAt: NOW,
              expiresAt: new Date(NOW.getTime() + 5 * 60 * 1000),
              failedAttemptCount: 0,
              consumedAt: null,
              sentAt: NOW,
              supersededAt: null,
            },
          ];
        },
        async incrementFailedAttempt() {
          return null;
        },
        async consumeChallenge() {
          return true;
        },
        async resolveAccountId() {
          return "user-1";
        },
        async createSession() {},
      },
    });

    const adminAgainstCustomerChallenge = await authenticateOtpChallenge({
      phone: PHONE,
      code: CODE,
      now: NOW,
      otpHashSecret: SECRET,
      sessionSecretHash: hashSessionToken(generateSessionToken()),
      sessionExpiresAt: new Date(NOW.getTime() + 60_000),
      mutations: {
        async listChallenges() {
          // Admin verification only lists admin-purpose rows. A customer
          // challenge for the same phone is absent from this set.
          return [];
        },
        async incrementFailedAttempt() {
          return null;
        },
        async consumeChallenge() {
          return true;
        },
        async resolveAccountId() {
          return "admin-1";
        },
        async createSession() {},
      },
    });

    const adminOutcome = await authenticateOtpChallenge({
      phone: PHONE,
      code: CODE,
      now: NOW,
      otpHashSecret: SECRET,
      sessionSecretHash: hashSessionToken(generateSessionToken()),
      sessionExpiresAt: new Date(NOW.getTime() + 60_000),
      mutations: {
        async listChallenges() {
          return [
            {
              id: adminChallengeId,
              phone: PHONE,
              codeHash,
              createdAt: NOW,
              expiresAt: new Date(NOW.getTime() + 5 * 60 * 1000),
              failedAttemptCount: 0,
              consumedAt: null,
              sentAt: NOW,
              supersededAt: null,
            },
          ];
        },
        async incrementFailedAttempt() {
          return null;
        },
        async consumeChallenge() {
          return true;
        },
        async resolveAccountId() {
          return "admin-1";
        },
        async createSession() {},
      },
    });

    expect(customerOutcome).toMatchObject({
      status: "authenticated",
      accountId: "user-1",
      challengeId: customerChallengeId,
    });
    expect(adminAgainstCustomerChallenge.status).toBe("rejected");
    expect(adminOutcome).toMatchObject({
      status: "authenticated",
      accountId: "admin-1",
      challengeId: adminChallengeId,
    });
  });

  it("rejects customer verification when the store only has an admin purpose", async () => {
    const store: OtpVerificationStore = {
      async completeAuthentication(params) {
        expect(params.purpose).toBe(OTP_PURPOSE_CUSTOMER);

        return { status: "rejected" };
      },
      async findSessionBySecretHash() {
        return null;
      },
    };

    const result = await verifyOtp({
      phoneNumber: PHONE,
      code: CODE,
      now: NOW,
      otpHashSecret: SECRET,
      store,
      log: () => undefined,
    });

    expect(result.status).toBe("rejected");
  });

  it("rejects admin verification when no Admin account exists after a matching code", async () => {
    const completeAuthentication = vi.fn(async (params) => {
      expect(params.purpose).toBe(OTP_PURPOSE_ADMIN);

      return { status: "rejected" as const };
    });
    const store: AdminOtpVerificationStore = {
      completeAuthentication,
      async findSessionBySecretHash() {
        return null;
      },
    };

    const result = await verifyAdminOtp({
      phoneNumber: PHONE,
      code: CODE,
      now: NOW,
      otpHashSecret: SECRET,
      store,
      log: () => undefined,
    });

    expect(result.status).toBe("rejected");
    expect(completeAuthentication).toHaveBeenCalledOnce();
  });
});
